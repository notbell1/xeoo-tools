import { BACKEND_URL } from "../../config/backend";

export type ScamRiskLevel = "low" | "suspicious" | "high" | "dangerous";

export type CheckStatus = "pass" | "warning" | "danger" | "info";

export type ScamCheckItem = {
  key: string;
  label: string;
  status: CheckStatus;
  detail: string;
};

export type ScamLinkResult = {
  url: string;
  hostname: string;

  risk: {
    score: number;
    level: ScamRiskLevel;
    label: string;
    summary: string;
  };

  threat?: {
    detected: boolean;
    service: "available" | "unavailable" | "error";
    message?: string;
  };

  brandImpersonated?: string | null;
  detectedModus?: string[];
  recommendations?: string[];

  urlAnalysis: {
    https: boolean;
    ipHost: boolean;
    punycode: boolean;
    userInfo: boolean;
    suspiciousPath: boolean;
    excessiveSubdomains: boolean;
    encodedCharacters: boolean;
    unicodeHost: boolean;
    shortlink?: boolean;
    suspiciousTld?: boolean;
    specialCharsInHost?: boolean;
  };

  checks: ScamCheckItem[];
};

export type ScamCheckResponse = {
  success: boolean;
  message?: string;
  data?: ScamLinkResult;
};

export function normalizeUrlInput(value: string): string {
  const trimmed = value.trim().replace(/^[\s'"(<]+|[\s'")>]+$/g, "");

  if (!trimmed) {
    return "";
  }

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function extractHostname(value: string): string {
  const normalized = normalizeUrlInput(value);
  if (!normalized) return "";

  const withoutScheme = normalized.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, "");
  const withoutUser = withoutScheme.includes("@")
    ? withoutScheme.split("@").pop() || withoutScheme
    : withoutScheme;

  const hostPart = withoutUser.split("/")[0].split("?")[0].split("#")[0];
  return hostPart.replace(/:(\d+)$/, "").toLowerCase().trim();
}

/**
 * Local Fallback Detection Engine (in case of backend network failure)
 */
function evaluateClientSide(input: string): ScamLinkResult {
  const normalized = normalizeUrlInput(input);
  const hostname = extractHostname(normalized);

  const isHttps = normalized.startsWith("https://");
  const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const hasPunycode = hostname.includes("xn--");
  const hasUnicodeHost = /[^\x00-\x7F]/.test(hostname);
  const hasUserInfo = normalized.includes("@");
  const hasSpecialChars = /[&$_+=!]/.test(hostname);

  const decodedHost = hostname
    .replace(/4/g, "a")
    .replace(/@/g, "a")
    .replace(/0/g, "o")
    .replace(/3/g, "e")
    .replace(/1/g, "i")
    .replace(/!/g, "i")
    .replace(/5/g, "s")
    .replace(/\$/g, "s")
    .replace(/&/g, "and")
    .replace(/_/g, "");

  const fullTarget = (decodedHost + " " + normalized).toLowerCase();

  const shortlinkDomains = [
    "bit.ly", "s.id", "tinyurl.com", "is.gd", "cutt.ly", "rb.gy", "shorturl.at",
    "linktr.ee", "heylink.me", "wa.me", "t.me"
  ];
  const isShortlink = shortlinkDomains.some((s) => hostname === s || hostname.endsWith("." + s));

  const suspiciousTlds = ["cc", "top", "xyz", "tk", "ml", "ga", "cf", "gq", "buzz", "vip", "work", "icu", "site", "online", "club"];
  const tld = hostname.split(".").pop() || "";
  const hasSuspiciousTld = suspiciousTlds.includes(tld);

  const officialDomains = [
    "bca.co.id", "klikbca.com", "bri.co.id", "bni.co.id", "bankmandiri.co.id",
    "banksinarmas.com", "sinarmas.co.id", "dana.id", "ovo.id", "gopay.co.id",
    "shopee.co.id", "tokopedia.com", "jet.co.id", "jne.co.id", "sicepat.com",
    "jobstreet.co.id", "jobstreet.com", "glints.com", "instagram.com", "facebook.com",
    "google.com", "kemensos.go.id", "prakerja.go.id"
  ];

  const isOfficial = hostname.endsWith(".go.id") || officialDomains.some((d) => hostname === d || hostname.endsWith("." + d));

  let score = 0;
  const checks: ScamCheckItem[] = [];
  const detectedModus: string[] = [];
  const recommendations: string[] = [];
  let brandImpersonated: string | null = null;

  if (isOfficial) {
    score = 0;
    checks.push({
      key: "officialDomain",
      label: "Verified Official Domain",
      status: "pass",
      detail: "This domain is verified as an authentic official portal.",
    });
    recommendations.push("This domain is a verified authentic website.");
  } else {
    // Brand impersonation check
    const brandMap: Record<string, string[]> = {
      "Bank Sinarmas": ["sinarmas", "sinarm4s", "bank_sinarmas"],
      "Bank Central Asia (BCA)": ["bca", "klikbca", "blubybcadigital"],
      "Bank BRI": ["bri", "brimo", "bankbri"],
      "Bank BNI": ["bni", "bankbni"],
      "Bank Mandiri": ["mandiri", "livin"],
      "DANA Indonesia": ["dana", "danakaget", "dana-kaget"],
      "J&T Express": ["j&t", "jnt", "expre$s", "express", "j&t_express"],
      "JNE Express": ["jne", "jne-express"],
      "JobStreet": ["jobstreet", "job-street", "job_street"],
      "Kemensos / Bansos": ["kemensos", "bansos", "bpum", "prakerja", "blt"],
      "Instagram": ["instagram", "ig-", "fotopicture", "f0topicture", "b0tnet"],
    };

    for (const [brand, aliases] of Object.entries(brandMap)) {
      if (aliases.some((a) => decodedHost.includes(a) || (isShortlink && normalized.toLowerCase().includes(a)))) {
        brandImpersonated = brand;
        score += 55;
        checks.push({
          key: "brandImpersonation",
          label: "Brand Impersonation / Spoofing",
          status: "danger",
          detail: `This URL impersonates '${brand}' on an unofficial domain.`,
        });
        recommendations.push(`Warning! This is NOT an official ${brand} website. NEVER enter login credentials, passwords, PINs, or OTPs.`);
        break;
      }
    }

    // Modus Checks
    if (/hadiah|giveaway|undian|spin|winner|dana-kaget|klaim|bantuan|bansos|blt|bpum/i.test(fullTarget)) {
      detectedModus.push("Fake Giveaway, Lottery & Social Aid Scam");
      score += 25;
      recommendations.push("Do not trust prize or aid claims that request upfront administrative fees or deposits.");
    }

    if (/cekresi|cek-resi|lacak-resi|resi|paket|kurir|paket-tertahan|ongkir/i.test(fullTarget)) {
      detectedModus.push("Fake Courier Tracking & Package Scam");
      score += 25;
      recommendations.push("Track packages exclusively on official courier apps. Never download unknown APK files.");
    }

    if (/lowongan|low0ng4n|loker|karir|recruitment|kerja-part-time/i.test(fullTarget)) {
      detectedModus.push("Fake Job Recruitment & Task Scam");
      score += 25;
      recommendations.push("Legitimate job recruiters never demand upfront deposits or paid follow/like tasks.");
    }

    if (/sanggahan|pengaduan|copyright|appeal|banned|fotopicture|f0topicture|b0tnet|botnet/i.test(fullTarget)) {
      detectedModus.push("Account Appeal & Social Phishing / Botnet");
      score += 25;
      recommendations.push("Fake account suspension notices are commonly used to hijack your social media credentials.");
    }

    if (isShortlink) {
      score += 15;
      checks.push({
        key: "shortlink",
        label: "URL Shortener (Shortlink)",
        status: "warning",
        detail: "URL uses a shortlink service hiding the final destination.",
      });
    }

    if (hasSuspiciousTld) {
      score += 15;
      checks.push({
        key: "suspiciousTld",
        label: "Domain Extension (TLD)",
        status: "warning",
        detail: `Uses extension '.${tld}', commonly associated with spam and phishing campaigns.`,
      });
    }

    if (hasSpecialChars || decodedHost !== hostname) {
      score += 20;
      checks.push({
        key: "leetspeak",
        label: "Character Modification & Leetspeak",
        status: "danger",
        detail: "Domain uses altered characters or numbers substituting letters to deceive users.",
      });
    }

    if (!isHttps) {
      score += 10;
      checks.push({
        key: "https",
        label: "HTTPS Protocol",
        status: "warning",
        detail: "URL does not utilize secure HTTPS protocol.",
      });
    }
  }

  score = Math.max(0, Math.min(100, score));

  let riskLevel: ScamRiskLevel = "low";
  let riskLabel = "Low Risk / Safe";
  let riskSummary = "No suspicious scam patterns or dangerous indicators were detected on this domain.";

  if (score >= 70) {
    riskLevel = "dangerous";
    riskLabel = "Dangerous (Scam / Phishing)";
    riskSummary = "High probability of scam, fraud, or credential harvesting. DO NOT open or enter personal credentials.";
  } else if (score >= 40) {
    riskLevel = "high";
    riskLabel = "High Risk";
    riskSummary = "Multiple threat indicators detected. Exercise caution and do not perform transactions or submit sensitive data.";
  } else if (score >= 20) {
    riskLevel = "suspicious";
    riskLabel = "Suspicious";
    riskSummary = "Unusual characteristics found in this domain structure. Verify authenticity before proceeding.";
  }

  return {
    url: normalized,
    hostname,
    risk: {
      score,
      level: riskLevel,
      label: riskLabel,
      summary: riskSummary,
    },
    threat: {
      detected: score >= 70,
      service: "available",
    },
    brandImpersonated,
    detectedModus,
    recommendations: recommendations.length > 0 ? recommendations : ["Always verify the authentic domain before entering sensitive credentials."],
    urlAnalysis: {
      https: isHttps,
      ipHost: isIpHost,
      punycode: hasPunycode,
      userInfo: hasUserInfo,
      suspiciousPath: detectedModus.length > 0,
      excessiveSubdomains: hostname.split(".").length >= 4,
      encodedCharacters: false,
      unicodeHost: hasUnicodeHost,
      shortlink: isShortlink,
      suspiciousTld: hasSuspiciousTld,
      specialCharsInHost: hasSpecialChars,
    },
    checks,
  };
}

export async function checkScamLink(
  value: string,
  signal?: AbortSignal,
): Promise<ScamLinkResult> {
  const url = normalizeUrlInput(value);

  if (!url) {
    throw new Error("Enter a link or URL to inspect.");
  }

  // Try direct backend API first, then proxy fallback, and finally offline engine
  const endpoints = [
    `${BACKEND_URL}/api/scam-check.php`,
    "/php/api/scam-check.php",
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Accept: "application/json",
        },
        body: JSON.stringify({ url: value.trim() }),
        signal,
      });

      if (response.ok) {
        const result = (await response.json()) as ScamCheckResponse;
        if (result?.success && result.data) {
          return result.data;
        }
      }
    } catch (fetchError) {
      if (
        fetchError instanceof DOMException &&
        fetchError.name === "AbortError"
      ) {
        throw fetchError;
      }
      // Continue to next endpoint or fallback
    }
  }

  // Resilient heuristic client evaluation fallback
  return evaluateClientSide(value);
}

export function getRiskTone(level: ScamRiskLevel) {
  switch (level) {
    case "dangerous":
      return {
        cardBg: "border-red-500/50 bg-linear-to-br from-red-500/10 via-red-500/5 to-transparent dark:from-red-950/40 dark:via-red-950/20",
        badge: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
        accent: "text-red-600 dark:text-red-400",
        scoreColor: "text-red-600 dark:text-red-400",
        barColor: "bg-red-600",
      };

    case "high":
      return {
        cardBg: "border-orange-500/50 bg-linear-to-br from-orange-500/10 via-orange-500/5 to-transparent dark:from-orange-950/40 dark:via-orange-950/20",
        badge: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
        accent: "text-orange-600 dark:text-orange-400",
        scoreColor: "text-orange-600 dark:text-orange-400",
        barColor: "bg-orange-500",
      };

    case "suspicious":
      return {
        cardBg: "border-amber-500/50 bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-amber-950/20",
        badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        accent: "text-amber-600 dark:text-amber-400",
        scoreColor: "text-amber-600 dark:text-amber-400",
        barColor: "bg-amber-500",
      };

    case "low":
    default:
      return {
        cardBg: "border-emerald-500/50 bg-linear-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 dark:via-emerald-950/20",
        badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        accent: "text-emerald-600 dark:text-emerald-400",
        scoreColor: "text-emerald-600 dark:text-emerald-400",
        barColor: "bg-emerald-600",
      };
  }
}

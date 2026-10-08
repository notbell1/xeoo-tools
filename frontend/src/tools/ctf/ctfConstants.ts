/**
 * XeooTools — Defacement CTF Constants & Helpers
 */

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRIES: CountryInfo[] = [
  { code: "GLOBAL", name: "Global", flag: "🌐" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
];

export const COUNTRIES_LIST: CountryInfo[] = COUNTRIES;

export const COUNTRIES_MAP: Record<string, CountryInfo> = COUNTRIES.reduce((acc, c) => {
  acc[c.code] = c;
  return acc;
}, { GL: { code: "GL", name: "Global", flag: "🌐" } } as Record<string, CountryInfo>);

export function getCountryFlag(code?: string | null): string {
  if (!code) return "🌐";
  const upper = code.toUpperCase();
  if (upper === "GLOBAL" || upper === "GL") return "🌐";
  const found = COUNTRIES_MAP[upper];
  if (found) return found.flag;

  // Derive flag from 2-letter country code
  if (/^[A-Z]{2}$/.test(upper)) {
    const codePoints = upper
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }
  return "🌐";
}

export function getCountryName(code?: string | null): string {
  if (!code) return "Global";
  const upper = code.toUpperCase();
  if (upper === "GLOBAL" || upper === "GL") return "Global";
  const found = COUNTRIES_MAP[upper];
  return found ? found.name : upper;
}

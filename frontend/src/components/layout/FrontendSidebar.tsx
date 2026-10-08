import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flag,
  Grid2X2,
  House,
  Mail,
  Moon,
  Search,
  Sun,
  Wrench,
  X,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { BACKEND_URL } from "../../config/backend";
import { categories as fallbackCategories } from "../../data/categories";
import { useTools, type PublicTool } from "../../hooks/useTools";
import { getCategoryIcon, getToolIcon } from "../../lib/toolIcons";

type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "xeoo-theme";

type DatabaseCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  tool_count: number;
};

type CategoriesResponse = {
  success: boolean;
  message?: string;
  data?: DatabaseCategory[];
};

const DEFAULT_TOOLS: PublicTool[] = [
  // Math Tools
  {
    id: 1,
    name: "Calculator",
    slug: "calculator",
    description: "Practical and scientific calculator",
    icon: "calculator",
    status: "ready",
    category_id: 1,
    category_name: "Math Tools",
    category_slug: "math",
  },
  {
    id: 2,
    name: "Percentage Calculator",
    slug: "percentage-calculator",
    description: "Calculate percentages and discounts",
    icon: "percent",
    status: "ready",
    category_id: 1,
    category_name: "Math Tools",
    category_slug: "math",
  },
  // Image Tools
  {
    id: 3,
    name: "Image Compressor",
    slug: "image-compressor",
    description: "Compress photo and image file sizes",
    icon: "image",
    status: "ready",
    category_id: 2,
    category_name: "Image Tools",
    category_slug: "image",
  },
  {
    id: 4,
    name: "Image Resizer",
    slug: "image-resizer",
    description: "Change image resolution and dimensions",
    icon: "scan-line",
    status: "ready",
    category_id: 2,
    category_name: "Image Tools",
    category_slug: "image",
  },
  {
    id: 5,
    name: "Image Converter",
    slug: "image-converter",
    description: "Convert images between formats locally",
    icon: "refresh-cw",
    status: "ready",
    category_id: 2,
    category_name: "Image Tools",
    category_slug: "image",
  },
  {
    id: 6,
    name: "Image Metadata Viewer",
    slug: "image-metadata-viewer",
    description: "Inspect EXIF and metadata information",
    icon: "file-search",
    status: "ready",
    category_id: 2,
    category_name: "Image Tools",
    category_slug: "image",
  },
  // Network Tools
  {
    id: 7,
    name: "IP Lookup",
    slug: "ip-lookup",
    description: "Check IP address details and location",
    icon: "network",
    status: "ready",
    category_id: 3,
    category_name: "Network Tools",
    category_slug: "network",
  },
  {
    id: 8,
    name: "DNS Lookup",
    slug: "dns-lookup",
    description: "Check domain DNS records",
    icon: "globe",
    status: "ready",
    category_id: 3,
    category_name: "Network Tools",
    category_slug: "network",
  },
  {
    id: 36,
    name: "Reverse IP Lookup",
    slug: "reverse-ip-lookup",
    description: "Find domains and hostnames associated with an IP address",
    icon: "network",
    status: "ready",
    category_id: 3,
    category_name: "Network Tools",
    category_slug: "network",
  },
  // Security Tools
  {
    id: 9,
    name: "Password Generator",
    slug: "password-generator",
    description: "Generate strong random passwords",
    icon: "key-round",
    status: "ready",
    category_id: 4,
    category_name: "Security Tools",
    category_slug: "security",
  },
  {
    id: 10,
    name: "Scam Link Checker",
    slug: "scam-link-checker",
    description: "Check suspicious links, phishing, and scam URLs",
    icon: "shield-alert",
    status: "ready",
    category_id: 4,
    category_name: "Security Tools",
    category_slug: "security",
  },
  {
    id: 99,
    name: "WordPress Exposure Scanner",
    slug: "wordpress-exposure-scanner",
    description: "Detect exposed WordPress upload and file-manager endpoints",
    icon: "security",
    status: "ready",
    category_id: 4,
    category_name: "Security Tools",
    category_slug: "security",
  },
  {
    id: 100,
    name: "Admin Finder",
    slug: "admin-finder",
    description: "Discover publicly reachable administration and authentication surfaces",
    icon: "search",
    status: "ready",
    category_id: 4,
    category_name: "Security Tools",
    category_slug: "security",
  },
  {
    id: 101,
    name: "Subdomain Scanner",
    slug: "subdomain-scanner",
    description: "Discover public subdomains and validate their DNS records",
    icon: "network",
    status: "ready",
    category_id: 4,
    category_name: "Security Tools",
    category_slug: "security",
  },
  {
    id: 102,
    name: "Password Strength Checker",
    slug: "password-strength-checker",
    description: "Analyze password complexity, entropy, and crack time",
    icon: "security",
    status: "ready",
    category_id: 4,
    category_name: "Security Tools",
    category_slug: "security",
  },
  {
    id: 103,
    name: "Hash Generator",
    slug: "hash-generator",
    description: "Generate cryptographic hashes like SHA-256, SHA-512, MD5",
    icon: "hash",
    status: "ready",
    category_id: 4,
    category_name: "Security Tools",
    category_slug: "security",
  },
  {
    id: 104,
    name: "Hash Identifier",
    slug: "hash-identifier",
    description: "Identify cryptographic hash algorithm by length and format",
    icon: "search",
    status: "ready",
    category_id: 4,
    category_name: "Security Tools",
    category_slug: "security",
  },
  {
    id: 105,
    name: "JWT Decoder",
    slug: "jwt-decoder",
    description: "Decode and inspect JSON Web Tokens safely in browser",
    icon: "key-round",
    status: "ready",
    category_id: 4,
    category_name: "Security Tools",
    category_slug: "security",
  },
  {
    id: 106,
    name: "Random Token Generator",
    slug: "random-token-generator",
    description: "Generate cryptographically secure tokens and secret keys",
    icon: "binary",
    status: "ready",
    category_id: 4,
    category_name: "Security Tools",
    category_slug: "security",
  },
  {
    id: 107,
    name: "UUID Generator",
    slug: "uuid-generator",
    description: "Generate RFC 4122 compliant version 4 UUIDs",
    icon: "hash",
    status: "ready",
    category_id: 4,
    category_name: "Security Tools",
    category_slug: "security",
  },
  {
    id: 108,
    name: "File Hash Checker",
    slug: "file-hash-checker",
    description: "Calculate and verify file checksums locally in browser",
    icon: "file",
    status: "ready",
    category_id: 4,
    category_name: "Security Tools",
    category_slug: "security",
  },
  // Productive Tools
  {
    id: 11,
    name: "Typing Test",
    slug: "typing-test",
    description: "Test your typing speed in WPM",
    icon: "brain",
    status: "ready",
    category_id: 5,
    category_name: "Productive Tools",
    category_slug: "productive",
  },
  {
    id: 12,
    name: "QR & Barcode Generator",
    slug: "qr-barcode-generator",
    description: "Create custom QR codes and standard barcodes",
    icon: "qr-code",
    status: "ready",
    category_id: 5,
    category_name: "Productive Tools",
    category_slug: "productive",
  },
  // Health Tools
  {
    id: 13,
    name: "BMI Calculator",
    slug: "bmi-calculator",
    description: "Calculate body mass index and category",
    icon: "scale",
    status: "ready",
    category_id: 6,
    category_name: "Health Tools",
    category_slug: "health",
  },
  {
    id: 14,
    name: "Calorie & Macro Calculator",
    slug: "calorie-macro-calculator",
    description: "Calculate daily calorie and macronutrient targets",
    icon: "utensils",
    status: "ready",
    category_id: 6,
    category_name: "Health Tools",
    category_slug: "health",
  },
  {
    id: 15,
    name: "Heart Rate Zone Calculator",
    slug: "heart-rate-zone-calculator",
    description: "Calculate training heart rate training zones",
    icon: "heart",
    status: "ready",
    category_id: 6,
    category_name: "Health Tools",
    category_slug: "health",
  },
  {
    id: 16,
    name: "Sleep Calculator",
    slug: "sleep-calculator",
    description: "Calculate optimal sleep and wake up times",
    icon: "moon",
    status: "ready",
    category_id: 6,
    category_name: "Health Tools",
    category_slug: "health",
  },
  {
    id: 17,
    name: "Daily Health Metrics Tracker",
    slug: "daily-health-metrics-tracker",
    description: "Log and monitor daily health habits",
    icon: "activity",
    status: "ready",
    category_id: 6,
    category_name: "Health Tools",
    category_slug: "health",
  },
  // Psychology Tools
  {
    id: 18,
    name: "Big Five Personality Test",
    slug: "big-five-personality-test",
    description: "Assess five major personality traits",
    icon: "brain",
    status: "ready",
    category_id: 7,
    category_name: "Psychology Tools",
    category_slug: "psychology",
  },
  {
    id: 19,
    name: "Stress Level Test",
    slug: "stress-level-test",
    description: "Evaluate your current stress score",
    icon: "heart-pulse",
    status: "ready",
    category_id: 7,
    category_name: "Psychology Tools",
    category_slug: "psychology",
  },
  {
    id: 20,
    name: "Procrastination Test",
    slug: "procrastination-test",
    description: "Measure chronic procrastination habits",
    icon: "clock",
    status: "ready",
    category_id: 7,
    category_name: "Psychology Tools",
    category_slug: "psychology",
  },
  {
    id: 21,
    name: "Cognitive Distortion Checker",
    slug: "cognitive-distortion-checker",
    description: "Identify negative thought patterns",
    icon: "sparkles",
    status: "ready",
    category_id: 7,
    category_name: "Psychology Tools",
    category_slug: "psychology",
  },
  {
    id: 22,
    name: "Attachment Style Test",
    slug: "attachment-style-test",
    description: "Discover your relationship attachment style",
    icon: "users",
    status: "ready",
    category_id: 7,
    category_name: "Psychology Tools",
    category_slug: "psychology",
  },
  // Defacement Tools
  {
    id: 23,
    name: "Deface Page Generator",
    slug: "deface-page-generator",
    description: "Generate creative deface page simulations",
    icon: "skull",
    status: "ready",
    category_id: 8,
    category_name: "Defacement Tools",
    category_slug: "defacement",
  },
  {
    id: 24,
    name: "Defacement Template Builder",
    slug: "defacement-template-builder",
    description: "Interactive builder for custom deface templates",
    icon: "code-2",
    status: "ready",
    category_id: 8,
    category_name: "Defacement Tools",
    category_slug: "defacement",
  },
  {
    id: 110,
    name: "Defacement Challenge Generator",
    slug: "defacement-challenge-generator",
    description: "Create and investigate browser-first web defacement CTF forensic challenges",
    icon: "shield-alert",
    status: "ready",
    category_id: 8,
    category_name: "Defacement Tools",
    category_slug: "defacement",
  },
  // File Tools
  {
    id: 38,
    name: "ZIP Inspector",
    slug: "zip-inspector",
    description: "Inspect ZIP archive structure, files, and security metadata",
    icon: "file-archive",
    status: "ready",
    category_id: 9,
    category_name: "File Tools",
    category_slug: "file",
  },
  {
    id: 25,
    name: "File Encryptor",
    slug: "file-encryptor",
    description: "Secure client-side AES-256-GCM file encryption",
    icon: "lock-keyhole",
    status: "ready",
    category_id: 9,
    category_name: "File Tools",
    category_slug: "file",
  },
  {
    id: 110,
    name: "File Compressor",
    slug: "file-compressor",
    description: "Compress and bundle files into a ZIP archive locally",
    icon: "file-archive",
    status: "ready",
    category_id: 9,
    category_name: "File Tools",
    category_slug: "file",
  },
  {
    id: 111,
    name: "File Extractor",
    slug: "file-extractor",
    description: "Extract and download files from ZIP archives client-side",
    icon: "file-archive",
    status: "ready",
    category_id: 9,
    category_name: "File Tools",
    category_slug: "file",
  },
  {
    id: 112,
    name: "File Splitter",
    slug: "file-splitter",
    description: "Split large files into smaller parts client-side",
    icon: "file",
    status: "ready",
    category_id: 9,
    category_name: "File Tools",
    category_slug: "file",
  },
  {
    id: 113,
    name: "File Merger",
    slug: "file-merger",
    description: "Combine split chunks back into original file",
    icon: "file",
    status: "ready",
    category_id: 9,
    category_name: "File Tools",
    category_slug: "file",
  },
  {
    id: 114,
    name: "File Hash Checker",
    slug: "file-hash-checker",
    description: "Calculate SHA-256, SHA-512, MD5 checksums locally",
    icon: "hash",
    status: "ready",
    category_id: 9,
    category_name: "File Tools",
    category_slug: "file",
  },
  {
    id: 115,
    name: "File Integrity Checker",
    slug: "file-integrity-checker",
    description: "Verify file authenticity and check for corruption or tampering",
    icon: "file",
    status: "ready",
    category_id: 9,
    category_name: "File Tools",
    category_slug: "file",
  },
  {
    id: 116,
    name: "File Type Identifier",
    slug: "file-type-identifier",
    description: "Detect authentic file formats using magic bytes",
    icon: "search",
    status: "ready",
    category_id: 9,
    category_name: "File Tools",
    category_slug: "file",
  },
  {
    id: 117,
    name: "File Signature Analyzer",
    slug: "file-signature-analyzer",
    description: "Inspect hexadecimal and ASCII header bytes",
    icon: "code",
    status: "ready",
    category_id: 9,
    category_name: "File Tools",
    category_slug: "file",
  },
  {
    id: 118,
    name: "File Metadata Viewer",
    slug: "file-metadata-viewer",
    description: "Inspect standard and extended file properties client-side",
    icon: "file",
    status: "ready",
    category_id: 9,
    category_name: "File Tools",
    category_slug: "file",
  },
  {
    id: 119,
    name: "Metadata Remover",
    slug: "metadata-remover",
    description: "Strip EXIF, location tags, and metadata client-side",
    icon: "file",
    status: "ready",
    category_id: 9,
    category_name: "File Tools",
    category_slug: "file",
  },
  // SEO Tools
  {
    id: 40,
    name: "DA / PA Checker",
    slug: "da-pa-checker",
    description: "Check Domain Authority and Page Authority metrics",
    icon: "search",
    status: "ready",
    category_id: 10,
    category_name: "SEO Tools",
    category_slug: "seo",
  },
];

const STATUS_ORDER: Record<string, number> = {
  ready: 0,
  maintenance: 1,
  upcoming: 2,
};

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    const root = document.documentElement;

    if (root.classList.contains("dark")) {
      return "dark";
    }

    if (root.classList.contains("light")) {
      return "light";
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (storedTheme === "dark" || storedTheme === "light") {
      return storedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

interface FrontendSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

interface ToolGroup {
  categoryName: string;
  categorySlug: string;
  tools: PublicTool[];
}

let savedDesktopScrollTop = 0;
let savedMobileScrollTop = 0;

export default function FrontendSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: FrontendSidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const desktopNavRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const { tools: liveTools } = useTools();

  // Restore scroll positions when mounted
  useLayoutEffect(() => {
    if (desktopNavRef.current && savedDesktopScrollTop > 0) {
      desktopNavRef.current.scrollTop = savedDesktopScrollTop;
    }
  }, []);

  useLayoutEffect(() => {
    if (mobileOpen && mobileNavRef.current && savedMobileScrollTop > 0) {
      mobileNavRef.current.scrollTop = savedMobileScrollTop;
    }
  }, [mobileOpen]);

  const effectiveTools = useMemo(() => {
    if (liveTools && liveTools.length > 0) {
      return liveTools;
    }

    return DEFAULT_TOOLS;
  }, [liveTools]);

  /* -------------------------------------------------------------
     THEME
  ------------------------------------------------------------- */

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors.
    }
  }, [theme]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }

      if (event.newValue === "dark" || event.newValue === "light") {
        setTheme(event.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  /* -------------------------------------------------------------
     LOAD CATEGORIES
  ------------------------------------------------------------- */

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/categories.php?_=${Date.now()}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const result = (await response.json()) as CategoriesResponse;

        if (result.success && result.data && result.data.length > 0) {
          if (active) {
            setCategories(result.data);
          }

          return;
        }
      } catch {
        // Fallback to static data.
      }

      if (active) {
        setCategories(
          fallbackCategories.map((cat, index) => ({
            id: index + 1,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            icon: cat.slug,
            color: "slate",
            tool_count: cat.count || 0,
          })),
        );
      }
    }

    void loadCategories();

    return () => {
      active = false;
    };
  }, []);

  /* -------------------------------------------------------------
     GROUPED & SORTED TOOLS BY CATEGORY
  ------------------------------------------------------------- */

  const groupedTools = useMemo<ToolGroup[]>(() => {
    const groupsMap = new Map<string, { categoryName: string; categorySlug: string; tools: PublicTool[] }>();

    effectiveTools.forEach((tool) => {
      const slug = tool.category_slug || "other";
      const name = tool.category_name || "Other Tools";

      if (!groupsMap.has(slug)) {
        groupsMap.set(slug, {
          categoryName: name,
          categorySlug: slug,
          tools: [],
        });
      }

      groupsMap.get(slug)!.tools.push(tool);
    });

    // Sort tools inside each category: status (ready -> maintenance -> upcoming) -> name (A-Z)
    const result: ToolGroup[] = [];

    groupsMap.forEach((group) => {
      const sorted = [...group.tools].sort((a, b) => {
        const orderA = STATUS_ORDER[a.status] ?? 3;
        const orderB = STATUS_ORDER[b.status] ?? 3;

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        return a.name.localeCompare(b.name);
      });

      result.push({
        categoryName: group.categoryName,
        categorySlug: group.categorySlug,
        tools: sorted,
      });
    });

    return result;
  }, [effectiveTools]);

  /* -------------------------------------------------------------
     SEARCH FILTERING
  ------------------------------------------------------------- */

  const isSearching = searchQuery.trim().length > 0;

  const filteredGroups = useMemo<ToolGroup[]>(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) {
      return groupedTools;
    }

    return groupedTools
      .map((group) => {
        const categoryMatch =
          group.categoryName.toLowerCase().includes(q) ||
          group.categorySlug.toLowerCase().includes(q);

        const matchingTools = group.tools.filter(
          (tool) =>
            tool.name.toLowerCase().includes(q) ||
            tool.slug.toLowerCase().includes(q) ||
            tool.description?.toLowerCase().includes(q),
        );

        if (categoryMatch) {
          return group;
        }

        if (matchingTools.length > 0) {
          return {
            ...group,
            tools: matchingTools,
          };
        }

        return null;
      })
      .filter((group): group is ToolGroup => group !== null);
  }, [groupedTools, searchQuery]);

  /* -------------------------------------------------------------
     AUTO-EXPAND ACTIVE CATEGORY
  ------------------------------------------------------------- */

  useEffect(() => {
    if (!currentPath.startsWith("/tools/")) {
      return;
    }

    const currentToolSlug = currentPath.replace("/tools/", "").split("=")[0];
    const matchedTool = effectiveTools.find((t) => t.slug === currentToolSlug);

    if (matchedTool?.category_slug) {
      setCollapsedCategories((prev) => {
        if (prev[matchedTool.category_slug]) {
          return {
            ...prev,
            [matchedTool.category_slug]: false,
          };
        }
        return prev;
      });
    }
  }, [currentPath, effectiveTools]);

  // Reveal active tool gently without forcing to top if outside viewport
  useEffect(() => {
    if (!currentPath.startsWith("/tools/")) {
      return;
    }

    const currentToolSlug = currentPath.replace("/tools/", "").split("=")[0];
    if (!currentToolSlug) return;

    const navs = [desktopNavRef.current, mobileNavRef.current].filter(
      (c): c is HTMLDivElement => Boolean(c),
    );

    navs.forEach((nav) => {
      const activeLink = nav.querySelector<HTMLAnchorElement>(
        `a[href="/tools/${currentToolSlug}"]`,
      );
      if (!activeLink) return;

      const navRect = nav.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();

      // Only scroll into view if active item is outside visible area of the scroll container
      const isVisible =
        linkRect.top >= navRect.top + 8 &&
        linkRect.bottom <= navRect.bottom - 8;

      if (!isVisible) {
        activeLink.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    });
  }, [currentPath]);

  const toggleCategory = (slug: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  /* -------------------------------------------------------------
     ACTIVE ROUTE CHECKS
  ------------------------------------------------------------- */

  const isHome = currentPath === "/";
  const isCategoriesRoot = currentPath === "/categories";
  const isToolsRoot = currentPath === "/tools";
  const isReport = currentPath === "/report";
  const isContact = currentPath === "/contact";

  /* -------------------------------------------------------------
     THEME BUTTON
  ------------------------------------------------------------- */

  const renderThemeButton = (isMinimized: boolean) => {
    const isDark = theme === "dark";
    const ThemeIcon = isDark ? Sun : Moon;

    if (isMinimized) {
      return (
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-bg text-xeoo-muted shadow-xs transition-[background-color,border-color,color,transform] duration-200 hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft hover:text-xeoo-text active:scale-95"
          title={isDark ? "Switch to light theme" : "Switch to dark theme"}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          aria-pressed={isDark}
        >
          <ThemeIcon size={15} strokeWidth={2} />
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="group flex min-h-10 w-full items-center gap-2.5 rounded-lg border border-xeoo-border bg-xeoo-bg px-2.5 py-2 text-left transition-[background-color,border-color,color,transform] duration-200 hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft active:scale-[0.99]"
        title={isDark ? "Switch to light theme" : "Switch to dark theme"}
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        aria-pressed={isDark}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-text shadow-xs transition-colors duration-200">
          <ThemeIcon size={14} strokeWidth={2} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold text-xeoo-text">
            {isDark ? "Light Theme" : "Dark Theme"}
          </span>

          <span className="mt-0.5 block truncate text-[8px] text-xeoo-muted">
            {isDark ? "Switch to light mode" : "Switch to dark mode"}
          </span>
        </span>

        <span className="shrink-0 rounded-full border border-xeoo-border bg-xeoo-surface px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide text-xeoo-muted">
          {isDark ? "Dark" : "Light"}
        </span>
      </button>
    );
  };

  /* -------------------------------------------------------------
     SIDEBAR CONTENT
  ------------------------------------------------------------- */

  const renderSidebarContent = (isMobile = false) => {
    const isMinimized = !isMobile && collapsed;

    return (
      <div className="flex h-full min-h-0 flex-col bg-xeoo-surface text-xeoo-text transition-[background-color,color] duration-200">
        {/* BRAND HEADER */}
        <div
          className={[
            "relative z-20 flex h-16 shrink-0 items-center border-b border-xeoo-border transition-colors duration-200",
            isMinimized ? "justify-center px-2" : "justify-between px-4",
          ].join(" ")}
        >
          <Link
            to="/"
            onClick={isMobile ? onCloseMobile : undefined}
            className={[
              "group flex min-w-0 items-center gap-2.5 transition-opacity duration-200 hover:opacity-95",
              isMinimized ? "justify-center" : "",
            ].join(" ")}
            title="XeooTools - Free Online Tools"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-xeoo-black p-1.5 shadow-xs transition-transform duration-200 group-hover:scale-105">
              <img
                src="/xeoo-icon.svg"
                alt="XeooTools"
                className="h-full w-full object-contain"
              />
            </div>

            {!isMinimized && (
              <div className="min-w-0 leading-none">
                <div className="text-sm font-bold tracking-tight text-xeoo-text">
                  XeooTools
                </div>

                <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-xeoo-text-light">
                  Free Online Tools
                </div>
              </div>
            )}
          </Link>

          {/* Desktop minimize */}
          {!isMobile && !isMinimized && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-xeoo-muted transition-[background-color,color,transform] duration-200 hover:bg-xeoo-surface-soft hover:text-xeoo-text active:scale-95"
              title="Minimize sidebar"
              aria-label="Minimize sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {/* Mobile close */}
          {isMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xeoo-muted transition-[background-color,color,transform] duration-200 hover:bg-xeoo-surface-soft hover:text-xeoo-text active:scale-95"
              title="Close menu"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}

          {/* Minimized expand */}
          {!isMobile && isMinimized && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="absolute -right-3 top-1/2 z-30 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-xeoo-border bg-xeoo-surface text-xeoo-text shadow-md transition-[background-color,border-color,color,transform] duration-200 hover:scale-105 hover:bg-xeoo-surface-soft active:scale-95"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* SEARCH */}
        {!isMinimized && (
          <div className="shrink-0 border-b border-xeoo-border p-2.5 transition-colors duration-200">
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xeoo-muted"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search here"
                className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg py-1.5 pl-8 pr-7 text-xs text-xeoo-text outline-none transition-[background-color,border-color,color,box-shadow] duration-200 placeholder:text-xeoo-muted/70 focus:border-xeoo-primary focus:bg-xeoo-surface focus:ring-2 focus:ring-xeoo-primary/10"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xeoo-muted transition-colors duration-150 hover:text-xeoo-text"
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* SCROLLABLE NAV */}
        <div
          ref={isMobile ? mobileNavRef : desktopNavRef}
          onScroll={(e) => {
            if (!isMobile) {
              savedDesktopScrollTop = e.currentTarget.scrollTop;
            } else {
              savedMobileScrollTop = e.currentTarget.scrollTop;
            }
          }}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3"
        >
          {isMinimized ? (
            <nav
              className="flex flex-col items-center gap-1.5"
              aria-label="Main Navigation"
            >
              <Link
                to="/"
                className={[
                  "group relative flex h-10 w-10 items-center justify-center rounded-xl transition-[background-color,color,transform,box-shadow] duration-200",
                  isHome
                    ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                    : "text-xeoo-muted hover:bg-xeoo-surface-soft hover:text-xeoo-text",
                ].join(" ")}
                title="Home"
                aria-label="Home"
              >
                <House size={18} strokeWidth={2} />
              </Link>

              <Link
                to="/categories"
                className={[
                  "group relative flex h-10 w-10 items-center justify-center rounded-xl transition-[background-color,color,transform,box-shadow] duration-200",
                  currentPath.startsWith("/category") || isCategoriesRoot
                    ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                    : "text-xeoo-muted hover:bg-xeoo-surface-soft hover:text-xeoo-text",
                ].join(" ")}
                title={`Categories (${categories.length})`}
                aria-label="Categories"
              >
                <Grid2X2 size={18} strokeWidth={2} />
              </Link>

              <Link
                to="/tools"
                className={[
                  "group relative flex h-10 w-10 items-center justify-center rounded-xl transition-[background-color,color,transform,box-shadow] duration-200",
                  currentPath.startsWith("/tools") || isToolsRoot
                    ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                    : "text-xeoo-muted hover:bg-xeoo-surface-soft hover:text-xeoo-text",
                ].join(" ")}
                title={`Tools (${effectiveTools.length})`}
                aria-label="Tools"
              >
                <Wrench size={18} strokeWidth={2} />
              </Link>

              <div className="my-1.5 h-px w-6 bg-xeoo-border" />

              <Link
                to="/report"
                className={[
                  "group relative flex h-10 w-10 items-center justify-center rounded-xl transition-[background-color,color,transform,box-shadow] duration-200",
                  isReport
                    ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                    : "text-xeoo-muted hover:bg-xeoo-surface-soft hover:text-xeoo-text",
                ].join(" ")}
                title="Report Bug / Feedback"
                aria-label="Report"
              >
                <Flag size={18} strokeWidth={2} />
              </Link>

              <Link
                to="/contact"
                className={[
                  "group relative flex h-10 w-10 items-center justify-center rounded-xl transition-[background-color,color,transform,box-shadow] duration-200",
                  isContact
                    ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                    : "text-xeoo-muted hover:bg-xeoo-surface-soft hover:text-xeoo-text",
                ].join(" ")}
                title="Contact"
                aria-label="Contact"
              >
                <Mail size={18} strokeWidth={2} />
              </Link>
            </nav>
          ) : (
            <nav className="space-y-4" aria-label="Main Navigation">
              {/* MAIN */}
              <div className="space-y-1">
                <p className="px-2.5 pb-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-xeoo-muted">
                  Main Menu
                </p>

                <Link
                  to="/"
                  onClick={isMobile ? onCloseMobile : undefined}
                  className={[
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-[background-color,color,transform] duration-150",
                    isHome
                      ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                      : "text-xeoo-text hover:bg-xeoo-surface-soft",
                  ].join(" ")}
                >
                  <House size={16} strokeWidth={isHome ? 2.2 : 1.9} />
                  <span>Home</span>
                </Link>

                <Link
                  to="/categories"
                  onClick={isMobile ? onCloseMobile : undefined}
                  className={[
                    "flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold transition-[background-color,color,transform] duration-150",
                    isCategoriesRoot
                      ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                      : "text-xeoo-text hover:bg-xeoo-surface-soft",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2.5">
                    <Grid2X2
                      size={16}
                      strokeWidth={isCategoriesRoot ? 2.2 : 1.9}
                    />
                    <span>All Categories</span>
                  </div>

                  <span
                    className={[
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      isCategoriesRoot
                        ? "bg-xeoo-surface/20 text-xeoo-surface"
                        : "bg-xeoo-surface-soft text-xeoo-muted",
                    ].join(" ")}
                  >
                    {categories.length}
                  </span>
                </Link>

                <Link
                  to="/tools"
                  onClick={isMobile ? onCloseMobile : undefined}
                  className={[
                    "flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold transition-[background-color,color,transform] duration-150",
                    isToolsRoot
                      ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                      : "text-xeoo-text hover:bg-xeoo-surface-soft",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2.5">
                    <Wrench size={16} strokeWidth={isToolsRoot ? 2.2 : 1.9} />
                    <span>All Tools</span>
                  </div>

                  <span
                    className={[
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      isToolsRoot
                        ? "bg-xeoo-surface/20 text-xeoo-surface"
                        : "bg-xeoo-surface-soft text-xeoo-muted",
                    ].join(" ")}
                  >
                    {effectiveTools.length}
                  </span>
                </Link>
              </div>

              {/* TOOLS BY CATEGORY */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2.5 pb-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-xeoo-muted">
                    Tools by Category
                  </span>

                  <span className="text-[10px] font-bold text-xeoo-muted">
                    {effectiveTools.length}
                  </span>
                </div>

                {filteredGroups.length === 0 ? (
                  <p className="px-2.5 py-2 text-xs italic text-xeoo-muted">
                    No tools matching your search.
                  </p>
                ) : (
                  filteredGroups.map((group) => {
                    const isCollapsed = !isSearching && Boolean(collapsedCategories[group.categorySlug]);
                    const CategoryIcon: LucideIcon = getCategoryIcon(group.categorySlug);

                    return (
                      <div
                        key={group.categorySlug}
                        className="rounded-lg border border-xeoo-border bg-xeoo-bg/40 p-1 transition-colors duration-150"
                      >
                        {/* Category Header / Accordion Trigger */}
                        <button
                          type="button"
                          onClick={() => toggleCategory(group.categorySlug)}
                          className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs font-semibold text-xeoo-text transition-colors duration-150 hover:bg-xeoo-surface-soft"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <CategoryIcon
                              size={14}
                              strokeWidth={2}
                              className="shrink-0 text-xeoo-muted"
                            />
                            <span className="truncate">{group.categoryName}</span>
                          </div>

                          <div className="flex shrink-0 items-center gap-1.5">
                            <span className="rounded-full bg-xeoo-surface-soft px-1.5 py-0.2 text-[9px] font-bold text-xeoo-muted">
                              {group.tools.length}
                            </span>

                            <ChevronDown
                              size={13}
                              className={[
                                "text-xeoo-muted transition-transform duration-200",
                                isCollapsed ? "-rotate-90" : "rotate-0",
                              ].join(" ")}
                            />
                          </div>
                        </button>

                        {/* Category Tools List */}
                        {!isCollapsed && (
                          <div className="mt-1 space-y-0.5 pl-1.5 pr-0.5">
                            {group.tools.map((tool) => {
                              const active =
                                currentPath === `/tools/${tool.slug}` ||
                                currentPath.startsWith(`/tools/${tool.slug}`);

                              const ToolIcon: LucideIcon = getToolIcon(
                                tool.icon || tool.slug,
                              );

                              const isReady = tool.status === "ready";
                              const isUpcoming = tool.status === "upcoming";

                              if (!isReady) {
                                return (
                                  <div
                                    key={tool.id || tool.slug}
                                    aria-disabled="true"
                                    title={
                                      isUpcoming
                                        ? `${tool.name} (Upcoming - Coming Soon)`
                                        : `${tool.name} (Maintenance - Under Maintenance)`
                                    }
                                    className="group flex cursor-not-allowed select-none items-center justify-between rounded-md px-2 py-1.5 text-[11.5px] opacity-70 transition-colors duration-150"
                                  >
                                    <div className="flex min-w-0 items-center gap-2">
                                      <ToolIcon
                                        size={13}
                                        strokeWidth={1.8}
                                        className={[
                                          "shrink-0 transition-colors duration-150",
                                          isUpcoming
                                            ? "text-sky-500"
                                            : "text-amber-500",
                                        ].join(" ")}
                                      />

                                      <span className="truncate text-xeoo-muted">
                                        {tool.name}
                                      </span>
                                    </div>

                                    {isUpcoming ? (
                                      <span
                                        className="flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/10 px-1.5 py-0.5 text-[8px] font-bold text-sky-500"
                                        title="Upcoming"
                                      >
                                        <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                                        <span>Soon</span>
                                      </span>
                                    ) : (
                                      <span
                                        className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[8px] font-bold text-amber-500"
                                        title="Maintenance"
                                      >
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                        <span>Maintenance</span>
                                      </span>
                                    )}
                                  </div>
                                );
                              }

                              return (
                                <Link
                                  key={tool.id || tool.slug}
                                  to={`/tools/${tool.slug}`}
                                  onClick={isMobile ? onCloseMobile : undefined}
                                  className={[
                                    "group flex items-center justify-between rounded-md px-2 py-1.5 text-[11.5px] transition-[background-color,color,transform] duration-150",
                                    active
                                      ? "bg-xeoo-primary/10 font-bold text-xeoo-primary"
                                      : "text-xeoo-text hover:bg-xeoo-surface-soft",
                                  ].join(" ")}
                                >
                                  <div className="flex min-w-0 items-center gap-2">
                                    <ToolIcon
                                      size={13}
                                      strokeWidth={active ? 2.2 : 1.8}
                                      className={[
                                        "shrink-0 transition-colors duration-150",
                                        active
                                          ? "text-xeoo-primary"
                                          : "text-xeoo-muted",
                                      ].join(" ")}
                                    />

                                    <span className="truncate">{tool.name}</span>
                                  </div>

                                  <span
                                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                                    title="Ready"
                                  />
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* SUPPORT */}
              <div className="space-y-1">
                <p className="px-2.5 pb-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-xeoo-muted">
                  Help & Contact
                </p>

                <Link
                  to="/report"
                  onClick={isMobile ? onCloseMobile : undefined}
                  className={[
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-[background-color,color,transform] duration-150",
                    isReport
                      ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                      : "text-xeoo-text hover:bg-xeoo-surface-soft",
                  ].join(" ")}
                >
                  <Flag size={16} strokeWidth={isReport ? 2.2 : 1.9} />
                  <span>Report Problem</span>
                </Link>

                <Link
                  to="/contact"
                  onClick={isMobile ? onCloseMobile : undefined}
                  className={[
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-[background-color,color,transform] duration-150",
                    isContact
                      ? "bg-xeoo-text text-xeoo-surface shadow-xs"
                      : "text-xeoo-text hover:bg-xeoo-surface-soft",
                  ].join(" ")}
                >
                  <Mail size={16} strokeWidth={isContact ? 2.2 : 1.9} />
                  <span>Contact Us</span>
                </Link>
              </div>
            </nav>
          )}
        </div>

        {/* FOOTER */}
        <div className="shrink-0 border-t border-xeoo-border p-2.5 transition-colors duration-200">
          {!isMinimized ? (
            <>
              {renderThemeButton(false)}

              <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-xeoo-muted">
                <span className="font-semibold text-xeoo-text">XeooTools</span>
                <span className="truncate text-[10px]">v1.0 Free</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              {renderThemeButton(true)}

              <button
                type="button"
                onClick={onToggleCollapse}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-xeoo-muted transition-[background-color,border-color,color,transform] duration-200 hover:border-xeoo-border hover:bg-xeoo-surface-soft hover:text-xeoo-text active:scale-95"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        className={[
          "hidden shrink-0 border-r border-xeoo-border bg-xeoo-surface transition-[width,background-color,border-color] duration-200 lg:block",
          collapsed ? "w-18" : "w-64",
        ].join(" ")}
      >
        <div className="sticky top-0 flex h-[100dvh] w-full flex-col">
          {renderSidebarContent(false)}
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-200"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          <aside className="fixed inset-y-0 left-0 flex w-[min(84vw,320px)] flex-col border-r border-xeoo-border bg-xeoo-surface shadow-2xl transition-[background-color,border-color] duration-200">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}

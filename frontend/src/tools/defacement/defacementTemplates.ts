export type ThemeLayoutType =
  | "centered"
  | "split"
  | "terminal-dominant"
  | "crt-monitor"
  | "cyberpunk-hud"
  | "brutalist-monochrome"
  | "minimal-dark"
  | "glitch-asymmetric"
  | "surveillance-grid"
  | "biohazard-alert"
  | "digital-apocalypse"
  | "retro-os";

export interface ImageTransformConfig {
  dataUrl: string;
  fileName: string;
  width: number; // in px or %
  height: number;
  scale: number;
  rotation: number;
  opacity: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  shadowBlur: number;
  shadowColor: string;
  blur: number;
  brightness: number;
  contrast: number;
  saturation: number;
  hueRotate: number;
  objectFit: "contain" | "cover" | "fill" | "none";
  objectPosition: string;
  positionMode: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "custom";
  customX: number; // %
  customY: number; // %
  flipH: boolean;
  flipV: boolean;
  layer: "behind" | "normal" | "above";
}

export interface TerminalConfig {
  title: string;
  promptUser: string;
  promptHost: string;
  showWindowButtons: boolean;
  lines: Array<{
    type: "command" | "output" | "success" | "warning" | "error";
    text: string;
  }>;
}

export interface StatItem {
  id: string;
  label: string;
  value: string;
  badge?: string;
  statusColor?: string;
}

export interface EffectConfig {
  glitchText: boolean;
  scanlines: boolean;
  crtFlicker: boolean;
  matrixRain: boolean;
  particles: boolean;
  noise: boolean;
  pulseGlow: boolean;
  chromaticAberration: boolean;
  typingAnimation: boolean;
  cursorBlink: boolean;
  intensity: "low" | "medium" | "high";
}

export interface BackgroundConfig {
  type: "solid" | "gradient" | "radial" | "grid" | "dots" | "scanlines" | "matrix" | "noise" | "image";
  primaryColor: string;
  secondaryColor: string;
  imageDataUrl?: string;
  imageOpacity?: number;
  imageBlur?: number;
  overlayOpacity?: number;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  tagline: string;
  category: "Hacker" | "Cyberpunk" | "Retro" | "Brutalist" | "Minimal" | "Tactical";
  layout: ThemeLayoutType;
  accentColor: string;
  accentSecondary: string;
  bgColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  fontFamily: string;
  badgeText: string;
  defaultEffects: Partial<EffectConfig>;
  cssOverrides?: string;
  previewThumbnailSvg?: string;
}

export interface GeneratorConfig {
  // Meta & Identity
  pageTitle: string;
  browserTitle: string;
  alias: string;
  teamName: string;
  displayName: string;
  badgeText: string;
  simulationLabel: string;
  showSimulationLabel: boolean;

  // Headings & Text
  headline: string;
  secondaryHeadline: string;
  subtitle: string;
  message: string;
  secondaryMessage: string;
  quoteText: string;
  quoteAuthor: string;
  contactText: string;
  targetNotice: string;

  // Visibility Toggles
  showHero: boolean;
  showBadge: boolean;
  showSubtitle: boolean;
  showMessage: boolean;
  showTerminal: boolean;
  showStats: boolean;
  showQuote: boolean;
  showFooter: boolean;
  showSocials: boolean;
  showContact: boolean;
  showDate: boolean;
  showTime: boolean;
  showAudioPlayer: boolean;

  // Theme & Layout
  themeId: string;
  layout: ThemeLayoutType;
  contentMaxWidth: number; // px
  contentPadding: number; // px
  textAlign: "left" | "center" | "right";
  verticalAlign: "center" | "top" | "flex-start";

  // Images
  logo: ImageTransformConfig;
  heroImage: ImageTransformConfig;
  backgroundImage: ImageTransformConfig;
  avatar: ImageTransformConfig;

  // Background & Effects
  background: BackgroundConfig;
  effects: EffectConfig;

  // Terminal & Stats
  terminal: TerminalConfig;
  stats: StatItem[];

  // Social Links
  socialLinks: Array<{ label: string; url: string }>;

  // Footer text
  footerLeft: string;
  footerCenter: string;
  footerRight: string;
}

export const DEFAULT_IMAGE_TRANSFORM: ImageTransformConfig = {
  dataUrl: "",
  fileName: "",
  width: 140,
  height: 140,
  scale: 1,
  rotation: 0,
  opacity: 1,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.2)",
  shadowBlur: 16,
  shadowColor: "rgba(0,0,0,0.5)",
  blur: 0,
  brightness: 1,
  contrast: 1,
  saturation: 1,
  hueRotate: 0,
  objectFit: "contain",
  objectPosition: "center",
  positionMode: "center",
  customX: 0,
  customY: 0,
  flipH: false,
  flipV: false,
  layer: "normal",
};

export const DEFACEMENT_THEMES: ThemeDefinition[] = [
  {
    id: "cyber-red",
    name: "Cyber Red",
    tagline: "Aggressive neon red aesthetic with high-voltage alert headers",
    category: "Hacker",
    layout: "centered",
    accentColor: "#ff1e42",
    accentSecondary: "#ff5270",
    bgColor: "#070406",
    surfaceColor: "#12080d",
    textColor: "#fce8ec",
    mutedColor: "#a3707b",
    borderColor: "#4d0e1b",
    fontFamily: "'Courier New', Courier, monospace, sans-serif",
    badgeText: "SECURITY BREACH SIMULATION",
    defaultEffects: {
      glitchText: true,
      scanlines: true,
      pulseGlow: true,
      cursorBlink: true,
      intensity: "medium",
    },
  },
  {
    id: "matrix-terminal",
    name: "Matrix Terminal",
    tagline: "Monochrome phosphor green with falling digital matrix rain",
    category: "Hacker",
    layout: "terminal-dominant",
    accentColor: "#00ff66",
    accentSecondary: "#33ff88",
    bgColor: "#020a04",
    surfaceColor: "#051608",
    textColor: "#c8ffda",
    mutedColor: "#569e6e",
    borderColor: "#0f421a",
    fontFamily: "'Courier New', Consolas, monospace",
    badgeText: "ROOT ACCESS GRANTED",
    defaultEffects: {
      matrixRain: true,
      scanlines: true,
      typingAnimation: true,
      cursorBlink: true,
      intensity: "high",
    },
  },
  {
    id: "midnight-purple",
    name: "Midnight Synthwave",
    tagline: "Vibrant neon magenta and deep purple cyberpunk glow",
    category: "Cyberpunk",
    layout: "split",
    accentColor: "#c026d3",
    accentSecondary: "#e879f9",
    bgColor: "#090412",
    surfaceColor: "#160b29",
    textColor: "#fae8ff",
    mutedColor: "#a885b5",
    borderColor: "#4a196e",
    fontFamily: "system-ui, -apple-system, sans-serif",
    badgeText: "SYSTEM OVERRIDE",
    defaultEffects: {
      pulseGlow: true,
      particles: true,
      chromaticAberration: true,
      intensity: "medium",
    },
  },
  {
    id: "neon-cyan",
    name: "Neon Cyan HUD",
    tagline: "Futuristic tactical telemetry dashboard with cyan holograms",
    category: "Cyberpunk",
    layout: "cyberpunk-hud",
    accentColor: "#06b6d4",
    accentSecondary: "#67e8f9",
    bgColor: "#030d14",
    surfaceColor: "#071c2b",
    textColor: "#e0f8ff",
    mutedColor: "#5fa3b8",
    borderColor: "#0f4a69",
    fontFamily: "ui-monospace, monospace, sans-serif",
    badgeText: "TELEMETRY CONNECTED",
    defaultEffects: {
      scanlines: true,
      pulseGlow: true,
      typingAnimation: true,
      intensity: "low",
    },
  },
  {
    id: "retro-crt",
    name: "Retro CRT 1984",
    tagline: "Vintage amber CRT monitor with phosphor curve and pixel lines",
    category: "Retro",
    layout: "crt-monitor",
    accentColor: "#f59e0b",
    accentSecondary: "#fbbf24",
    bgColor: "#0d0901",
    surfaceColor: "#1f1402",
    textColor: "#fef3c7",
    mutedColor: "#a3824c",
    borderColor: "#573a07",
    fontFamily: "'Courier New', Courier, monospace",
    badgeText: "TERMINAL TTY 01",
    defaultEffects: {
      scanlines: true,
      crtFlicker: true,
      noise: true,
      cursorBlink: true,
      intensity: "high",
    },
  },
  {
    id: "glitch-monochrome",
    name: "Glitch Monochrome",
    tagline: "High-contrast brutalist black-and-white with stark distortions",
    category: "Brutalist",
    layout: "glitch-asymmetric",
    accentColor: "#ffffff",
    accentSecondary: "#d4d4d8",
    bgColor: "#000000",
    surfaceColor: "#111111",
    textColor: "#ffffff",
    mutedColor: "#888888",
    borderColor: "#333333",
    fontFamily: "Impact, 'Arial Black', sans-serif",
    badgeText: "CRITICAL FAILURE",
    defaultEffects: {
      glitchText: true,
      noise: true,
      chromaticAberration: true,
      intensity: "high",
    },
  },
  {
    id: "minimal-black",
    name: "Minimal Obsidian",
    tagline: "Understated dark editorial typography with refined borders",
    category: "Minimal",
    layout: "minimal-dark",
    accentColor: "#e4e4e7",
    accentSecondary: "#a1a1aa",
    bgColor: "#09090b",
    surfaceColor: "#141417",
    textColor: "#f4f4f5",
    mutedColor: "#71717a",
    borderColor: "#27272a",
    fontFamily: "Georgia, Cambria, 'Times New Roman', serif",
    badgeText: "DISPATCH 001",
    defaultEffects: {
      pulseGlow: false,
      scanlines: false,
      intensity: "low",
    },
  },
  {
    id: "white-noise",
    name: "White Noise Hazard",
    tagline: "Inverted high-visibility emergency warning with hazard stripes",
    category: "Brutalist",
    layout: "centered",
    accentColor: "#dc2626",
    accentSecondary: "#000000",
    bgColor: "#f4f4f5",
    surfaceColor: "#ffffff",
    textColor: "#09090b",
    mutedColor: "#52525b",
    borderColor: "#d4d4d8",
    fontFamily: "'Arial Black', Gadget, sans-serif",
    badgeText: "EMERGENCY SHUTDOWN",
    defaultEffects: {
      noise: true,
      glitchText: true,
      intensity: "medium",
    },
  },
  {
    id: "acid-green",
    name: "Acid Biohazard",
    tagline: "Radioactive lime highlights and toxic containment telemetry",
    category: "Tactical",
    layout: "biohazard-alert",
    accentColor: "#84cc16",
    accentSecondary: "#a3e635",
    bgColor: "#060a02",
    surfaceColor: "#0f1a05",
    textColor: "#ecfccb",
    mutedColor: "#658a26",
    borderColor: "#29450c",
    fontFamily: "Trebuchet MS, 'Lucida Sans', sans-serif",
    badgeText: "BIOHAZARD PROTOCOL",
    defaultEffects: {
      pulseGlow: true,
      particles: true,
      scanlines: true,
      intensity: "medium",
    },
  },
  {
    id: "digital-apocalypse",
    name: "Digital Apocalypse",
    tagline: "Catastrophic red flare alert with siren counters and logs",
    category: "Tactical",
    layout: "digital-apocalypse",
    accentColor: "#ea580c",
    accentSecondary: "#f97316",
    bgColor: "#0c0402",
    surfaceColor: "#1c0b05",
    textColor: "#ffedd5",
    mutedColor: "#9c5737",
    borderColor: "#4a190b",
    fontFamily: "Impact, 'Courier New', monospace",
    badgeText: "DEFCON 1 ACTIVE",
    defaultEffects: {
      crtFlicker: true,
      glitchText: true,
      pulseGlow: true,
      intensity: "high",
    },
  },
  {
    id: "surveillance-grid",
    name: "Surveillance Grid",
    tagline: "CCTV wireframe aesthetic with coordinate markers and crosshairs",
    category: "Tactical",
    layout: "surveillance-grid",
    accentColor: "#38bdf8",
    accentSecondary: "#7dd3fc",
    bgColor: "#030712",
    surfaceColor: "#0b1329",
    textColor: "#f0f9ff",
    mutedColor: "#607b9b",
    borderColor: "#1e3a5f",
    fontFamily: "'Courier New', monospace",
    badgeText: "LIVE SURVEILLANCE FEED",
    defaultEffects: {
      scanlines: true,
      noise: true,
      intensity: "low",
    },
  },
  {
    id: "retro-os",
    name: "Retro Window OS",
    tagline: "Classic 90s graphical window frame with title bars and buttons",
    category: "Retro",
    layout: "retro-os",
    accentColor: "#3b82f6",
    accentSecondary: "#60a5fa",
    bgColor: "#0f172a",
    surfaceColor: "#1e293b",
    textColor: "#f8fafc",
    mutedColor: "#94a3b8",
    borderColor: "#334155",
    fontFamily: "Tahoma, Verdana, sans-serif",
    badgeText: "SYSTEM DIALOG v3.1",
    defaultEffects: {
      cursorBlink: true,
      intensity: "low",
    },
  },
];

export const DEFAULT_GENERATOR_CONFIG: GeneratorConfig = {
  pageTitle: "Hacked by XeooSecurity",
  browserTitle: "Xeoo Security Simulation — Deface Page",
  alias: "0xGhost_Xeoo",
  teamName: "XEOO CYBER CORPS",
  displayName: "Xeoo Elite Simulation Team",
  badgeText: "EDUCATIONAL SIMULATION DEMO",
  simulationLabel: "SIMULATION / EDUCATIONAL DEMO ONLY",
  showSimulationLabel: true,

  headline: "SYSTEM COMPROMISED",
  secondaryHeadline: "Security Assessment & Penetration Simulation",
  subtitle: "Your perimeter security has been analyzed under safe educational parameters.",
  message: "No actual systems were breached. This is a local simulation created using XeooTools Deface Page Generator for training and interface prototyping.",
  secondaryMessage: "Keep your dependencies updated, enforce multi-factor authentication, and monitor server logs continuously.",
  quoteText: "Security is not a product, but a continuous posture.",
  quoteAuthor: "Bruce Schneier",
  contactText: "security-demo@xeootools.local | Telegram: @xeootools",
  targetNotice: "Target Host: 127.0.0.1 (Localhost Simulation Sandbox)",

  showHero: true,
  showBadge: true,
  showSubtitle: true,
  showMessage: true,
  showTerminal: true,
  showStats: true,
  showQuote: true,
  showFooter: true,
  showSocials: true,
  showContact: true,
  showDate: true,
  showTime: true,
  showAudioPlayer: false,

  themeId: "cyber-red",
  layout: "centered",
  contentMaxWidth: 820,
  contentPadding: 24,
  textAlign: "center",
  verticalAlign: "center",

  logo: {
    ...DEFAULT_IMAGE_TRANSFORM,
    width: 120,
    height: 120,
    borderRadius: 999,
  },
  heroImage: {
    ...DEFAULT_IMAGE_TRANSFORM,
    width: 220,
    height: 220,
    borderRadius: 16,
  },
  backgroundImage: {
    ...DEFAULT_IMAGE_TRANSFORM,
    opacity: 0.15,
    blur: 2,
    layer: "behind",
  },
  avatar: {
    ...DEFAULT_IMAGE_TRANSFORM,
    width: 90,
    height: 90,
    borderRadius: 999,
  },

  background: {
    type: "grid",
    primaryColor: "#070406",
    secondaryColor: "#12080d",
  },

  effects: {
    glitchText: true,
    scanlines: true,
    crtFlicker: false,
    matrixRain: false,
    particles: false,
    noise: true,
    pulseGlow: true,
    chromaticAberration: false,
    typingAnimation: false,
    cursorBlink: true,
    intensity: "medium",
  },

  terminal: {
    title: "bash — root@xeoo-sandbox:~",
    promptUser: "root",
    promptHost: "xeoo-sim",
    showWindowButtons: true,
    lines: [
      { type: "command", text: "nmap -sV -p 80,443,8080 simulation.local" },
      { type: "output", text: "[+] Port 80/tcp OPEN (HTTP Demo Engine)" },
      { type: "output", text: "[+] Port 443/tcp OPEN (SSL Self-Signed)" },
      { type: "success", text: "[OK] Security Simulation audit initiated..." },
      { type: "warning", text: "[!] Warning: Patch CVE-2026-XEOO in staging environment." },
      { type: "command", text: "whoami" },
      { type: "success", text: "0xGhost_Xeoo [ROOT_SIMULATOR]" },
    ],
  },

  stats: [
    { id: "1", label: "STATUS", value: "PWNED (SIM)", statusColor: "#ff1e42", badge: "CRITICAL" },
    { id: "2", label: "SIGNAL", value: "100%", statusColor: "#00ff66", badge: "SECURE" },
    { id: "3", label: "MODE", value: "OFFLINE", statusColor: "#f59e0b", badge: "CLIENT" },
    { id: "4", label: "BUILD", value: "v2.6.4", statusColor: "#38bdf8", badge: "STABLE" },
  ],

  socialLinks: [
    { label: "Telegram", url: "https://t.me" },
    { label: "Discord", url: "https://discord.com" },
    { label: "GitHub", url: "https://github.com" },
  ],

  footerLeft: "Created with XeooTools Deface Generator",
  footerCenter: "LOCAL SIMULATION • ZERO BACKEND • OFFLINE SAFE",
  footerRight: "All Rights Reserved © 2026",
};


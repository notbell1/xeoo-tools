import { escapeAttribute, escapeHtml } from "./defacementGeneratorLogic";

export type BuilderComponentType =
  | "header"
  | "logo"
  | "hero"
  | "headline"
  | "subtitle"
  | "paragraph"
  | "badge"
  | "image"
  | "button"
  | "terminal"
  | "stats"
  | "quote"
  | "divider"
  | "marquee"
  | "alert"
  | "footer"
  | "socials"
  | "clock"
  | "system-info";

export interface BuilderElementStyle {
  // Typography
  fontSize?: number; // px
  fontWeight?: string | number;
  textAlign?: "left" | "center" | "right";
  color?: string;
  letterSpacing?: number; // px
  lineHeight?: number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";

  // Box Model & Spacing
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  width?: string;
  maxWidth?: number;
  height?: string;

  // Background & Borders
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: "solid" | "dashed" | "dotted" | "none";
  borderRadius?: number;
  boxShadow?: string;

  // Visual Effects
  opacity?: number;
  filterBlur?: number;
  brightness?: number;
  contrast?: number;
  glowColor?: string;
  glowBlur?: number;

  // Position & Transforms
  position?: "static" | "relative" | "absolute";
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  zIndex?: number;
  scale?: number;
  rotation?: number;
}

export interface BuilderElement {
  id: string;
  type: BuilderComponentType;
  name: string;
  visible: boolean;
  content: string;
  secondaryContent?: string;
  style: BuilderElementStyle;
  data?: Record<string, any>;
  children?: BuilderElement[];
}

export interface BuilderProject {
  version: string;
  title: string;
  browserTitle: string;
  simulationLabel: string;
  showSimulationLabel: boolean;
  themeId: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  accentSecondary: string;
  surfaceColor: string;
  borderColor: string;
  fontFamily: string;
  contentMaxWidth: number;
  effects: {
    scanlines: boolean;
    glitch: boolean;
    crtFlicker: boolean;
    matrixRain: boolean;
    particles: boolean;
    noise: boolean;
  };
  elements: BuilderElement[];
}

export const STARTER_BUILDER_TEMPLATES: Record<string, BuilderProject> = {
  "cyber-red": {
    version: "1.0",
    title: "Cyber Red Breach",
    browserTitle: "SYSTEM BREACH SIMULATION — CYBER RED",
    simulationLabel: "SECURITY SIMULATION / EDUCATIONAL DEMO ONLY",
    showSimulationLabel: true,
    themeId: "cyber-red",
    backgroundColor: "#070406",
    textColor: "#fce8ec",
    accentColor: "#ff1e42",
    accentSecondary: "#ff5270",
    surfaceColor: "#12080d",
    borderColor: "#4d0e1b",
    fontFamily: "'Courier New', Courier, monospace",
    contentMaxWidth: 860,
    effects: {
      scanlines: true,
      glitch: true,
      crtFlicker: false,
      matrixRain: false,
      particles: false,
      noise: true,
    },
    elements: [
      {
        id: "badge-1",
        type: "badge",
        name: "Security Alert Badge",
        visible: true,
        content: "CRITICAL BREACH SIMULATION",
        style: {
          color: "#ff1e42",
          backgroundColor: "#1c070c",
          borderWidth: 1,
          borderColor: "#ff1e42",
          borderRadius: 999,
          paddingTop: 4,
          paddingBottom: 4,
          paddingLeft: 14,
          paddingRight: 14,
          marginBottom: 16,
          fontSize: 11,
          fontWeight: "bold",
          textAlign: "center",
        },
      },
      {
        id: "headline-1",
        type: "headline",
        name: "Main Compromised Heading",
        visible: true,
        content: "PWNED BY XEOO CYBER",
        style: {
          fontSize: 42,
          fontWeight: 900,
          color: "#ff1e42",
          textAlign: "center",
          letterSpacing: -1,
          marginBottom: 8,
          glowColor: "rgba(255,30,66,0.5)",
          glowBlur: 16,
        },
      },
      {
        id: "subtitle-1",
        type: "subtitle",
        name: "Secondary Subtitle",
        visible: true,
        content: "Target Node 127.0.0.1 — Penetration Assessment",
        style: {
          fontSize: 16,
          fontWeight: 700,
          color: "#ff5270",
          textAlign: "center",
          marginBottom: 20,
        },
      },
      {
        id: "paragraph-1",
        type: "paragraph",
        name: "Educational Disclaimer Note",
        visible: true,
        content:
          "This page is a benign local simulation constructed with XeooTools Defacement Template Builder for defensive cybersecurity training.",
        style: {
          fontSize: 13,
          lineHeight: 1.6,
          color: "#a3707b",
          textAlign: "center",
          maxWidth: 620,
          marginBottom: 24,
        },
      },
      {
        id: "stats-1",
        type: "stats",
        name: "Telemetry Stats",
        visible: true,
        content: "STATS_GROUP",
        data: {
          items: [
            { label: "STATUS", value: "PWNED (SIM)", color: "#ff1e42" },
            { label: "LATENCY", value: "12ms", color: "#00ff66" },
            { label: "DEFENSE", value: "AUDITED", color: "#38bdf8" },
          ],
        },
        style: {
          backgroundColor: "#12080d",
          borderColor: "#4d0e1b",
          borderWidth: 1,
          borderRadius: 8,
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 16,
          paddingRight: 16,
          marginBottom: 24,
        },
      },
      {
        id: "terminal-1",
        type: "terminal",
        name: "Simulation Console",
        visible: true,
        content: "Terminal Logs",
        data: {
          title: "bash — root@xeoo-sandbox",
          user: "root",
          host: "xeoo-sim",
          lines: [
            { type: "command", text: "audit --perimeter safe" },
            { type: "success", text: "[OK] Interface loaded successfully." },
            { type: "warning", text: "[!] Notice: Simulation environment." },
          ],
        },
        style: {
          backgroundColor: "#000000",
          borderColor: "#4d0e1b",
          borderWidth: 1,
          borderRadius: 8,
          marginBottom: 24,
        },
      },
      {
        id: "footer-1",
        type: "footer",
        name: "Footer Bar",
        visible: true,
        content: "Created with XeooTools • Simulation Mode • 100% Offline",
        style: {
          fontSize: 11,
          color: "#a3707b",
          textAlign: "center",
          paddingTop: 18,
          borderWidth: 1,
          borderColor: "#4d0e1b",
          borderStyle: "solid",
        },
      },
    ],
  },
  "matrix": {
    version: "1.0",
    title: "Matrix Green Console",
    browserTitle: "NEURAL MAINFRAME — ROOT GRANTED",
    simulationLabel: "SIMULATION / EDUCATIONAL DEMO ONLY",
    showSimulationLabel: true,
    themeId: "matrix-terminal",
    backgroundColor: "#020a04",
    textColor: "#c8ffda",
    accentColor: "#00ff66",
    accentSecondary: "#33ff88",
    surfaceColor: "#051608",
    borderColor: "#0f421a",
    fontFamily: "'Courier New', monospace",
    contentMaxWidth: 840,
    effects: {
      scanlines: true,
      glitch: false,
      crtFlicker: false,
      matrixRain: true,
      particles: false,
      noise: false,
    },
    elements: [
      {
        id: "badge-m1",
        type: "badge",
        name: "Matrix Badge",
        visible: true,
        content: "MAINFRAME INITIALIZED",
        style: {
          color: "#00ff66",
          backgroundColor: "#061a0a",
          borderWidth: 1,
          borderColor: "#00ff66",
          borderRadius: 999,
          paddingTop: 4,
          paddingBottom: 4,
          paddingLeft: 12,
          paddingRight: 12,
          marginBottom: 16,
          fontSize: 11,
          fontWeight: "bold",
        },
      },
      {
        id: "headline-m1",
        type: "headline",
        name: "Matrix Title",
        visible: true,
        content: "ACCESS LEVEL: ROOT",
        style: {
          fontSize: 38,
          fontWeight: 900,
          color: "#00ff66",
          textAlign: "center",
          marginBottom: 12,
          glowColor: "rgba(0,255,102,0.4)",
          glowBlur: 14,
        },
      },
      {
        id: "terminal-m1",
        type: "terminal",
        name: "Matrix Terminal",
        visible: true,
        content: "Terminal Logs",
        data: {
          title: "kernel@matrix-node:0",
          user: "neo",
          host: "zion",
          lines: [
            { type: "command", text: "cat /etc/security_notice.txt" },
            { type: "success", text: "[OK] Defensive cyber simulation online." },
            { type: "output", text: "Wake up, Neo... The simulation has you." },
          ],
        },
        style: {
          backgroundColor: "#020703",
          borderColor: "#0f421a",
          borderWidth: 1,
          borderRadius: 8,
          marginBottom: 20,
        },
      },
    ],
  },
};

export function createNewElement(type: BuilderComponentType): BuilderElement {
  const id = `elem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const defaultStyles: Record<BuilderComponentType, Partial<BuilderElementStyle>> = {
    header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 12 },
    logo: { width: "120px", height: "120px", borderRadius: 999, marginBottom: 16 },
    hero: { width: "100%", height: "200px", borderRadius: 12, marginBottom: 16 },
    headline: { fontSize: 36, fontWeight: 900, textAlign: "center", marginBottom: 8 },
    subtitle: { fontSize: 16, fontWeight: 600, textAlign: "center", marginBottom: 16 },
    paragraph: { fontSize: 13, lineHeight: 1.6, textAlign: "center", marginBottom: 16, maxWidth: 640 },
    badge: { fontSize: 10, fontWeight: "bold", borderRadius: 999, paddingTop: 4, paddingBottom: 4, paddingLeft: 12, paddingRight: 12, marginBottom: 12 },
    image: { width: "180px", height: "180px", borderRadius: 8, marginBottom: 16 },
    button: { fontSize: 12, fontWeight: "bold", borderRadius: 6, paddingTop: 8, paddingBottom: 8, paddingLeft: 18, paddingRight: 18 },
    terminal: { width: "100%", borderRadius: 8, borderWidth: 1, marginBottom: 20 },
    stats: { width: "100%", borderRadius: 8, borderWidth: 1, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, marginBottom: 20 },
    quote: { fontSize: 13, paddingLeft: 14, borderWidth: 2, borderRadius: 4, marginBottom: 16 },
    divider: { width: "100%", height: "1px", marginTop: 16, marginBottom: 16 },
    marquee: { fontSize: 11, fontWeight: "bold", paddingTop: 6, paddingBottom: 6, marginBottom: 16 },
    alert: { fontSize: 12, borderRadius: 8, borderWidth: 1, paddingTop: 10, paddingBottom: 10, paddingLeft: 14, paddingRight: 14, marginBottom: 16 },
    footer: { fontSize: 11, textAlign: "center", paddingTop: 16, borderWidth: 1 },
    socials: { marginBottom: 16 },
    clock: { fontSize: 14, fontWeight: "bold", textAlign: "center", marginBottom: 12 },
    "system-info": { fontSize: 11, borderRadius: 8, borderWidth: 1, paddingTop: 10, paddingBottom: 10, paddingLeft: 12, paddingRight: 12, marginBottom: 16 },
  };

  const defaultContents: Record<BuilderComponentType, string> = {
    header: "XEOO SECURITY SIMULATION",
    logo: "",
    hero: "",
    headline: "SYSTEM COMPROMISED",
    subtitle: "Security Simulation in Progress",
    paragraph: "This is a benign visual simulation created using XeooTools Defacement Template Builder.",
    badge: "SIMULATION DEMO",
    image: "",
    button: "SECURITY PROTOCOL",
    terminal: "Terminal Console",
    stats: "Telemetry Group",
    quote: "Security is not a product, but a continuous posture.",
    divider: "",
    marquee: "/// SYSTEM NOTICE: LOCAL SIMULATION ONLY • ZERO BACKEND • SAFE PREVIEW ///",
    alert: "Notice: This simulation is running 100% locally in your browser memory.",
    footer: "Generated by XeooTools • All Rights Reserved",
    socials: "Social Links Row",
    clock: "00:00:00 UTC",
    "system-info": "Node: Localhost | Kernel: v5.15-safe | Memory: Clean",
  };

  return {
    id,
    type,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Block`,
    visible: true,
    content: defaultContents[type],
    style: defaultStyles[type] || {},
    data:
      type === "terminal"
        ? {
            title: "bash — root@xeoo:~",
            user: "root",
            host: "xeoo",
            lines: [
              { type: "command", text: "whoami" },
              { type: "success", text: "root_simulation" },
            ],
          }
        : type === "stats"
          ? {
              items: [
                { label: "STATUS", value: "ACTIVE", color: "#22c55e" },
                { label: "MODE", value: "OFFLINE", color: "#3b82f6" },
              ],
            }
          : undefined,
  };
}

export function generateBuilderHtml(project: BuilderProject): string {
  const elementsHtml = project.elements
    .filter((el) => el.visible)
    .map((el) => {
      const inlineStyle = Object.entries(el.style || {})
        .map(([k, v]) => {
          if (v === undefined || v === null) return "";
          const cssKey = k.replace(/([A-Z])/g, "-$1").toLowerCase();
          const cssVal = typeof v === "number" && !["opacity", "zIndex", "lineHeight"].includes(k) ? `${v}px` : v;
          return `${cssKey}: ${cssVal};`;
        })
        .join(" ");

      if (el.type === "headline") {
        return `<h1 style="${inlineStyle}">${escapeHtml(el.content)}</h1>`;
      }
      if (el.type === "subtitle") {
        return `<div style="${inlineStyle}">${escapeHtml(el.content)}</div>`;
      }
      if (el.type === "paragraph") {
        return `<p style="${inlineStyle}">${escapeHtml(el.content)}</p>`;
      }
      if (el.type === "badge") {
        return `<div style="display:inline-block; ${inlineStyle}">${escapeHtml(el.content)}</div>`;
      }
      if (el.type === "marquee") {
        return `<marquee style="${inlineStyle}">${escapeHtml(el.content)}</marquee>`;
      }
      if (el.type === "alert") {
        return `<div style="background:${project.surfaceColor}; border-color:${project.accentColor}; ${inlineStyle}">⚠️ ${escapeHtml(el.content)}</div>`;
      }
      if (el.type === "quote") {
        return `<blockquote style="border-left: 3px solid ${project.accentColor}; ${inlineStyle}">"${escapeHtml(el.content)}"</blockquote>`;
      }
      if (el.type === "divider") {
        return `<hr style="border:0; border-top:1px solid ${project.borderColor}; ${inlineStyle}" />`;
      }
      if (el.type === "image" || el.type === "logo" || el.type === "hero") {
        if (!el.data?.dataUrl) return "";
        return `<div style="display:flex; justify-content:center;"><img src="${escapeAttribute(el.data.dataUrl)}" alt="${escapeAttribute(el.name)}" style="${inlineStyle}" /></div>`;
      }
      if (el.type === "terminal") {
        const lines = el.data?.lines || [];
        return `
          <div style="background:#000000; border:1px solid ${project.borderColor}; border-radius:8px; overflow:hidden; text-align:left; font-family:monospace; margin:16px 0; ${inlineStyle}">
            <div style="background:#111; padding:6px 12px; font-size:11px; color:#777; border-bottom:1px solid #222;">${escapeHtml(el.data?.title || "bash")}</div>
            <div style="padding:12px; font-size:12px; line-height:1.5;">
              ${lines.map((l: any) => `<div style="color:${l.type === "success" ? "#4ade80" : l.type === "warning" ? "#facc15" : "#e0e0e0"};">${l.type === "command" ? `<span style="color:${project.accentColor}; font-weight:bold;">${el.data?.user || "root"}@${el.data?.host || "sim"}:~$</span> ` : ""}${escapeHtml(l.text)}</div>`).join("")}
            </div>
          </div>
        `;
      }
      if (el.type === "stats") {
        const items = el.data?.items || [];
        return `
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(120px, 1fr)); gap:8px; margin:16px 0; ${inlineStyle}">
            ${items.map((it: any) => `
              <div style="background:${project.surfaceColor}; border:1px solid ${project.borderColor}; padding:8px 12px; border-radius:6px; text-align:left;">
                <div style="font-size:9px; color:#888; font-weight:bold;">${escapeHtml(it.label)}</div>
                <div style="font-size:14px; font-weight:bold; color:${it.color || project.accentColor}; font-family:monospace;">${escapeHtml(it.value)}</div>
              </div>
            `).join("")}
          </div>
        `;
      }
      if (el.type === "footer") {
        return `<footer style="border-top:1px solid ${project.borderColor}; padding-top:16px; margin-top:24px; font-size:11px; color:#888; text-align:center; ${inlineStyle}">${escapeHtml(el.content)}</footer>`;
      }

      return `<div style="${inlineStyle}">${escapeHtml(el.content)}</div>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(project.browserTitle || project.title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%; min-height: 100vh;
      background-color: ${project.backgroundColor};
      color: ${project.textColor};
      font-family: ${project.fontFamily};
      line-height: 1.5;
    }
    .sim-banner {
      background: #dc2626; color: #fff; text-align: center;
      font-size: 10px; font-weight: 800; letter-spacing: 0.15em;
      padding: 5px 12px; text-transform: uppercase;
    }
    .builder-container {
      max-width: ${project.contentMaxWidth}px;
      margin: 0 auto;
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: calc(100vh - 30px);
    }
    ${project.effects.scanlines ? `
    body::after {
      content: ""; position: fixed; inset: 0;
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
      background-size: 100% 4px; pointer-events: none; z-index: 999;
    }
    ` : ""}
  </style>
</head>
<body>
  ${project.showSimulationLabel ? `<div class="sim-banner">${escapeHtml(project.simulationLabel)}</div>` : ""}
  <main class="builder-container">
    ${elementsHtml}
  </main>
</body>
</html>`;
}

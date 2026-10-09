export interface WCAGResult {
  ratio: number;
  normalAA: boolean;
  normalAAA: boolean;
  largeAA: boolean;
  largeAAA: boolean;
  uiComponentAA: boolean;
}

export function parseHexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.trim().replace(/^#/, '');
  if (![3, 4, 6, 8].includes(cleanHex.length)) return null;

  let r = 0, g = 0, b = 0;
  if (cleanHex.length === 3 || cleanHex.length === 4) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

// Formula according to W3C WCAG 2.1
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const rs = r / 255;
  const gs = g / 255;
  const bs = b / 255;

  const rLinear = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
  const gLinear = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
  const bLinear = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

export function calculateContrastRatio(fgHex: string, bgHex: string): WCAGResult | null {
  const fgRgb = parseHexToRgb(fgHex);
  const bgRgb = parseHexToRgb(bgHex);
  if (!fgRgb || !bgRgb) return null;

  const L1 = getRelativeLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const L2 = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  const roundedRatio = Math.round(ratio * 100) / 100;

  return {
    ratio: roundedRatio,
    normalAA: roundedRatio >= 4.5,
    normalAAA: roundedRatio >= 7.0,
    largeAA: roundedRatio >= 3.0,
    largeAAA: roundedRatio >= 4.5,
    uiComponentAA: roundedRatio >= 3.0,
  };
}

export function formatContrastRatio(ratio: number): string {
  return `${ratio.toFixed(2)} : 1`;
}


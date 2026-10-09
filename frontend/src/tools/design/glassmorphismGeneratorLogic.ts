export interface GlassSettings {
  blur: number; // px 0-50
  opacity: number; // 0-1
  saturation: number; // % 50-200
  bgColor: string; // hex
  borderWidth: number; // px 0-5
  borderColor: string; // hex
  borderOpacity: number; // 0-1
  borderRadius: number; // px 0-40
  shadowBlur: number; // px 0-60
  shadowOpacity: number; // 0-1
}

export function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.trim().replace(/^#/, '');
  let r = 255, g = 255, b = 255;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length >= 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  return `rgba(${isNaN(r) ? 255 : r}, ${isNaN(g) ? 255 : g}, ${isNaN(b) ? 255 : b}, ${alpha.toFixed(2)})`;
}

export function generateGlassCss(s: GlassSettings): string {
  const bgRgba = hexToRgba(s.bgColor, s.opacity);
  const borderRgba = hexToRgba(s.borderColor, s.borderOpacity);
  const shadowRgba = hexToRgba('#000000', s.shadowOpacity);

  return `background: ${bgRgba};
backdrop-filter: blur(${s.blur}px) saturate(${s.saturation}%);
-webkit-backdrop-filter: blur(${s.blur}px) saturate(${s.saturation}%);
border: ${s.borderWidth}px solid ${borderRgba};
border-radius: ${s.borderRadius}px;
box-shadow: 0 8px ${s.shadowBlur}px 0 ${shadowRgba};`;
}

export const GLASS_PRESETS: { name: string; settings: GlassSettings }[] = [
  {
    name: 'Frosted Glass (Default)',
    settings: {
      blur: 16,
      opacity: 0.25,
      saturation: 180,
      bgColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#ffffff',
      borderOpacity: 0.35,
      borderRadius: 16,
      shadowBlur: 32,
      shadowOpacity: 0.15,
    },
  },
  {
    name: 'Dark Frost',
    settings: {
      blur: 20,
      opacity: 0.45,
      saturation: 150,
      bgColor: '#0f172a',
      borderWidth: 1,
      borderColor: '#ffffff',
      borderOpacity: 0.15,
      borderRadius: 20,
      shadowBlur: 40,
      shadowOpacity: 0.35,
    },
  },
  {
    name: 'Ultra Clear',
    settings: {
      blur: 8,
      opacity: 0.1,
      saturation: 200,
      bgColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#ffffff',
      borderOpacity: 0.4,
      borderRadius: 12,
      shadowBlur: 24,
      shadowOpacity: 0.1,
    },
  },
  {
    name: 'Heavy Blur / Milky',
    settings: {
      blur: 32,
      opacity: 0.6,
      saturation: 140,
      bgColor: '#ffffff',
      borderWidth: 2,
      borderColor: '#ffffff',
      borderOpacity: 0.5,
      borderRadius: 24,
      shadowBlur: 50,
      shadowOpacity: 0.2,
    },
  },
];


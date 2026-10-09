export interface ShadowLayer {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number; // 0 to 1
  inset: boolean;
  active: boolean;
}

export function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.trim().replace(/^#/, '');
  let r = 0, g = 0, b = 0;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length >= 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  return `rgba(${isNaN(r) ? 0 : r}, ${isNaN(g) ? 0 : g}, ${isNaN(b) ? 0 : b}, ${alpha.toFixed(2)})`;
}

export function generateBoxShadowCss(layers: ShadowLayer[]): string {
  const activeLayers = layers.filter((l) => l.active);
  if (activeLayers.length === 0) return 'none';

  return activeLayers
    .map((l) => {
      const colorStr = hexToRgba(l.color, l.opacity);
      const insetString = l.inset ? 'inset ' : '';
      return `${insetString}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${colorStr}`;
    })
    .join(',\n  ');
}

export const SHADOW_PRESETS: { name: string; layers: ShadowLayer[] }[] = [
  {
    name: 'Soft Elevation',
    layers: [
      { id: '1', x: 0, y: 4, blur: 6, spread: -1, color: '#000000', opacity: 0.1, inset: false, active: true },
      { id: '2', x: 0, y: 2, blur: 4, spread: -1, color: '#000000', opacity: 0.06, inset: false, active: true },
    ],
  },
  {
    name: 'Floating / High Depth',
    layers: [
      { id: '1', x: 0, y: 20, blur: 25, spread: -5, color: '#000000', opacity: 0.15, inset: false, active: true },
      { id: '2', x: 0, y: 10, blur: 10, spread: -5, color: '#000000', opacity: 0.08, inset: false, active: true },
    ],
  },
  {
    name: 'Inner Glow',
    layers: [
      { id: '1', x: 0, y: 2, blur: 8, spread: 0, color: '#3B82F6', opacity: 0.35, inset: true, active: true },
    ],
  },
  {
    name: 'Colorful Dream',
    layers: [
      { id: '1', x: 0, y: 12, blur: 30, spread: 0, color: '#8B5CF6', opacity: 0.35, inset: false, active: true },
      { id: '2', x: 0, y: 4, blur: 10, spread: 0, color: '#EC4899', opacity: 0.25, inset: false, active: true },
    ],
  },
  {
    name: 'Hard Accent / Brutalist',
    layers: [
      { id: '1', x: 6, y: 6, blur: 0, spread: 0, color: '#0F172A', opacity: 1, inset: false, active: true },
    ],
  },
];


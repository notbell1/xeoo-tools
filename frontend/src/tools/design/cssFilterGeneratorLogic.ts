export interface FilterSettings {
  blur: number; // 0 - 20px
  brightness: number; // 0 - 200%
  contrast: number; // 0 - 200%
  grayscale: number; // 0 - 100%
  hueRotate: number; // 0 - 360deg
  invert: number; // 0 - 100%
  saturate: number; // 0 - 200%
  sepia: number; // 0 - 100%
  opacity: number; // 0 - 100%
}

export const DEFAULT_FILTER_SETTINGS: FilterSettings = {
  blur: 0,
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  hueRotate: 0,
  invert: 0,
  saturate: 100,
  sepia: 0,
  opacity: 100,
};

export function generateFilterCss(s: FilterSettings): string {
  const parts: string[] = [];

  if (s.blur > 0) parts.push(`blur(${s.blur}px)`);
  if (s.brightness !== 100) parts.push(`brightness(${s.brightness}%)`);
  if (s.contrast !== 100) parts.push(`contrast(${s.contrast}%)`);
  if (s.grayscale > 0) parts.push(`grayscale(${s.grayscale}%)`);
  if (s.hueRotate > 0) parts.push(`hue-rotate(${s.hueRotate}deg)`);
  if (s.invert > 0) parts.push(`invert(${s.invert}%)`);
  if (s.saturate !== 100) parts.push(`saturate(${s.saturate}%)`);
  if (s.sepia > 0) parts.push(`sepia(${s.sepia}%)`);
  if (s.opacity < 100) parts.push(`opacity(${s.opacity}%)`);

  if (parts.length === 0) return 'none';
  return parts.join(' ');
}

export const FILTER_PRESETS: { name: string; settings: FilterSettings }[] = [
  {
    name: 'Normal (Reset)',
    settings: { ...DEFAULT_FILTER_SETTINGS },
  },
  {
    name: 'Vintage 1970s',
    settings: {
      blur: 0,
      brightness: 110,
      contrast: 90,
      grayscale: 0,
      hueRotate: 0,
      invert: 0,
      saturate: 120,
      sepia: 60,
      opacity: 100,
    },
  },
  {
    name: 'Dramatic Noir',
    settings: {
      blur: 0,
      brightness: 90,
      contrast: 150,
      grayscale: 100,
      hueRotate: 0,
      invert: 0,
      saturate: 100,
      sepia: 0,
      opacity: 100,
    },
  },
  {
    name: 'Cyberpunk Neon',
    settings: {
      blur: 0,
      brightness: 110,
      contrast: 130,
      grayscale: 0,
      hueRotate: 90,
      invert: 0,
      saturate: 180,
      sepia: 0,
      opacity: 100,
    },
  },
  {
    name: 'Dreamy Glow',
    settings: {
      blur: 2,
      brightness: 115,
      contrast: 85,
      grayscale: 0,
      hueRotate: 0,
      invert: 0,
      saturate: 130,
      sepia: 20,
      opacity: 100,
    },
  },
  {
    name: 'High Invert Matrix',
    settings: {
      blur: 0,
      brightness: 100,
      contrast: 120,
      grayscale: 0,
      hueRotate: 180,
      invert: 90,
      saturate: 150,
      sepia: 0,
      opacity: 100,
    },
  },
];


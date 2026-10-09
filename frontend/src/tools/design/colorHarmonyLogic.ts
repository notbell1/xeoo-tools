import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from "./colorConverterLogic";

export type HarmonyColor = {
  role: string;
  label: string;
  hex: string;
  rgb: string;
  hsl: string;
  h: number;
  s: number;
  l: number;
};

export type HarmonyGroup = {
  type: string;
  title: string;
  description: string;
  colors: HarmonyColor[];
};

function createHarmonyColor(h: number, s: number, l: number, role: string): HarmonyColor {
  const normH = (Math.round(h) % 360 + 360) % 360;
  const normS = Math.max(0, Math.min(100, Math.round(s)));
  const normL = Math.max(0, Math.min(100, Math.round(l)));

  const rgb = hslToRgb(normH, normS, normL);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

  return {
    role,
    label: role,
    hex,
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${normH}, ${normS}%, ${normL}%)`,
    h: normH,
    s: normS,
    l: normL,
  };
}

export function generateColorHarmonies(baseHexInput: string): HarmonyGroup[] {
  const rgb = hexToRgb(baseHexInput) || { r: 59, g: 130, b: 246 };
  const baseHsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const { h, s, l } = baseHsl;

  return [
    {
      type: "complementary",
      title: "Complementary",
      description: "Opposite color on the color wheel (180°). High visual contrast and vibrancy.",
      colors: [
        createHarmonyColor(h, s, l, "Base Color"),
        createHarmonyColor(h + 180, s, l, "Complementary (180°)"),
      ],
    },
    {
      type: "analogous",
      title: "Analogous",
      description: "Adjacent colors on the color wheel (±30°). Smooth, natural and harmonious palettes.",
      colors: [
        createHarmonyColor(h - 30, s, l, "Secondary (-30°)"),
        createHarmonyColor(h, s, l, "Base Color"),
        createHarmonyColor(h + 30, s, l, "Secondary (+30°)"),
      ],
    },
    {
      type: "triadic",
      title: "Triadic",
      description: "Three equidistant colors evenly spaced at 120°. Balanced and energetic harmony.",
      colors: [
        createHarmonyColor(h, s, l, "Base Color"),
        createHarmonyColor(h + 120, s, l, "Triad 1 (+120°)"),
        createHarmonyColor(h + 240, s, l, "Triad 2 (+240°)"),
      ],
    },
    {
      type: "split-complementary",
      title: "Split Complementary",
      description: "Base color paired with the two colors adjacent to its complement (+150°, +210°).",
      colors: [
        createHarmonyColor(h, s, l, "Base Color"),
        createHarmonyColor(h + 150, s, l, "Split 1 (+150°)"),
        createHarmonyColor(h + 210, s, l, "Split 2 (+210°)"),
      ],
    },
    {
      type: "tetradic",
      title: "Tetradic (Rectangle)",
      description: "Four colors arranged in two complementary pairs (+60°, +180°, +240°). Rich and colorful.",
      colors: [
        createHarmonyColor(h, s, l, "Base Color"),
        createHarmonyColor(h + 60, s, l, "Accent (+60°)"),
        createHarmonyColor(h + 180, s, l, "Complement (+180°)"),
        createHarmonyColor(h + 240, s, l, "Accent 2 (+240°)"),
      ],
    },
    {
      type: "monochromatic",
      title: "Monochromatic",
      description: "Variations in lightness and saturation along the same hue angle. Clean and elegant.",
      colors: [
        createHarmonyColor(h, Math.max(10, s - 30), Math.min(95, l + 30), "Light Tint"),
        createHarmonyColor(h, Math.max(15, s - 15), Math.min(90, l + 15), "Soft Tint"),
        createHarmonyColor(h, s, l, "Base Color"),
        createHarmonyColor(h, Math.min(100, s + 10), Math.max(10, l - 15), "Deep Shade"),
        createHarmonyColor(h, Math.min(100, s + 15), Math.max(5, l - 30), "Dark Shade"),
      ],
    },
  ];
}


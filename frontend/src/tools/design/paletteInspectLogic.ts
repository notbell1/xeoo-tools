import { BACKEND_URL } from "../../config/backend";

export type PaletteColor = {
  rank: number;
  hex: string;
  rgb: string;
  hsl: string;
  rgb_values: { r: number; g: number; b: number };
  hsl_values: { h: number; s: number; l: number };
  usage_count: number;
  weight_percent: number;
};

export type UiRoles = {
  likely_background: string | null;
  likely_text: string | null;
  likely_border: string | null;
  likely_primary: string | null;
};

export type TypographyStyles = {
  font_families: string[];
  border_radii: string[];
  box_shadows: string[];
};

export type PaletteInspectResult = {
  url: string;
  final_url: string;
  total_colors_detected: number;
  main_palette: PaletteColor[];
  ui_roles: UiRoles;
  css_variables: Record<string, string>;
  typography_styles: TypographyStyles;
  note: string;
};

export async function analyzeWebsitePalette(
  targetUrl: string,
): Promise<PaletteInspectResult> {
  const url = targetUrl.trim();
  if (!url) {
    throw new Error("Please enter a website URL to analyze.");
  }

  const endpoint = `${BACKEND_URL}/api/design/palette-inspect.php`;

  const response = await fetch(endpoint, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ url }),
  });

  const json = await response.json().catch(() => null);

  if (!response.ok || !json?.success) {
    throw new Error(
      json?.message || `Failed to analyze website. HTTP error ${response.status}`,
    );
  }

  return json.data as PaletteInspectResult;
}


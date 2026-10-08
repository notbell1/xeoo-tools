
export type CategoryStyle = {
  icon: string;
  badge: string;
  text: string;
  border: string;
  surface: string;
};

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  math: {
    icon: "border-violet-200 bg-violet-100 text-violet-700",
    badge: "border-violet-200 bg-violet-50 text-violet-700",
    text: "text-violet-700",
    border: "border-violet-200",
    surface: "bg-violet-50",
  },

  psychology: {
    icon: "border-purple-200 bg-purple-100 text-purple-700",
    badge: "border-purple-200 bg-purple-50 text-purple-700",
    text: "text-purple-700",
    border: "border-purple-200",
    surface: "bg-purple-50",
  },

  law: {
    icon: "border-slate-200 bg-slate-100 text-slate-700",
    badge: "border-slate-200 bg-slate-50 text-slate-700",
    text: "text-slate-700",
    border: "border-slate-200",
    surface: "bg-slate-50",
  },

  health: {
    icon: "border-rose-200 bg-rose-100 text-rose-700",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    text: "text-rose-700",
    border: "border-rose-200",
    surface: "bg-rose-50",
  },

  network: {
    icon: "border-cyan-200 bg-cyan-100 text-cyan-700",
    badge: "border-cyan-200 bg-cyan-50 text-cyan-700",
    text: "text-cyan-700",
    border: "border-cyan-200",
    surface: "bg-cyan-50",
  },

  security: {
    icon: "border-emerald-200 bg-emerald-100 text-emerald-700",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    text: "text-emerald-700",
    border: "border-emerald-200",
    surface: "bg-emerald-50",
  },

  image: {
    icon: "border-pink-200 bg-pink-100 text-pink-700",
    badge: "border-pink-200 bg-pink-50 text-pink-700",
    text: "text-pink-700",
    border: "border-pink-200",
    surface: "bg-pink-50",
  },

  file: {
    icon: "border-blue-200 bg-blue-100 text-blue-700",
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    text: "text-blue-700",
    border: "border-blue-200",
    surface: "bg-blue-50",
  },

  encoding: {
    icon: "border-orange-200 bg-orange-100 text-orange-700",
    badge: "border-orange-200 bg-orange-50 text-orange-700",
    text: "text-orange-700",
    border: "border-orange-200",
    surface: "bg-orange-50",
  },

  seo: {
    icon: "border-amber-200 bg-amber-100 text-amber-700",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    text: "text-amber-700",
    border: "border-amber-200",
    surface: "bg-amber-50",
  },

  defacement: {
    icon: "border-red-200 bg-red-100 text-red-700",
    badge: "border-red-200 bg-red-50 text-red-700",
    text: "text-red-700",
    border: "border-red-200",
    surface: "bg-red-50",
  },

  code: {
    icon: "border-indigo-200 bg-indigo-100 text-indigo-700",
    badge: "border-indigo-200 bg-indigo-50 text-indigo-700",
    text: "text-indigo-700",
    border: "border-indigo-200",
    surface: "bg-indigo-50",
  },
};

const FALLBACK_CATEGORY_STYLE: CategoryStyle = {
  icon: "border-xeoo-border bg-xeoo-surface-soft text-xeoo-text",
  badge: "border-xeoo-border bg-xeoo-surface-soft text-xeoo-text-muted",
  text: "text-xeoo-text",
  border: "border-xeoo-border",
  surface: "bg-xeoo-surface-soft",
};

export function getCategoryStyle(slug: string): CategoryStyle {
  return CATEGORY_STYLES[slug] ?? FALLBACK_CATEGORY_STYLE;
}


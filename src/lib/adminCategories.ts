import type { CategoryForm } from "../types/admin";

export const DEFAULT_CATEGORY_FORM: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  icon: "wrench",
  color: "blue",
};

export const CATEGORY_COLORS = [
  {
    value: "slate",
    label: "Slate",
  },
  {
    value: "gray",
    label: "Gray",
  },
  {
    value: "zinc",
    label: "Zinc",
  },
  {
    value: "neutral",
    label: "Neutral",
  },
  {
    value: "stone",
    label: "Stone",
  },
  {
    value: "red",
    label: "Red",
  },
  {
    value: "orange",
    label: "Orange",
  },
  {
    value: "amber",
    label: "Amber",
  },
  {
    value: "yellow",
    label: "Yellow",
  },
  {
    value: "lime",
    label: "Lime",
  },
  {
    value: "green",
    label: "Green",
  },
  {
    value: "emerald",
    label: "Emerald",
  },
  {
    value: "teal",
    label: "Teal",
  },
  {
    value: "cyan",
    label: "Cyan",
  },
  {
    value: "sky",
    label: "Sky",
  },
  {
    value: "blue",
    label: "Blue",
  },
  {
    value: "indigo",
    label: "Indigo",
  },
  {
    value: "violet",
    label: "Violet",
  },
  {
    value: "purple",
    label: "Purple",
  },
  {
    value: "fuchsia",
    label: "Fuchsia",
  },
  {
    value: "pink",
    label: "Pink",
  },
  {
    value: "rose",
    label: "Rose",
  },
] as const;

export const CATEGORY_ICONS = [
  "calculator",
  "percent",
  "brain",
  "law",
  "heart-pulse",
  "network",
  "security",
  "image",
  "file",
  "encoding",
  "seo",
  "defacement",
  "code",
  "wrench",
  "database",
  "flask-conical",
  "book-open",
  "graduation-cap",
  "briefcase",
  "globe",
  "terminal",
  "cpu",
  "cloud",
  "key-round",
  "lock-keyhole",
  "users",
  "message-circle",
  "calendar-days",
  "map",
  "leaf",
  "gamepad-2",
  "shopping-cart",
  "sparkles",
  "wand-2",
  "file-code",
  "align-left",
  "dollar-sign",
  "shield",
  "sliders",
  "list-check",
  "gauge",
  "divide",
  "triangle",
  "ruler",
  "box",
  "trending-up",
  "hash",
  "shield-check",
  "eye",
  "heart-handshake",
  "brain-circuit",
  "scale",
  "compass",
  "message-square-quote",
  "life-buoy",
  "messages-square",
  "gem",
  "palette",
  "contrast",
  "type",
  "paintbrush",
  "layers",
  "pipette",
  "blend",
] as const;

export function getCategoryBadgeClass(
  color: string,
) {
  switch (color) {
    case "slate":
      return "border-slate-200 bg-slate-50 text-slate-700";

    case "gray":
      return "border-gray-200 bg-gray-50 text-gray-700";

    case "zinc":
      return "border-zinc-200 bg-zinc-50 text-zinc-700";

    case "neutral":
      return "border-neutral-200 bg-neutral-50 text-neutral-700";

    case "stone":
      return "border-stone-200 bg-stone-50 text-stone-700";

    case "red":
      return "border-red-200 bg-red-50 text-red-700";

    case "orange":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "amber":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "yellow":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";

    case "lime":
      return "border-lime-200 bg-lime-50 text-lime-700";

    case "green":
      return "border-green-200 bg-green-50 text-green-700";

    case "emerald":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "teal":
      return "border-teal-200 bg-teal-50 text-teal-700";

    case "cyan":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";

    case "sky":
      return "border-sky-200 bg-sky-50 text-sky-700";

    case "blue":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "indigo":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";

    case "violet":
      return "border-violet-200 bg-violet-50 text-violet-700";

    case "purple":
      return "border-purple-200 bg-purple-50 text-purple-700";

    case "fuchsia":
      return "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700";

    case "pink":
      return "border-pink-200 bg-pink-50 text-pink-700";

    case "rose":
      return "border-rose-200 bg-rose-50 text-rose-700";

    default:
      return "border-xeoo-border bg-xeoo-surface-soft text-xeoo-text-muted";
  }
}

export function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
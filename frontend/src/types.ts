import type { LucideIcon } from "lucide-react";

export type ToolStatus = "ready" | "maintenance" | "upcoming";

export interface Category {
  id?: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  icon: LucideIcon;
}

export interface Tool {
  id?: number;
  category_id?: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  category_slug?: string;
  status: ToolStatus;
  icon: LucideIcon;
  path?: string;
}

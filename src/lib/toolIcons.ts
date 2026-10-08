import {
  Binary,
  BookOpen,
  Brain,
  Briefcase,
  Calculator,
  CalendarDays,
  Cloud,
  Code2,
  Cpu,
  Database,
  FileArchive,
  FileText,
  FlaskConical,
  Gamepad2,
  Globe2,
  GraduationCap,
  Hash,
  HeartPulse,
  Image,
  KeyRound,
  Leaf,
  LockKeyhole,
  Map,
  MessageCircle,
  Music,
  Network,
  Percent,
  Scale,
  ScanLine,
  Search,
  ShieldCheck,
  ShoppingCart,
  Skull,
  Terminal,
  Users,
  Wrench,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
}

const toolIconMap: Record<string, LucideIcon> = {
  calculator: Calculator,

  percent: Percent,
  percentage: Percent,

  image: Image,
  "image-down": Image,

  scan: ScanLine,
  "scan-line": ScanLine,

  network: Network,

  globe: Globe2,
  "globe-2": Globe2,

  key: KeyRound,
  "key-round": KeyRound,

  hash: Hash,

  binary: Binary,

  braces: Code2,
  code: Code2,

  "heart-pulse": HeartPulse,

  search: Search,

  "file-archive": FileArchive,
  file: FileText,

  // SEO Tool Specific Icons
  "meta-tag-analyzer": Search,
  "serp-snippet-preview": Search,
  "robots-txt-generator": FileText,
  "sitemap-generator": FileText,
  "open-graph-checker": Globe2,
  "schema-markup-generator": Code2,
  "robots": FileText,
  "sitemap": FileText,
  "schema": Code2,

  brain: Brain,
  law: Scale,
  security: ShieldCheck,
  encoding: Binary,
  seo: Search,
  defacement: Skull,

  database: Database,
  "flask-conical": FlaskConical,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  briefcase: Briefcase,
  terminal: Terminal,
  cpu: Cpu,
  cloud: Cloud,
  "lock-keyhole": LockKeyhole,
  users: Users,
  "message-circle": MessageCircle,
  "calendar-days": CalendarDays,
  map: Map,
  leaf: Leaf,
  "gamepad-2": Gamepad2,
  music: Music,
  "shopping-cart": ShoppingCart,

  wrench: Wrench,
};

const categoryIconMap: Record<string, LucideIcon> = {
  // Slug kategori lama
  math: Calculator,
  psychology: Brain,
  psikologi: Brain,
  law: Scale,
  health: HeartPulse,
  network: Network,
  security: ShieldCheck,
  image: Image,
  file: FileArchive,
  encoding: Binary,
  seo: Search,
  defacement: Skull,
  code: Code2,

  // Icon kategori
  calculator: Calculator,
  percent: Percent,
  brain: Brain,
  "heart-pulse": HeartPulse,
  wrench: Wrench,
  database: Database,
  "flask-conical": FlaskConical,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  briefcase: Briefcase,
  globe: Globe2,
  terminal: Terminal,
  cpu: Cpu,
  cloud: Cloud,
  "key-round": KeyRound,
  key: KeyRound,
  "lock-keyhole": LockKeyhole,
  users: Users,
  "message-circle": MessageCircle,
  "calendar-days": CalendarDays,
  map: Map,
  leaf: Leaf,
  "gamepad-2": Gamepad2,
  music: Music,
  "shopping-cart": ShoppingCart,
};

export function getToolIcon(icon: string): LucideIcon {
  return toolIconMap[normalize(icon)] ?? Wrench;
}

export function getCategoryIcon(icon: string): LucideIcon {
  return categoryIconMap[normalize(icon)] ?? Wrench;
}

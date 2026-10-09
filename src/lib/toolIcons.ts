import {
  AlignLeft,
  Binary,
  Blend,
  BookOpen,
  Brain,
  BrainCircuit,
  Briefcase,
  Calculator,
  CalendarDays,
  Cloud,
  Code2,
  Compass,
  Contrast,
  Cpu,
  Database,
  DollarSign,
  Box,
  Divide,
  Eye,
  FileArchive,
  FileCode,
  FileText,
  FlaskConical,
  Gamepad2,
  Gauge,
  Gem,
  Globe2,
  GraduationCap,
  Hash,
  HeartHandshake,
  HeartPulse,
  Image,
  KeyRound,
  Layers,
  Leaf,
  LifeBuoy,
  ListCheck,
  LockKeyhole,
  Map,
  MessageCircle,
  MessageSquareQuote,
  MessagesSquare,
  Music,
  Network,
  Paintbrush,
  Palette,
  Percent,
  Pipette,
  Ruler,
  Scale,
  ScanLine,
  Search,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Skull,
  Sliders,
  Sparkles,
  Square,
  Terminal,
  TrendingUp,
  Triangle,
  Type,
  Users,
  Wand2,
  Wrench,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

function normalize(value?: string | null) {
  if (!value || typeof value !== "string") {
    return "";
  }
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
}

const toolIconMap: Record<string, LucideIcon> = {
  calculator: Calculator,

  percent: Percent,
  percentage: Percent,

  // Math Tools
  "fraction-calculator": Divide,
  "ratio-calculator": Scale,
  "average-calculator": TrendingUp,
  "gcd-lcm-calculator": Hash,
  "prime-number-checker": ShieldCheck,
  "prime-factorization": Sparkles,
  "factorial-calculator": Sparkles,
  "exponent-calculator": Calculator,
  "square-root-calculator": Calculator,
  "linear-equation-solver": Calculator,
  "quadratic-equation-solver": Calculator,
  "pythagorean-calculator": Triangle,
  "area-calculator": Square,
  "perimeter-calculator": Ruler,
  "volume-calculator": Box,
  divide: Divide,
  triangle: Triangle,
  ruler: Ruler,
  box: Box,
  "trending-up": TrendingUp,
  scale: Scale,
  square: Square,

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

  // AI Tools Icons
  "wand-2": Wand2,
  "file-code": FileCode,
  "align-left": AlignLeft,
  "dollar-sign": DollarSign,
  shield: Shield,
  sliders: Sliders,
  "list-check": ListCheck,
  gauge: Gauge,
  sparkles: Sparkles,

  // Design Tools Icons
  palette: Palette,
  "palette-inspect": Palette,
  "color-converter": Palette,
  "color-harmony-generator": Sparkles,
  "gradient-generator": Paintbrush,
  "contrast-checker": Contrast,
  "css-shadow-generator": Box,
  "css-border-radius-generator": Square,
  "glassmorphism-generator": Layers,
  "css-filter-generator": Sliders,
  "typography-scale-generator": Type,
  contrast: Contrast,
  type: Type,
  paintbrush: Paintbrush,
  layers: Layers,
  pipette: Pipette,
  blend: Blend,

  brain: Brain,
  "brain-circuit": BrainCircuit,
  "heart-handshake": HeartHandshake,
  compass: Compass,
  "message-square-quote": MessageSquareQuote,
  "life-buoy": LifeBuoy,
  eye: Eye,
  "messages-square": MessagesSquare,
  gem: Gem,
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
  "psychology-tools": Brain,
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
  ai: Sparkles,
  "ai-tools": Sparkles,
  design: Palette,
  "design-tools": Palette,

  // Icon kategori
  sparkles: Sparkles,
  palette: Palette,
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

export function getToolIcon(icon?: string | null): LucideIcon {
  if (!icon) return Wrench;
  return toolIconMap[normalize(icon)] ?? Wrench;
}

export function getCategoryIcon(icon?: string | null): LucideIcon {
  if (!icon) return Wrench;
  return categoryIconMap[normalize(icon)] ?? Wrench;
}

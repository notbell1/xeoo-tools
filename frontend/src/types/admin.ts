export type ToolStatus = "ready" | "maintenance" | "upcoming";

export interface AdminTool {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  status: ToolStatus;
  category_id: number;
  category_name: string;
  category_slug: string;
}

export interface AdminUser {
  id: number;
  username: string;
  display_name: string | null;
  avatar: string | null;
  role: string;
  status: string;
  password_changed_at?: string | null;
  last_login_at?: string | null;
  last_login_ip?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user?: AdminUser;
  };
}

export interface ToolsResponse {
  success: boolean;
  message?: string;
  data?: AdminTool[];
}

export type DatabaseCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  tool_count: number;
};

/**
 * Alias agar file admin lama tetap kompatibel.
 */
export type AdminCategory = DatabaseCategory;

export type CategoriesResponse = {
  success: boolean;
  message?: string;
  data?: DatabaseCategory[];
};

export type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
};

export type ToolForm = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  status: ToolStatus;
  category_id: number;
};

/* ============================================================
   REPORTS
============================================================ */

export type ReportType = "bug" | "tool" | "ui" | "other";

export type ReportStatus = "waiting" | "fix";

export interface AdminReport {
  id: number;
  type: ReportType;
  tool_id: number | null;
  tool_name: string;
  category_name: string | null;
  category_slug: string | null;
  message: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string | null;
}

export interface ReportsPagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ReportsSummary {
  total: number;
  waiting: number;
  fix: number;
}

export interface ReportsResponse {
  success: boolean;
  message?: string;
  data?: {
    reports: AdminReport[];
    pagination: ReportsPagination;
    summary: ReportsSummary;
  };
}

export interface ReportCreateResponse {
  success: boolean;
  message?: string;
  data?: {
    report?: AdminReport;
  };
}

export interface ReportStatusResponse {
  success: boolean;
  message?: string;
  data?: {
    report?: AdminReport;
  };
}

export type ContactType =
  | "tool_suggestion"
  | "partnership"
  | "faq"
  | "feedback"
  | "criticism_suggestion";

export type ContactStatus = "unread" | "read" | "replied";

export interface AdminMessage {
  id: number;
  type: ContactType;
  name: string | null;
  email: string | null;
  message: string;
  status: ContactStatus;
  created_at: string;
  updated_at: string | null;
}

export interface MessagesPagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface MessagesSummary {
  total: number;
  unread: number;
  read: number;
  replied: number;
}

export interface MessagesResponse {
  success: boolean;
  message?: string;
  data?: {
    messages: AdminMessage[];
    pagination: MessagesPagination;
    summary: MessagesSummary;
  };
}

/* ============================================================
   ADMIN NAVIGATION
============================================================ */

export type AdminView =
  | "overview"
  | "categories"
  | "all"
  | "ctf"
  | "reports"
  | "messages"
  | "account";

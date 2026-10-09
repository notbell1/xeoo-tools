import { CalendarClock, Check, Construction, Filter } from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { showConfirm, showError, showSuccess } from "../alert";

import { BACKEND_URL } from "../config/backend";

import AdminAccount from "../components/admin/AdminAccount";
import AdminCategories from "../components/admin/AdminCategories";
import AdminCtf from "../components/admin/AdminCtf";
import AdminMessages from "../components/admin/AdminMessages";
import AdminReports from "../components/admin/AdminReports";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminStats from "../components/admin/AdminStats";
import AdminTools from "../components/admin/AdminTools";
import AdminTopbar from "../components/admin/AdminTopbar";
import AdminTraffic from "../components/admin/AdminTraffic";
import CategoryDialog from "../components/admin/CategoryDialog";

import { useAdminCategories } from "../hooks/useAdminCategories";

import { TOOLS_UPDATED_EVENT } from "../hooks/useTools";

import { getCategoryIcon, getToolIcon } from "../lib/toolIcons";

import NotFound from "./NotFound";

import type {
  AdminTool,
  AdminUser,
  AdminView,
  AuthResponse,
  ToolStatus,
  ToolsResponse,
} from "../types/admin";

const REFRESH_INTERVAL = 5000;

const STATUS_META: Record<
  ToolStatus,
  {
    label: string;
    description: string;
    className: string;
  }
> = {
  ready: {
    label: "Ready",
    description: "Operational and ready for public use.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  maintenance: {
    label: "Maintenance",
    description: "Temporarily offline for maintenance.",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },

  upcoming: {
    label: "Upcoming",
    description: "In development and scheduled for release.",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
};

function getStatusIcon(status: ToolStatus): LucideIcon {
  if (status === "ready") {
    return Check;
  }

  if (status === "maintenance") {
    return Construction;
  }

  return CalendarClock;
}

function resolveAvatarUrl(avatar: string | null | undefined): string | null {
  if (!avatar) {
    return null;
  }

  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    return avatar;
  }

  return `${BACKEND_URL}/${avatar.replace(/^\/+/, "")}`;
}

export default function DashboardMimin({
  initialView,
}: {
  initialView?: AdminView;
} = {}) {
  const [searchParams] = useSearchParams();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const [username, setUsername] = useState("");

  const [displayName, setDisplayName] = useState("");

  const [avatar, setAvatar] = useState<string | null>(null);

  const [tools, setTools] = useState<AdminTool[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [activeView, setActiveView] = useState<AdminView>(() => {
    const viewParam = searchParams.get("view") as AdminView | null;
    const validViews: AdminView[] = [
      "overview",
      "traffic",
      "categories",
      "all",
      "ctf",
      "reports",
      "messages",
      "account",
    ];
    if (viewParam && validViews.includes(viewParam)) {
      return viewParam;
    }
    return initialView || "overview";
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [loggingOut, setLoggingOut] = useState(false);

  const handleUnauthorized = useCallback(() => {
    setAuthorized(false);
  }, []);

  useEffect(() => {
    document.title = "XeooTools — Admin Dashboard";

    return () => {
      document.title = "XeooTools — Free Online Tools";
    };
  }, []);

  const checkSession = async (): Promise<boolean> => {
    try {
      const body = new URLSearchParams();

      body.append("action", "me");

      const response = await fetch(`${BACKEND_URL}/api/auth.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body,
      });

      if (!response.ok) {
        setAuthorized(false);
        return false;
      }

      const result: AuthResponse = await response.json();

      const user: AdminUser | undefined = result.data?.user;

      if (!result.success || !user || user.role !== "admin") {
        setAuthorized(false);
        return false;
      }

      setUsername(user.username);

      setDisplayName(user.display_name || "");

      setAvatar(user.avatar || null);

      setAuthorized(true);

      return true;
    } catch (error) {
      console.error("Session check error:", error);

      setAuthorized(false);

      return false;
    }
  };

  useEffect(() => {
    const handleProfileUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{
        username?: string;
        display_name?: string | null;
        avatar?: string | null;
      }>;

      const nextUsername = customEvent.detail?.username;

      const nextDisplayName = customEvent.detail?.display_name;

      const nextAvatar = customEvent.detail?.avatar;

      if (typeof nextUsername === "string") {
        setUsername(nextUsername);
      }

      if (typeof nextDisplayName === "string") {
        setDisplayName(nextDisplayName);
      }

      if (nextDisplayName === null) {
        setDisplayName("");
      }

      if (typeof nextAvatar === "string" || nextAvatar === null) {
        setAvatar(nextAvatar);
      }
    };

    window.addEventListener("ADMIN_PROFILE_UPDATED", handleProfileUpdated);

    return () => {
      window.removeEventListener("ADMIN_PROFILE_UPDATED", handleProfileUpdated);
    };
  }, []);

  const loadTools = async (options?: {
    showLoading?: boolean;
    showErrorMessage?: boolean;
  }) => {
    const showLoading = options?.showLoading ?? false;

    const showErrorMessage = options?.showErrorMessage ?? true;

    if (showLoading) {
      setRefreshing(true);
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/tools.php?_=${Date.now()}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (response.status === 401) {
        setAuthorized(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result: ToolsResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to retrieve tools data.");
      }

      const normalizedTools: AdminTool[] = (result.data ?? []).map(
        (tool): AdminTool => {
          const status: ToolStatus =
            tool.status === "maintenance"
              ? "maintenance"
              : tool.status === "upcoming"
                ? "upcoming"
                : "ready";

          return {
            ...tool,
            status,
            icon: typeof tool.icon === "string" ? tool.icon : "wrench",
            category_name: tool.category_name || "Uncategorized",
            category_slug: tool.category_slug || "uncategorized",
          };
        },
      );

      setTools(normalizedTools);
    } catch (error) {
      console.error("Load tools error:", error);

      if (showErrorMessage) {
        await showError(
          "Failed to load tools",
          error instanceof Error
            ? error.message
            : "Tools data could not be retrieved from the server.",
        );
      }
    } finally {
      if (showLoading) {
        setRefreshing(false);
      }
    }
  };

  const {
    categories,
    categoryLoading,
    categoryDialog,
    categoryForm,
    categorySaving,
    categoryDeletingId,
    loadCategories,
    openCreateCategory,
    openEditCategory,
    closeCategoryDialog,
    saveCategory,
    deleteCategory,
    updateCategoryForm,
  } = useAdminCategories({
    onUnauthorized: () => setAuthorized(false),

    refreshTools: async () => {
      await loadTools({
        showLoading: false,
        showErrorMessage: false,
      });
    },

    onCategoryDeleted: (category) => {
      if (selectedCategory === category.name) {
        setSelectedCategory(null);
        setActiveView("overview");
      }
    },
  });

  useEffect(() => {
    let mounted = true;

    const initializeDashboard = async () => {
      setLoading(true);

      const loggedIn = await checkSession();

      if (loggedIn && mounted) {
        await Promise.all([
          loadTools({
            showLoading: false,
            showErrorMessage: true,
          }),

          loadCategories({
            showLoading: false,
            showErrorMessage: true,
          }),
        ]);
      }

      if (mounted) {
        setLoading(false);
      }
    };

    void initializeDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!authorized) {
      return;
    }

    const refreshEverything = () => {
      void loadTools({
        showLoading: false,
        showErrorMessage: false,
      });

      void loadCategories({
        showLoading: false,
        showErrorMessage: false,
      });
    };

    const intervalId = window.setInterval(refreshEverything, REFRESH_INTERVAL);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [authorized]);

  useEffect(() => {
    if (!authorized) {
      return;
    }

    const refreshAll = () => {
      void loadTools({
        showLoading: false,
        showErrorMessage: false,
      });

      void loadCategories({
        showLoading: false,
        showErrorMessage: false,
      });
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === TOOLS_UPDATED_EVENT && event.newValue) {
        refreshAll();
      }
    };

    const handleFocus = () => {
      refreshAll();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshAll();
      }
    };

    window.addEventListener("focus", handleFocus);

    window.addEventListener("storage", handleStorage);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);

      window.removeEventListener("storage", handleStorage);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [authorized]);

  const readyTools = useMemo(
    () => tools.filter((tool) => tool.status === "ready"),
    [tools],
  );

  const maintenanceTools = useMemo(
    () => tools.filter((tool) => tool.status === "maintenance"),
    [tools],
  );

  const upcomingTools = useMemo(
    () => tools.filter((tool) => tool.status === "upcoming"),
    [tools],
  );

  const navigate = (view: AdminView) => {
    setActiveView(view);

    if (
      view === "overview" ||
      view === "categories" ||
      view === "all" ||
      view === "reports" ||
      view === "messages" ||
      view === "account"
    ) {
      setSelectedCategory(null);
    }
  };

  const selectCategory = (category: string) => {
    setActiveView("all");
    setSelectedCategory(category);
  };

  const logout = async () => {
    if (loggingOut) {
      return;
    }

    const confirmed = await showConfirm(
      "Sign out of dashboard?",
      "Your administrator session will be terminated.",
    );

    if (!confirmed) {
      return;
    }

    setLoggingOut(true);

    try {
      const body = new URLSearchParams();

      body.append("action", "logout");

      const response = await fetch(`${BACKEND_URL}/api/auth.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body,
      });

      if (!response.ok) {
        throw new Error("Logout failed.");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Sign out failed.");
      }

      await showSuccess("Signed out", "See you again.");

      window.location.href = "/login/mimin";
    } catch (error) {
      console.error("Logout error:", error);

      await showError(
        "Sign out failed",
        error instanceof Error
          ? error.message
          : "Unable to sign out of account.",
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const pageTitle =
    activeView === "overview"
      ? "Overview"
      : activeView === "traffic"
        ? "Traffic"
        : activeView === "categories"
          ? "Categories"
          : activeView === "ctf"
            ? "Defacement CTF"
            : activeView === "reports"
              ? "Reports"
              : activeView === "messages"
                ? "Messages"
                : activeView === "account"
                  ? "Admin Account"
                  : selectedCategory || "All Tools";

  const pageSubtitle =
    activeView === "overview"
      ? "XeooTools catalog overview and system health"
      : activeView === "traffic"
        ? "Website traffic analytics, unique visitors, popular tools, and activity stream"
        : activeView === "categories"
          ? "Manage categories and database configuration"
          : activeView === "ctf"
            ? "Manage defacement CTF challenges, operators, settings and security events"
            : activeView === "reports"
              ? "Review and handle user-submitted issue reports"
              : activeView === "messages"
                ? "Review and manage contact inbox messages"
                : activeView === "account"
                  ? "Administrator profile and authentication activity"
                  : selectedCategory
                    ? `Tools in ${selectedCategory} category`
                    : "Manage and configure the full tools catalog";

  if (loading) {
    return null;
  }

  if (!authorized) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-xeoo-bg">
      <div className="flex min-h-screen">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          activeView={activeView}
          selectedCategory={selectedCategory}
          username={username}
          avatar={resolveAvatarUrl(avatar)}
          onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onNavigate={navigate}
          onSelectCategory={selectCategory}
        />

        <div className="min-w-0 flex-1">
          <AdminTopbar
            title={pageTitle}
            subtitle={pageSubtitle}
            username={username}
            displayName={displayName}
            avatar={resolveAvatarUrl(avatar)}
            refreshing={refreshing || categoryLoading}
            loggingOut={loggingOut}
            onOpenSidebar={() => setMobileSidebarOpen(true)}
            onRefresh={() => {
              void loadTools({
                showLoading: true,
                showErrorMessage: true,
              });

              void loadCategories({
                showLoading: true,
                showErrorMessage: true,
              });
            }}
            onLogout={logout}
          />

          <main className="mx-auto w-full max-w-7xl px-3 py-3.5 sm:px-4 sm:py-4 lg:px-5">
            {activeView === "overview" && (
              <div className="space-y-3">
                <section className="px-0.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-xeoo-primary">
                    Control Center
                  </p>

                  <div className="mt-0.5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
                    <div className="min-w-0">
                      <h2 className="text-xl font-extrabold leading-tight tracking-tight text-xeoo-text sm:text-2xl">
                        Good day, {username || "Admin"}
                      </h2>

                      <p className="mt-0.5 max-w-2xl text-[11px] leading-4 text-xeoo-muted sm:text-[12px]">
                        Monitor tool status, categories, and system health in
                        real-time.
                      </p>
                    </div>
                  </div>
                </section>

                <AdminStats
                  total={tools.length}
                  ready={readyTools.length}
                  maintenance={maintenanceTools.length}
                  upcoming={upcomingTools.length}
                  categories={categories.length}
                />

                <section className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
                  <StatusListPanel
                    title="Maintenance"
                    subtitle="Tools currently offline."
                    tools={maintenanceTools}
                    status="maintenance"
                    emptyTitle="All tools operational."
                    emptyDescription="No tools are currently under maintenance."
                  />

                  <StatusListPanel
                    title="Upcoming"
                    subtitle="Tools in active development."
                    tools={upcomingTools}
                    status="upcoming"
                    emptyTitle="No upcoming tools."
                    emptyDescription="No new tools currently scheduled for release."
                  />
                </section>

                <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-sm">
                  <div className="flex items-center gap-2.5 border-b border-xeoo-border px-3 py-2.5 sm:px-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-xeoo-primary-soft text-xeoo-primary">
                      <Filter size={13} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-[12px] font-extrabold text-xeoo-text">
                        Quick Summary
                      </h3>

                      <p className="text-[10px] text-xeoo-muted">
                        Distribution of current catalog statuses.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 px-3 py-3 sm:grid-cols-3 sm:px-4">
                    <SummaryRow
                      label="Ready"
                      value={readyTools.length}
                      total={tools.length}
                      status="ready"
                    />

                    <SummaryRow
                      label="Maintenance"
                      value={maintenanceTools.length}
                      total={tools.length}
                      status="maintenance"
                    />

                    <SummaryRow
                      label="Upcoming"
                      value={upcomingTools.length}
                      total={tools.length}
                      status="upcoming"
                    />
                  </div>
                </section>
              </div>
            )}

            {activeView === "traffic" && (
              <AdminTraffic onUnauthorized={handleUnauthorized} />
            )}

            {activeView === "categories" && (
              <AdminCategories
                categories={categories}
                categoryLoading={categoryLoading}
                categoryDeletingId={categoryDeletingId}
                onCreate={openCreateCategory}
                onEdit={openEditCategory}
                onDelete={(category) => void deleteCategory(category)}
              />
            )}

            {activeView === "all" && (
              <AdminTools
                tools={tools}
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectedCategoryChange={setSelectedCategory}
                onUnauthorized={() => setAuthorized(false)}
                onRefresh={async () => {
                  await Promise.all([
                    loadTools({
                      showLoading: false,
                      showErrorMessage: false,
                    }),

                    loadCategories({
                      showLoading: false,
                      showErrorMessage: false,
                    }),
                  ]);
                }}
              />
            )}

            {activeView === "ctf" && (
              <AdminCtf onUnauthorized={handleUnauthorized} />
            )}

            {activeView === "reports" && (
              <AdminReports onUnauthorized={handleUnauthorized} />
            )}

            {activeView === "messages" && <AdminMessages />}

            {activeView === "account" && <AdminAccount username={username} />}
          </main>
        </div>
      </div>

      {categoryDialog && (
        <CategoryDialog
          mode={categoryDialog}
          form={categoryForm}
          saving={categorySaving}
          onChange={updateCategoryForm}
          onClose={closeCategoryDialog}
          onSave={() => void saveCategory()}
        />
      )}
    </div>
  );
}

function StatusListPanel({
  title,
  subtitle,
  tools,
  status,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  subtitle: string;
  tools: AdminTool[];
  status: ToolStatus;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const Icon = getStatusIcon(status);

  const meta = STATUS_META[status];

  return (
    <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-xeoo-border px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className={[
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
              meta.className,
            ].join(" ")}
          >
            <Icon size={13} strokeWidth={2.1} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-[12px] font-extrabold text-xeoo-text">
              {title}
            </h3>

            <p className="truncate text-[10px] text-xeoo-muted">{subtitle}</p>
          </div>
        </div>

        <span
          className={[
            "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold",
            meta.className,
          ].join(" ")}
        >
          {tools.length}
        </span>
      </div>

      {tools.length === 0 ? (
        <div className="px-3 py-7 text-center sm:px-4">
          <div
            className={[
              "mx-auto flex h-8 w-8 items-center justify-center rounded-lg border",
              meta.className,
            ].join(" ")}
          >
            <Icon size={14} strokeWidth={2} />
          </div>

          <p className="mt-2 text-[11px] font-bold text-xeoo-text">
            {emptyTitle}
          </p>

          <p className="mt-0.5 text-[10px] text-xeoo-muted">
            {emptyDescription}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-xeoo-border">
          {tools.slice(0, 5).map((tool) => {
            const ToolIcon = getToolIcon(tool.icon);

            const CategoryIcon = getCategoryIcon(tool.category_slug);

            return (
              <div
                key={tool.id}
                className="flex items-center gap-2.5 px-3 py-2 sm:px-4"
              >
                <div
                  className={[
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                    meta.className,
                  ].join(" ")}
                >
                  <ToolIcon size={13} strokeWidth={1.8} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold text-xeoo-text">
                    {tool.name}
                  </p>

                  <div className="mt-0.5 flex min-w-0 items-center gap-1">
                    <CategoryIcon
                      size={9}
                      className="shrink-0 text-xeoo-muted"
                    />

                    <span className="truncate text-[10px] text-xeoo-muted">
                      {tool.category_name}
                    </span>
                  </div>
                </div>

                <span
                  className={[
                    "hidden shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold sm:inline-flex",
                    meta.className,
                  ].join(" ")}
                >
                  {meta.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {tools.length > 5 && (
        <div className="border-t border-xeoo-border px-3 py-1.5 text-right sm:px-4">
          <span className="text-[10px] font-semibold text-xeoo-muted">
            +{tools.length - 5} more
          </span>
        </div>
      )}
    </section>
  );
}

function SummaryRow({
  label,
  value,
  total,
  status,
}: {
  label: string;
  value: number;
  total: number;
  status: ToolStatus;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  const progressClass =
    status === "ready"
      ? "bg-emerald-500"
      : status === "maintenance"
        ? "bg-amber-500"
        : "bg-sky-500";

  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold text-xeoo-muted">
          {label}
        </span>

        <span className="text-[10px] font-bold text-xeoo-text">
          {value}{" "}
          <span className="font-medium text-xeoo-muted">({percentage}%)</span>
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-xeoo-surface-soft">
        <div
          className={["h-full rounded-full transition-all", progressClass].join(
            " ",
          )}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="mt-1 text-[10px] leading-4 text-xeoo-muted">
        {STATUS_META[status].description}
      </p>
    </div>
  );
}

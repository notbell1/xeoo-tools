import type { LucideIcon } from "lucide-react";

import {
  ChevronLeft,
  ChevronRight,
  FileWarning,
  Folder,
  LayoutDashboard,
  MessagesSquare,
  Settings2,
  ShieldAlert,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

import type { AdminView } from "../../types/admin";

interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  activeView: AdminView;
  selectedCategory: string | null;
  username: string;
  avatar?: string | null;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onNavigate: (view: AdminView) => void;
  onSelectCategory: (category: string) => void;
}

interface NavigationItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

function NavigationItem({
  icon: Icon,
  label,
  active,
  collapsed,
  onClick,
}: NavigationItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={[
        "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition",
        active
          ? "bg-xeoo-text text-xeoo-surface shadow-xs"
          : "text-xeoo-text-soft hover:bg-xeoo-surface-soft hover:text-xeoo-text",
      ].join(" ")}
    >
      <Icon size={17} strokeWidth={active ? 2.2 : 1.9} className="shrink-0" />

      {!collapsed && (
        <span className="min-w-0 flex-1 truncate text-xs font-semibold">
          {label}
        </span>
      )}
    </button>
  );
}

function AccountAvatar({
  username,
  avatar,
  size = "normal",
}: {
  username: string;
  avatar?: string | null;
  size?: "normal" | "large";
}) {
  const initial = (username || "A").slice(0, 1).toUpperCase();

  const avatarClass = size === "large" ? "h-9 w-9" : "h-8 w-8";

  return (
    <div
      className={[
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-xeoo-primary text-[10px] font-bold text-white",
        avatarClass,
      ].join(" ")}
    >
      <span className="absolute inset-0 flex items-center justify-center">
        {initial}
      </span>

      {avatar && (
        <img
          src={avatar}
          alt="Admin avatar"
          className="relative z-10 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}
    </div>
  );
}

export default function AdminSidebar({
  collapsed,
  mobileOpen,
  activeView,
  selectedCategory,
  username,
  avatar,
  onToggleCollapse,
  onCloseMobile,
  onNavigate,
  onSelectCategory: _onSelectCategory,
}: AdminSidebarProps) {
  const handleNavigate = (view: AdminView) => {
    onNavigate(view);
    onCloseMobile();
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        className={[
          "hidden shrink-0 border-r border-xeoo-border bg-xeoo-surface transition-[width] duration-200 lg:flex",
          collapsed ? "w-18" : "w-64",
        ].join(" ")}
      >
        <div className="sticky top-0 flex h-screen w-full flex-col">
          {/* BRAND */}
          <div
            className={[
              "relative flex h-16 shrink-0 items-center border-b border-xeoo-border",
              collapsed ? "justify-center px-2" : "justify-between px-4",
            ].join(" ")}
          >
            <div
              className={[
                "flex min-w-0 items-center",
                collapsed ? "justify-center" : "gap-2.5",
              ].join(" ")}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-xeoo-black p-1.5 text-white">
                <img
                  src="/xeoo-icon.svg"
                  alt="XeooTools"
                  className="h-full w-full object-contain"
                />
              </div>

              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-xs font-extrabold">XeooTools</p>

                  <p className="text-[10px] text-xeoo-muted">Admin Panel</p>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                title="Minimize sidebar"
                aria-label="Minimize sidebar"
              >
                <ChevronLeft size={15} />
              </button>
            )}

            {collapsed && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="absolute -right-3.25 top-18 flex h-7 w-7 items-center justify-center rounded-full border border-xeoo-border bg-xeoo-surface text-xeoo-text shadow-sm transition hover:bg-xeoo-surface-soft"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* NAVIGATION */}
          <div className="flex-1 overflow-y-auto px-2.5 py-4">
            {/* MAIN */}
            <div className="space-y-1">
              {!collapsed && (
                <p className="px-2 pb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-xeoo-muted">
                  Main
                </p>
              )}

              {/* OVERVIEW */}
              <NavigationItem
                icon={LayoutDashboard}
                label="Overview"
                active={activeView === "overview"}
                collapsed={collapsed}
                onClick={() => handleNavigate("overview")}
              />

              {/* CATEGORIES */}
              <NavigationItem
                icon={Folder}
                label="Categories"
                active={activeView === "categories"}
                collapsed={collapsed}
                onClick={() => handleNavigate("categories")}
              />

              {/* ALL TOOLS */}
              <NavigationItem
                icon={Wrench}
                label="All Tools"
                active={activeView === "all"}
                collapsed={collapsed}
                onClick={() => handleNavigate("all")}
              />

              {/* CTF PLATFORM */}
              <NavigationItem
                icon={ShieldAlert}
                label="CTF Platform"
                active={activeView === "ctf"}
                collapsed={collapsed}
                onClick={() => handleNavigate("ctf")}
              />

              {/* REPORTS */}
              <NavigationItem
                icon={FileWarning}
                label="Reports"
                active={activeView === "reports"}
                collapsed={collapsed}
                onClick={() => handleNavigate("reports")}
              />

              {/* INBOX */}
              <NavigationItem
                icon={MessagesSquare}
                label="Inbox"
                active={activeView === "messages"}
                collapsed={collapsed}
                onClick={() => handleNavigate("messages")}
              />
            </div>

            {/* SYSTEM */}
            <div className="mt-5">
              {!collapsed && (
                <p className="px-2 pb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-xeoo-muted">
                  System
                </p>
              )}

              {collapsed && (
                <div className="mx-auto mb-2 h-px w-7 bg-xeoo-border" />
              )}

              <NavigationItem
                icon={UserRound}
                label="Account"
                active={activeView === "account"}
                collapsed={collapsed}
                onClick={() => handleNavigate("account")}
              />
            </div>
          </div>

          {/* BOTTOM ACCOUNT */}
          <div className="border-t border-xeoo-border p-2.5">
            {!collapsed ? (
              <div className="rounded-xl bg-xeoo-surface-soft p-3">
                <div className="flex items-center gap-2">
                  <AccountAvatar username={username} avatar={avatar} />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-bold">
                      {username || "Admin"}
                    </p>

                    <p className="text-[10px] text-xeoo-muted">Administrator</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex w-full items-center justify-center">
                <AccountAvatar username={username} avatar={avatar} />
              </div>
            )}

            {!collapsed && (
              <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-xeoo-muted">
                <Settings2 size={9} />
                XeooTools Admin
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* OVERLAY */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            aria-label="Close navigation"
          />

          {/* DRAWER */}
          <aside className="absolute inset-y-0 left-0 flex w-[min(82vw,300px)] flex-col border-r border-xeoo-border bg-xeoo-surface shadow-2xl">
            {/* HEADER */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-xeoo-border px-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-xeoo-black p-1.5">
                  <img
                    src="/xeoo-icon.svg"
                    alt="XeooTools"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div>
                  <p className="text-xs font-extrabold">XeooTools</p>

                  <p className="text-[10px] text-xeoo-muted">Admin Panel</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onCloseMobile}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                aria-label="Close navigation"
              >
                <X size={17} />
              </button>
            </div>

            {/* MOBILE NAV */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <p className="px-2 pb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-xeoo-muted">
                Main
              </p>

              <div className="space-y-1">
                {/* OVERVIEW */}
                <NavigationItem
                  icon={LayoutDashboard}
                  label="Overview"
                  active={activeView === "overview"}
                  collapsed={false}
                  onClick={() => handleNavigate("overview")}
                />

                {/* CATEGORIES */}
                <NavigationItem
                  icon={Folder}
                  label="Categories"
                  active={activeView === "categories"}
                  collapsed={false}
                  onClick={() => handleNavigate("categories")}
                />

                {/* ALL TOOLS */}
                <NavigationItem
                  icon={Wrench}
                  label="All Tools"
                  active={activeView === "all" && selectedCategory === null}
                  collapsed={false}
                  onClick={() => handleNavigate("all")}
                />

                {/* CTF PLATFORM */}
                <NavigationItem
                  icon={ShieldAlert}
                  label="CTF Platform"
                  active={activeView === "ctf"}
                  collapsed={false}
                  onClick={() => handleNavigate("ctf")}
                />

                {/* REPORTS */}
                <NavigationItem
                  icon={FileWarning}
                  label="Reports"
                  active={activeView === "reports"}
                  collapsed={false}
                  onClick={() => handleNavigate("reports")}
                />

                {/* INBOX */}
                <NavigationItem
                  icon={MessagesSquare}
                  label="Inbox"
                  active={activeView === "messages"}
                  collapsed={false}
                  onClick={() => handleNavigate("messages")}
                />
              </div>

              {/* SYSTEM */}
              <p className="mt-5 px-2 pb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-xeoo-muted">
                System
              </p>

              <NavigationItem
                icon={UserRound}
                label="Account"
                active={activeView === "account"}
                collapsed={false}
                onClick={() => handleNavigate("account")}
              />
            </div>

            {/* MOBILE ACCOUNT */}
            <div className="border-t border-xeoo-border p-3">
              <div className="flex items-center gap-2 rounded-xl bg-xeoo-surface-soft p-3">
                <AccountAvatar username={username} avatar={avatar} />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-bold">
                    {username || "Admin"}
                  </p>

                  <p className="text-[10px] text-xeoo-muted">Administrator</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

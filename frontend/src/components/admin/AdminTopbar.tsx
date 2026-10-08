import { LoaderCircle, LogOut, Menu, RotateCw } from "lucide-react";

interface AdminTopbarProps {
  title: string;
  subtitle: string;
  username: string;
  displayName?: string;
  avatar?: string | null;
  refreshing: boolean;
  loggingOut: boolean;
  onOpenSidebar: () => void;
  onRefresh: () => void;
  onLogout: () => void;
}

function getInitial(displayName: string, username: string) {
  const source = displayName.trim() || username.trim() || "A";

  return source.slice(0, 1).toUpperCase();
}

export default function AdminTopbar({
  title,
  subtitle,
  username,
  displayName = "",
  avatar = null,
  refreshing,
  loggingOut,
  onOpenSidebar,
  onRefresh,
  onLogout,
}: AdminTopbarProps) {
  const initial = getInitial(displayName, username);

  return (
    <header className="sticky top-0 z-30 border-b border-xeoo-border bg-xeoo-surface/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-5 lg:px-6">
        {/* MOBILE MENU */}
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface text-xeoo-text transition hover:bg-xeoo-surface-soft lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>

        {/* TITLE */}
        <div className="min-w-0 flex-1 lg:pl-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-sm font-extrabold tracking-tight sm:text-base">
              {title}
            </h1>
          </div>

          <p className="truncate text-[10px] text-xeoo-muted sm:text-[11px]">
            {subtitle}
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex shrink-0 items-center gap-2">
          {/* REFRESH BUTTON */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface text-xeoo-text-soft transition hover:bg-xeoo-surface-soft hover:text-xeoo-text disabled:opacity-50"
            title="Refresh data"
            aria-label="Refresh data"
          >
            <RotateCw
              size={14}
              className={refreshing ? "animate-spin text-xeoo-primary" : ""}
            />
          </button>

          {/* USER / PROFILE */}
          <div className="flex items-center gap-2 rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-2 py-1.5 sm:px-2.5">
            {/* AVATAR */}
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-xeoo-primary text-[10px] font-bold text-white sm:h-8 sm:w-8">
              {/* FALLBACK INITIAL */}
              <span className="absolute inset-0 flex items-center justify-center">
                {initial}
              </span>

              {/* REAL AVATAR */}
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

            {/* USER INFO */}
            <div className="hidden min-w-0 sm:block">
              <p className="max-w-24 truncate text-[10px] font-bold text-xeoo-text lg:max-w-32">
                {displayName || username || "Admin"}
              </p>

              <p className="max-w-24 truncate text-[9px] text-xeoo-muted lg:max-w-32">
                @{username || "admin"}
              </p>
            </div>
          </div>

          {/* LOGOUT */}
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 text-[10px] font-bold text-xeoo-text-soft transition hover:border-xeoo-danger/30 hover:bg-xeoo-danger-soft hover:text-xeoo-danger disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <LogOut size={14} />
            )}

            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

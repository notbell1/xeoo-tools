import { Flag, Menu, Wrench } from "lucide-react";
import { Link } from "react-router-dom";

interface FrontendTopbarProps {
  onOpenSidebar: () => void;
}

export default function FrontendTopbar({ onOpenSidebar }: FrontendTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full shrink-0 items-center justify-between border-b border-xeoo-border bg-xeoo-bg/95 px-3 backdrop-blur-md sm:px-4 lg:hidden">
      {/* LEFT: Toggle Button & Brand */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-xeoo-border bg-xeoo-surface text-xeoo-text shadow-xs transition hover:bg-xeoo-surface-soft active:scale-95"
          aria-label="Buka menu navigasi"
        >
          <Menu size={18} strokeWidth={2} />
        </button>

        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-xeoo-black p-1 shadow-xs">
            <img
              src="/xeoo-icon.svg"
              alt="XeooTools"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-sm font-extrabold tracking-tight text-xeoo-text">
            XeooTools
          </span>
        </Link>
      </div>

      {/* RIGHT: Quick Shortcuts */}
      <div className="flex items-center gap-1.5">
        <Link
          to="/tools"
          className="flex h-8 items-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 text-xs font-semibold text-xeoo-text transition hover:bg-xeoo-surface-soft"
          title="Lihat semua tools"
        >
          <Wrench size={13} strokeWidth={2} />
          <span className="hidden sm:inline">Tools</span>
        </Link>

        <Link
          to="/report"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface text-xeoo-text-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text"
          title="Report Bug / Feedback"
        >
          <Flag size={14} />
        </Link>
      </div>
    </header>
  );
}

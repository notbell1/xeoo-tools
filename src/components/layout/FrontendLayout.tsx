import { type ReactNode, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import FrontendSidebar from "./FrontendSidebar";
import FrontendTopbar from "./FrontendTopbar";

const SIDEBAR_STORAGE_KEY = "xeoo_sidebar_minimized";

export default function FrontendLayout({ children }: { children?: ReactNode }) {
  const location = useLocation();

  // Desktop sidebar minimized preference persisted in localStorage
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Mobile drawer open state
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  // Close mobile drawer and scroll to top on route change
  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  // Standalone status view (e.g. /tools/xyz=maintenance or /tools/xyz=soon)
  const isStandaloneStatus = location.pathname.includes("=");
  if (isStandaloneStatus) {
    return <>{children ?? <Outlet />}</>;
  }

  return (
    <div className="flex min-h-screen bg-xeoo-bg text-xeoo-text">
      {/* SIDEBAR NAVIGATION */}
      <FrontendSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={handleToggleCollapse}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* MAIN VIEWPORT */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile / Tablet Topbar */}
        <FrontendTopbar onOpenSidebar={() => setMobileOpen(true)} />

        {/* Dynamic Route Content */}
        <div className="min-w-0 flex-1">
          {children ?? <Outlet />}
        </div>
      </div>
    </div>
  );
}

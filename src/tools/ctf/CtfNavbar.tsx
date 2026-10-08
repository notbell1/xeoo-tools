import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Terminal,
  Trophy,
  Flag,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  ExternalLink,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { useCtfAuth } from "./ctfAuth";
import { COUNTRIES_MAP } from "./ctfConstants";

export const CtfNavbar: React.FC = () => {
  const { user, isAuthenticated, solvedCount, totalScore, totalChallenges, logout } = useCtfAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const country = user ? COUNTRIES_MAP[user.country_code] : null;

  const isActive = (path: string) => {
    if (path === "/ctf" && location.pathname === "/ctf") return true;
    if (path !== "/ctf" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = isAuthenticated
    ? [
        { label: "Dashboard", path: "/ctf", icon: Terminal },
        { label: "Case Files", path: "/ctf/challenges", icon: Flag },
        { label: "Leaderboard", path: "/ctf/leaderboard", icon: Trophy },
      ]
    : [
        { label: "Leaderboard", path: "/ctf/leaderboard", icon: Trophy },
      ];

  const brandLink = isAuthenticated ? "/ctf" : "/ctf/leaderboard";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-xeoo-border bg-xeoo-surface/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-5">
          <Link
            to={brandLink}
            className="group flex items-center gap-2.5 text-xeoo-text transition-colors hover:text-xeoo-primary"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-xeoo-surface-soft border border-xeoo-border text-xeoo-primary transition-all group-hover:bg-xeoo-primary group-hover:text-white">
              <Terminal className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-xeoo-text">
                Xeoo Tools <span className="text-xeoo-primary">CTF</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-xeoo-muted font-mono">
                Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-xeoo-primary/10 text-xeoo-primary ring-1 ring-xeoo-primary/20"
                      : "text-xeoo-muted hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action / Stats / Auth */}
        <div className="hidden md:flex items-center gap-2.5">
          {isAuthenticated && user ? (
            <>
              {/* Solved Badge */}
              <div
                title={`${solvedCount} dari ${totalChallenges} kasus solved`}
                className="flex items-center gap-1.5 rounded-md border border-xeoo-border bg-xeoo-surface-soft px-2.5 py-1 text-xs font-mono text-xeoo-text"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-xeoo-success" />
                <span>
                  {solvedCount}/{totalChallenges}
                </span>
              </div>

              {/* Score Badge */}
              <div
                title="Total Skor"
                className="flex items-center gap-1.5 rounded-md border border-xeoo-primary/30 bg-xeoo-primary/5 px-2.5 py-1 text-xs font-mono font-bold text-xeoo-primary"
              >
                <Flame className="h-3.5 w-3.5" />
                <span>{totalScore} PTS</span>
              </div>

              {/* Profile link */}
              <Link
                to="/ctf/profile"
                className={`flex items-center gap-2 rounded-lg border border-xeoo-border px-2.5 py-1 text-xs font-medium transition-colors ${
                  isActive("/ctf/profile")
                    ? "bg-xeoo-primary/10 text-xeoo-primary border-xeoo-primary/30 font-bold"
                    : "bg-xeoo-surface hover:bg-xeoo-surface-soft text-xeoo-text"
                }`}
              >
                <span className="text-sm leading-none">{country?.flag || "🌐"}</span>
                <span className="font-mono">{user.username}</span>
              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={logout}
                title="Keluar akun"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-xeoo-border text-xeoo-muted transition-colors hover:bg-xeoo-danger/10 hover:border-xeoo-danger/30 hover:text-xeoo-danger cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/ctf/login"
                className={`flex items-center gap-1.5 rounded-lg border border-xeoo-border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive("/ctf/login")
                    ? "bg-xeoo-primary text-white border-xeoo-primary"
                    : "bg-xeoo-surface hover:bg-xeoo-surface-soft text-xeoo-text"
                }`}
              >
                <LogIn className="h-3.5 w-3.5" />
                Login
              </Link>
              <Link
                to="/ctf/register"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive("/ctf/register")
                    ? "bg-xeoo-primary text-white ring-2 ring-xeoo-primary/30"
                    : "bg-xeoo-primary text-white hover:bg-xeoo-primary-hover shadow-xs"
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                Register
              </Link>
            </>
          )}

          {/* Back to XeooTools Main Hub */}
          <div className="h-4 w-px bg-xeoo-border mx-1" />
          <Link
            to="/"
            title="Kembali ke XeooTools"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-xeoo-muted transition-colors hover:text-xeoo-text"
          >
            <span>XeooTools</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated && (
            <div className="flex items-center gap-1 rounded bg-xeoo-primary/10 px-2 py-0.5 text-xs font-mono font-bold text-xeoo-primary">
              {totalScore}p
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-xeoo-border text-xeoo-text hover:bg-xeoo-surface-soft cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-xeoo-border bg-xeoo-surface px-4 py-3 space-y-2">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium ${
                  active
                    ? "bg-xeoo-primary/10 text-xeoo-primary font-bold"
                    : "text-xeoo-text hover:bg-xeoo-surface-soft"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-xeoo-border flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/ctf/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-xeoo-text hover:bg-xeoo-surface-soft"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{user.username}</span>
                  </div>
                  <span className="font-mono text-xs text-xeoo-primary font-bold">
                    {totalScore} PTS ({solvedCount}/{totalChallenges})
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-xeoo-danger hover:bg-xeoo-danger/10 w-full text-left cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/ctf/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-xeoo-border py-2 text-xs font-medium text-xeoo-text hover:bg-xeoo-surface-soft"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
                <Link
                  to="/ctf/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary py-2 text-xs font-semibold text-white hover:bg-xeoo-primary-hover"
                >
                  <UserPlus className="h-4 w-4" />
                  Register
                </Link>
              </div>
            )}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 text-xs text-xeoo-muted py-1"
            >
              Kembali ke XeooTools Hub
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

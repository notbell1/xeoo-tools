import React, { useEffect } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { CtfAuthProvider, useCtfAuth } from "./ctfAuth";
import { CtfNavbar } from "./CtfNavbar";
import { CtfDashboard } from "./CtfDashboard";
import { CtfChallengeList } from "./CtfChallengeList";
import { CtfChallengePlayer } from "./CtfChallengePlayer";
import { CtfLeaderboard } from "./CtfLeaderboard";
import { CtfProfile } from "./CtfProfile";
import { CtfLogin } from "./CtfLogin";
import { CtfRegister } from "./CtfRegister";
import { CtfForgotPassword } from "./CtfForgotPassword";
import { CtfResetPassword } from "./CtfResetPassword";
import { CtfMaintenance } from "./CtfMaintenance";
import { CtfSoon } from "./CtfSoon";
import { CtfNotFound } from "./CtfNotFound";
import { Terminal, ExternalLink } from "lucide-react";

const CtfRoutesInner: React.FC = () => {
  const { settings, loading, isAuthenticated, refreshSession } = useCtfAuth();
  const location = useLocation();

  useEffect(() => {
    refreshSession();
  }, [location.pathname, refreshSession]);

  if (!loading) {
    if (settings.maintenance_mode) {
      return <CtfMaintenance message={settings.maintenance_message} />;
    }
    if (!settings.ctf_enabled) {
      return <CtfSoon message={settings.soon_message} />;
    }
  }

  // Unauthenticated guests only have access to Login, Register, Forgot/Reset Password, and Leaderboard
  return (
    <Routes>
      <Route
        index
        element={
          isAuthenticated ? <CtfDashboard /> : <CtfLogin />
        }
      />
      <Route
        path="challenges"
        element={
          isAuthenticated ? <CtfChallengeList /> : <Navigate to="/ctf/login" replace />
        }
      />
      <Route
        path="challenge/:slug"
        element={
          isAuthenticated ? <CtfChallengePlayer /> : <Navigate to="/ctf/login" replace />
        }
      />
      <Route path="leaderboard" element={<CtfLeaderboard />} />
      <Route
        path="profile"
        element={
          isAuthenticated ? <CtfProfile /> : <Navigate to="/ctf/login" replace />
        }
      />
      <Route
        path="login"
        element={
          isAuthenticated ? <Navigate to="/ctf" replace /> : <CtfLogin />
        }
      />
      <Route
        path="register"
        element={
          isAuthenticated ? <Navigate to="/ctf" replace /> : <CtfRegister />
        }
      />
      <Route path="forgot-password" element={<CtfForgotPassword />} />
      <Route path="reset-password" element={<CtfResetPassword />} />
      <Route path="*" element={<CtfNotFound />} />
    </Routes>
  );
};

export const DefacementCTF: React.FC = () => {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = "Xeoo Tools -  CTF Platform";
    return () => {
      document.title = originalTitle;
    };
  }, []);

  return (
    <CtfAuthProvider>
      <div className="min-h-screen bg-xeoo-bg text-xeoo-text flex flex-col font-sans selection:bg-xeoo-primary/20 selection:text-xeoo-primary">
        {/* CTF Dedicated Navbar */}
        <CtfNavbar />

        {/* Main View Area */}
        <main className="flex-1 pb-8">
          <CtfRoutesInner />
        </main>

        {/* CTF Dedicated Compact Subsystem Footer */}
        <footer className="border-t border-xeoo-border bg-xeoo-surface/60 py-3 text-xs text-xeoo-muted">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-xeoo-primary" />
              <span className="font-semibold text-xeoo-text">Xeoo Tools CTF Platform</span>
              <span>—</span>
              <span>Defacement Investigation Workspace</span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <Link to="/ctf/leaderboard" className="hover:text-xeoo-text transition-colors">
                Leaderboard
              </Link>
              <Link to="/" className="flex items-center gap-1 hover:text-xeoo-text text-xeoo-primary transition-colors">
                XeooTools Hub
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </CtfAuthProvider>
  );
};

export default DefacementCTF;


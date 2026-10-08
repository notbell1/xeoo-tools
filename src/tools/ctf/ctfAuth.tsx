import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ctfApi } from "./ctfApi";
import type { CtfUser, CtfSettings } from "./ctfTypes";
import { showError, showSuccess } from "../../alert";

interface CtfAuthContextType {
  user: CtfUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  solvedCount: number;
  solvedChallengeIds: Set<number>;
  totalScore: number;
  totalChallenges: number;
  settings: CtfSettings;
  refreshSession: () => Promise<void>;
  login: (login: string, password: string) => Promise<boolean>;
  register: (payload: {
    username: string;
    email: string;
    password: string;
    password_confirmation?: string;
    confirm_password?: string;
    country_code: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  markChallengeSolved: (challengeId: number, points: number) => void;
}

const defaultSettings: CtfSettings = {
  ctf_enabled: true,
  registration_enabled: true,
  login_enabled: true,
  password_reset_enabled: true,
  submissions_enabled: true,
  leaderboard_enabled: true,
  maintenance_mode: false,
  maintenance_message: "CTF platform is undergoing scheduled maintenance.",
  soon_message: "CTF platform launching soon.",
};

const CtfAuthContext = createContext<CtfAuthContextType | undefined>(undefined);

export const CtfAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CtfUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [solvedChallengeIds, setSolvedChallengeIds] = useState<Set<number>>(new Set());
  const [totalScore, setTotalScore] = useState<number>(0);
  const [totalChallenges, setTotalChallenges] = useState<number>(15);
  const [settings, setSettings] = useState<CtfSettings>(defaultSettings);

  const refreshSession = useCallback(async () => {
    try {
      const res = await ctfApi.getSession();
      if (res.success && res.data) {
        setUser(res.data.user);
        setSolvedCount(res.data.solved_count || 0);
        setSolvedChallengeIds(new Set(res.data.solved_challenge_ids || []));
        setTotalScore(res.data.total_score || 0);
        setTotalChallenges(res.data.total_challenges || 15);
        if (res.data.settings) {
          setSettings(res.data.settings);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();

    // Auto-sync settings when tab regains focus
    const handleFocus = () => {
      refreshSession();
    };
    window.addEventListener("focus", handleFocus);

    // Periodic sync every 20 seconds to keep settings & state up-to-date
    const interval = setInterval(() => {
      refreshSession();
    }, 20000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [refreshSession]);

  const login = async (loginStr: string, passwordStr: string): Promise<boolean> => {
    try {
      const res = await ctfApi.login(loginStr, passwordStr);
      if (res.success) {
        await refreshSession();
        showSuccess("Welcome Back", "Authentication successful.");
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      showError("Login Error", msg);
      return false;
    }
  };

  const register = async (payload: {
    username: string;
    email: string;
    password: string;
    password_confirmation?: string;
    confirm_password?: string;
    country_code: string;
  }): Promise<boolean> => {
    try {
      const res = await ctfApi.register(payload);
      if (res.success) {
        showSuccess("Registration Successful", "Account successfully created. Please log in to continue.");
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      showError("Registration Error", msg);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await ctfApi.logout();
    } catch {
      // ignore
    } finally {
      setUser(null);
      setSolvedCount(0);
      setSolvedChallengeIds(new Set());
      setTotalScore(0);
      showSuccess("Logged Out", "You have been safely disconnected.");
    }
  };

  const markChallengeSolved = (challengeId: number, points: number) => {
    setSolvedChallengeIds((prev) => {
      const next = new Set(prev);
      next.add(challengeId);
      return next;
    });
    setSolvedCount((prev) => prev + 1);
    setTotalScore((prev) => prev + points);
  };

  return (
    <CtfAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        solvedCount,
        solvedChallengeIds,
        totalScore,
        totalChallenges,
        settings,
        refreshSession,
        login,
        register,
        logout,
        markChallengeSolved,
      }}
    >
      {children}
    </CtfAuthContext.Provider>
  );
};

export function useCtfAuth(): CtfAuthContextType {
  const context = useContext(CtfAuthContext);
  if (!context) {
    throw new Error("useCtfAuth must be used within a CtfAuthProvider");
  }
  return context;
}


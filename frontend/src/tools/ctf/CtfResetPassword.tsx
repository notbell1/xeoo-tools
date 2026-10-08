import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound, ArrowRight, Loader2, ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react";
import { ctfApi } from "./ctfApi";
import { useCtfAuth } from "./ctfAuth";
import { showError, showSuccess } from "../../alert";

export const CtfResetPassword: React.FC = () => {
  const { settings } = useCtfAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(searchParams.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (settings.password_reset_enabled === false) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-3 sm:p-4">
        <div className="max-w-md w-full text-center border border-xeoo-border bg-xeoo-surface rounded-xl p-6 shadow-xs">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-xeoo-warning/10 border border-xeoo-warning/30 text-xeoo-warning">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-xeoo-text mb-1.5">Reset Password Ditutup</h2>
          <p className="text-xs text-xeoo-muted mb-4 leading-relaxed">
            Fitur reset password dinonaktifkan sementara oleh administrator CTF Command.
          </p>
          <Link
            to="/ctf/login"
            className="inline-flex rounded-lg bg-xeoo-primary px-4 py-2 text-xs font-semibold text-white hover:bg-xeoo-primary-hover transition-colors"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      showError("Missing Token", "Reset token is required.");
      return;
    }
    if (password.length < 8) {
      showError("Weak Password", "Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      showError("Password Mismatch", "Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await ctfApi.resetPassword({
        token: token.trim(),
        password,
      });
      if (res.success) {
        showSuccess("Password Updated", "You can now log in with your new password.");
        navigate("/ctf/login");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Password reset failed";
      showError("Reset Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-xeoo-border bg-xeoo-surface p-6 sm:p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-xeoo-primary/10 text-xeoo-primary">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-xeoo-text">Set New Password</h1>
          <p className="mt-1 text-xs text-xeoo-muted">
            Provide the recovery token and specify your new authentication password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-xeoo-text" htmlFor="reset-token">
              Recovery Token
            </label>
            <input
              id="reset-token"
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste token here"
              className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 py-2 text-xs text-xeoo-text placeholder-xeoo-muted focus:border-xeoo-primary focus:outline-none focus:ring-1 focus:ring-xeoo-primary font-mono"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-xeoo-text" htmlFor="reset-new-pass">
              New Password (min 8 characters)
            </label>
            <div className="relative">
              <input
                id="reset-new-pass"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 py-2 pr-9 text-xs text-xeoo-text placeholder-xeoo-muted focus:border-xeoo-primary focus:outline-none focus:ring-1 focus:ring-xeoo-primary font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-xeoo-muted hover:text-xeoo-text cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-xeoo-text" htmlFor="reset-confirm-pass">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="reset-confirm-pass"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 py-2 pr-9 text-xs text-xeoo-text placeholder-xeoo-muted focus:border-xeoo-primary focus:outline-none focus:ring-1 focus:ring-xeoo-primary font-mono"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-xeoo-muted hover:text-xeoo-text cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-xeoo-primary py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:opacity-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting Password...
              </>
            ) : (
              <>
                Save & Update Password
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-xeoo-border pt-4 text-center">
          <Link
            to="/ctf/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-xeoo-muted hover:text-xeoo-text"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Operator Login
          </Link>
        </div>
      </div>
    </div>
  );
};


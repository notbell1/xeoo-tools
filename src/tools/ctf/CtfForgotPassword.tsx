import React, { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Mail, ArrowRight, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { ctfApi } from "./ctfApi";
import { useCtfAuth } from "./ctfAuth";
import { showError, showSuccess } from "../../alert";

export const CtfForgotPassword: React.FC = () => {
  const { settings } = useCtfAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

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
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      const res = await ctfApi.forgotPassword(email.trim().toLowerCase());
      if (res.success) {
        showSuccess("Request Processed", "If that account exists, a recovery token has been created.");
        if (res.data?.reset_token) {
          setResetToken(res.data.reset_token);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Request failed";
      showError("Recovery Failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-xeoo-border bg-xeoo-surface p-6 sm:p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-xeoo-primary/10 text-xeoo-primary">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-xeoo-text">Recover Credentials</h1>
          <p className="mt-1 text-xs text-xeoo-muted">
            Enter your badge email to generate an authorization recovery token
          </p>
        </div>

        {resetToken ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-xeoo-success/10 border border-xeoo-success/30 p-3 text-xs text-xeoo-text">
              <p className="font-semibold text-xeoo-success mb-1">Recovery Token Issued:</p>
              <div className="bg-xeoo-surface p-2 rounded font-mono text-[11px] break-all border border-xeoo-border">
                {resetToken}
              </div>
            </div>
            <Link
              to={`/ctf/reset-password?token=${encodeURIComponent(resetToken)}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-xeoo-primary py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-90"
            >
              Proceed to Set New Password
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-xeoo-text" htmlFor="forgot-email">
                Email Address
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xeoo-muted">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@agency.org"
                  className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft py-2 pl-9 pr-3 text-xs text-xeoo-text placeholder-xeoo-muted focus:border-xeoo-primary focus:outline-none focus:ring-1 focus:ring-xeoo-primary font-mono"
                />
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
                  Generating Token...
                </>
              ) : (
                <>
                  Send Recovery Request
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 border-t border-xeoo-border pt-4 text-center">
          <Link
            to="/ctf/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-xeoo-muted hover:text-xeoo-text"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to Operator Login
          </Link>
        </div>
      </div>
    </div>
  );
};


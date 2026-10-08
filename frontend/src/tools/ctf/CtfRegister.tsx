import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, KeyRound, Mail, User, Globe, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, Lock } from "lucide-react";
import { useCtfAuth } from "./ctfAuth";
import { COUNTRIES_LIST } from "./ctfConstants";
import type { CountryInfo } from "./ctfConstants";

export const CtfRegister: React.FC = () => {
  const { register, isAuthenticated, settings } = useCtfAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countryCode, setCountryCode] = useState("GLOBAL");
  const [submitting, setSubmitting] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/ctf");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.registration_enabled) return;
    setErrorLocal("");

    if (username.length < 3) {
      setErrorLocal("Username minimal 3 karakter.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setErrorLocal("Username hanya boleh huruf, angka, dan underscore (_).");
      return;
    }
    if (password.length < 8) {
      setErrorLocal("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorLocal("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    setSubmitting(true);
    const ok = await register({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      password_confirmation: confirmPassword,
      confirm_password: confirmPassword,
      country_code: countryCode,
    });
    setSubmitting(false);

    if (ok) {
      navigate("/ctf/login");
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-sm rounded-xl border border-xeoo-border bg-xeoo-surface p-5 sm:p-6 shadow-xs">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-lg bg-xeoo-surface-soft border border-xeoo-border text-xeoo-primary">
            <UserPlus className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-xeoo-text">Daftar Operator CTF</h1>
          <p className="mt-1 text-xs text-xeoo-muted">
            Buat badge akun untuk mencatat skor dan peringkat kasus
          </p>
        </div>

        {!settings.registration_enabled && (
          <div className="mb-4 rounded-lg border border-xeoo-warning/40 bg-xeoo-warning/10 p-3 text-xs text-xeoo-text space-y-1">
            <div className="flex items-center gap-2 font-bold text-xeoo-warning">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Registrasi Dinonaktifkan oleh Admin</span>
            </div>
            <p className="text-[11px] text-xeoo-muted leading-relaxed">
              Pendaftaran badge operator baru sementara ditutup oleh administrator CTF Command.
            </p>
            {settings.login_enabled ? (
              <div className="pt-1">
                <Link
                  to="/ctf/login"
                  className="inline-flex items-center gap-1 font-semibold text-xeoo-primary hover:underline text-[11px]"
                >
                  Masuk Menggunakan Akun Existing &rarr;
                </Link>
              </div>
            ) : settings.leaderboard_enabled ? (
              <div className="pt-1">
                <Link
                  to="/ctf/leaderboard"
                  className="inline-flex items-center gap-1 font-semibold text-xeoo-primary hover:underline text-[11px]"
                >
                  Buka Papan Peringkat / Leaderboard &rarr;
                </Link>
              </div>
            ) : null}
          </div>
        )}

        {errorLocal && (
          <div className="mb-3.5 rounded-lg bg-xeoo-danger/10 border border-xeoo-danger/30 p-2.5 text-xs text-xeoo-danger font-medium">
            {errorLocal}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-xeoo-text" htmlFor="reg-username">
              Username Handle
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xeoo-muted">
                <User className="h-4 w-4" />
              </span>
              <input
                id="reg-username"
                type="text"
                required
                maxLength={30}
                disabled={!settings.registration_enabled || submitting}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="analyst_01"
                className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft py-2 pl-9 pr-3 text-xs text-xeoo-text placeholder-xeoo-muted focus:border-xeoo-primary focus:outline-none focus:ring-1 focus:ring-xeoo-primary font-mono disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-xeoo-text" htmlFor="reg-email">
              Email
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xeoo-muted">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="reg-email"
                type="email"
                required
                disabled={!settings.registration_enabled || submitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@domain.com"
                className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft py-2 pl-9 pr-3 text-xs text-xeoo-text placeholder-xeoo-muted focus:border-xeoo-primary focus:outline-none focus:ring-1 focus:ring-xeoo-primary font-mono disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-xeoo-text" htmlFor="reg-password">
              Password (min. 8 karakter)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xeoo-muted">
                <KeyRound className="h-4 w-4" />
              </span>
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                disabled={!settings.registration_enabled || submitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft py-2 pl-9 pr-10 text-xs text-xeoo-text placeholder-xeoo-muted focus:border-xeoo-primary focus:outline-none focus:ring-1 focus:ring-xeoo-primary font-mono disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                disabled={!settings.registration_enabled}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xeoo-muted hover:text-xeoo-text cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-xeoo-text" htmlFor="reg-confirm-password">
              Konfirmasi Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xeoo-muted">
                <KeyRound className="h-4 w-4" />
              </span>
              <input
                id="reg-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={8}
                disabled={!settings.registration_enabled || submitting}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft py-2 pl-9 pr-10 text-xs text-xeoo-text placeholder-xeoo-muted focus:border-xeoo-primary focus:outline-none focus:ring-1 focus:ring-xeoo-primary font-mono disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                disabled={!settings.registration_enabled}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xeoo-muted hover:text-xeoo-text cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                title={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-xeoo-text" htmlFor="reg-country">
              Afiliasi Negara / Wilayah
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xeoo-muted">
                <Globe className="h-4 w-4" />
              </span>
              <select
                id="reg-country"
                disabled={!settings.registration_enabled || submitting}
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full appearance-none rounded-lg border border-xeoo-border bg-xeoo-surface-soft py-2 pl-9 pr-8 text-xs text-xeoo-text focus:border-xeoo-primary focus:outline-none focus:ring-1 focus:ring-xeoo-primary cursor-pointer font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {COUNTRIES_LIST.map((c: CountryInfo) => (
                  <option key={c.code} value={c.code} className="bg-xeoo-surface text-xeoo-text">
                    {c.flag} {c.name} {c.code !== "GLOBAL" ? `(${c.code})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!settings.registration_enabled || submitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-xeoo-primary py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-xeoo-primary-hover disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {!settings.registration_enabled ? (
              <>
                <Lock className="h-4 w-4" />
                <span>Registrasi Dinonaktifkan oleh Admin</span>
              </>
            ) : submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mendaftarkan...
              </>
            ) : (
              <>
                <span>Daftar Badge Baru</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 border-t border-xeoo-border pt-3 text-center">
          <p className="text-xs text-xeoo-muted">
            Sudah punya badge?{" "}
            <Link to="/ctf/login" className="font-semibold text-xeoo-primary hover:underline">
              Operator Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

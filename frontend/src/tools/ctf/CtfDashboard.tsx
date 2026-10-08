import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Terminal,
  Trophy,
  Flame,
  CheckCircle2,
  ArrowRight,
  Crosshair,
  Lock,
  Search,
  BookOpen,
  AlertTriangle,
  Radio,
} from "lucide-react";
import { useCtfAuth } from "./ctfAuth";
import { ctfApi } from "./ctfApi";
import type { ChallengeSummary } from "./ctfTypes";
import { COUNTRIES_MAP } from "./ctfConstants";

export const CtfDashboard: React.FC = () => {
  const { user, isAuthenticated, solvedCount, totalScore, totalChallenges, solvedChallengeIds, settings } = useCtfAuth();
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);

  useEffect(() => {
    let mounted = true;
    ctfApi
      .getChallenges()
      .then((res) => {
        if (mounted && res.success && res.data) {
          setChallenges(res.data.challenges || []);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const country = user ? COUNTRIES_MAP[user.country_code] : null;

  const easySolved = challenges.filter((c) => c.difficulty === "easy" && (c.solved || solvedChallengeIds.has(c.id))).length;
  const easyTotal = challenges.filter((c) => c.difficulty === "easy").length;

  const medSolved = challenges.filter((c) => c.difficulty === "medium" && (c.solved || solvedChallengeIds.has(c.id))).length;
  const medTotal = challenges.filter((c) => c.difficulty === "medium").length;

  const hardSolved = challenges.filter((c) => c.difficulty === "hard" && (c.solved || solvedChallengeIds.has(c.id))).length;
  const hardTotal = challenges.filter((c) => c.difficulty === "hard").length;

  const nextUnsolved = challenges.find((c) => !c.solved && !solvedChallengeIds.has(c.id));

  const progressPercent = totalChallenges > 0 ? Math.round((solvedCount / totalChallenges) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {!settings.submissions_enabled && (
        <div className="flex items-center gap-2.5 rounded-xl border border-xeoo-warning/40 bg-xeoo-warning/10 p-3 text-xs text-xeoo-text">
          <AlertTriangle className="h-4 w-4 text-xeoo-warning shrink-0" />
          <p>
            <span className="font-bold text-xeoo-warning">Notice:</span> Flag submissions are temporarily paused by CTF Command. You can explore and investigate cases, but flag verification is paused.
          </p>
        </div>
      )}

      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-xeoo-border bg-gradient-to-r from-xeoo-surface via-xeoo-surface to-xeoo-primary/5 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-xeoo-success animate-pulse" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-xeoo-muted">
                Forensics Mission Control
              </span>
              <span className="rounded bg-xeoo-primary/10 px-2 py-0.5 text-[10px] font-mono text-xeoo-primary">
                v2.0 Standalone Subsystem
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-xeoo-text">
              {isAuthenticated && user ? (
                <>
                  Welcome back, <span className="text-xeoo-primary">{user.username}</span> {country?.flag}
                </>
              ) : (
                <>Defacement Forensics CTF Platform</>
              )}
            </h1>
            <p className="max-w-2xl text-xs sm:text-sm text-xeoo-muted leading-relaxed">
              Analyze defaced websites, dissect malicious DOM injections, decode multi-stage forensic clues,
              and recover flags directly from within your browser workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {nextUnsolved ? (
              <Link
                to={`/ctf/challenge/${nextUnsolved.slug}`}
                className="flex items-center gap-2 rounded-xl bg-xeoo-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all"
              >
                <Crosshair className="h-4 w-4" />
                Next Active Case: {nextUnsolved.case_reference}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <Link
                to="/ctf/challenges"
                className="flex items-center gap-2 rounded-xl bg-xeoo-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all"
              >
                <Search className="h-4 w-4" />
                Browse Case Files
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}

            <Link
              to="/ctf/leaderboard"
              className="flex items-center gap-2 rounded-xl border border-xeoo-border bg-xeoo-surface px-4 py-2.5 text-xs font-bold text-xeoo-text hover:bg-xeoo-surface-soft transition-colors"
            >
              <Trophy className="h-4 w-4 text-xeoo-warning" />
              Leaderboard
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Score */}
        <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-xeoo-muted uppercase tracking-wider">Total Score</p>
            <p className="text-2xl font-bold font-mono text-xeoo-primary mt-1">{totalScore} PTS</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-xeoo-primary/10 text-xeoo-primary">
            <Flame className="h-5 w-5" />
          </div>
        </div>

        {/* Solved Cases */}
        <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-xeoo-muted uppercase tracking-wider">Cases Solved</p>
            <p className="text-2xl font-bold font-mono text-xeoo-text mt-1">
              {solvedCount} / {totalChallenges}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-xeoo-success/10 text-xeoo-success">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* Progress % */}
        <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-xeoo-muted uppercase tracking-wider">Progress</p>
            <span className="text-xs font-mono font-bold text-xeoo-text">{progressPercent}%</span>
          </div>
          <div className="mt-3 w-full bg-xeoo-surface-soft h-2 rounded-full overflow-hidden border border-xeoo-border">
            <div
              className="bg-xeoo-primary h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Active Registry */}
        <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-xeoo-muted uppercase tracking-wider">Status</p>
            <p className="text-xs font-mono font-bold text-xeoo-success mt-1 flex items-center gap-1.5">
              <Radio className="h-3 w-3" /> System Nominal
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-xeoo-surface-soft text-xeoo-text">
            <Terminal className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown & Rules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Difficulty Breakdown (1 col) */}
        <div className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-xeoo-muted flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-xeoo-primary" />
            Tiers Solved
          </h2>

          <div className="space-y-3">
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-xeoo-success">Tier 1: Easy</span>
                <span className="text-xs font-mono font-bold text-xeoo-text">
                  {easySolved} / {easyTotal || 5}
                </span>
              </div>
              <div className="h-1.5 w-full bg-xeoo-surface rounded-full overflow-hidden">
                <div
                  className="bg-xeoo-success h-full transition-all"
                  style={{ width: `${easyTotal ? (easySolved / easyTotal) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-xeoo-warning">Tier 2: Medium</span>
                <span className="text-xs font-mono font-bold text-xeoo-text">
                  {medSolved} / {medTotal || 5}
                </span>
              </div>
              <div className="h-1.5 w-full bg-xeoo-surface rounded-full overflow-hidden">
                <div
                  className="bg-xeoo-warning h-full transition-all"
                  style={{ width: `${medTotal ? (medSolved / medTotal) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-xeoo-danger">Tier 3: Hard</span>
                <span className="text-xs font-mono font-bold text-xeoo-text">
                  {hardSolved} / {hardTotal || 5}
                </span>
              </div>
              <div className="h-1.5 w-full bg-xeoo-surface rounded-full overflow-hidden">
                <div
                  className="bg-xeoo-danger h-full transition-all"
                  style={{ width: `${hardTotal ? (hardSolved / hardTotal) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/ctf/challenges"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface py-2 text-xs font-semibold text-xeoo-text hover:bg-xeoo-surface-soft transition-colors"
            >
              Open Full Case Registry
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Operating Rules & Conduct (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-xeoo-border bg-xeoo-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-xeoo-muted flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-xeoo-primary" />
              Forensic Rules of Engagement
            </h2>
            <span className="text-[11px] font-mono text-xeoo-muted">STRICT SECURITY ENFORCED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-xeoo-primary font-semibold">
                <Lock className="h-4 w-4" />
                Browser-First Investigation
              </div>
              <p className="text-xeoo-muted text-[11px] leading-relaxed">
                All 15 cases are self-contained. Use the built-in Sandbox, DOM inspector, Hex/Base64 decoders,
                and scratchpad. External software is not required.
              </p>
            </div>

            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-xeoo-warning font-semibold">
                <Search className="h-4 w-4" />
                Subtle & Realistic Clues
              </div>
              <p className="text-xeoo-muted text-[11px] leading-relaxed">
                Medium and Hard cases require multi-stage deduction, steganography inspection, DOM mutation
                observation, and cryptographic reconstruction. Flags are never obvious.
              </p>
            </div>

            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-xeoo-danger font-semibold">
                <AlertTriangle className="h-4 w-4" />
                Zero Backend Tampering
              </div>
              <p className="text-xeoo-muted text-[11px] leading-relaxed">
                Do not attack the CTF server, API endpoints, or database. Parameter tampering and SQL injection
                attempts trigger automatic security audit events, sarcastic responses, and IP/user bans.
              </p>
            </div>

            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-xeoo-text font-semibold">
                <Terminal className="h-4 w-4 text-xeoo-primary" />
                Authoritative Flag Format
              </div>
              <p className="text-xeoo-muted text-[11px] leading-relaxed">
                All valid flags strictly follow the pattern <code className="bg-xeoo-surface px-1 py-0.5 rounded text-xeoo-primary font-mono">XEOO&#123;...&#125;</code>.
                Submit precisely with intact braces.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-xeoo-primary" />
              <span className="text-xs font-semibold text-xeoo-text">Ready to begin analyzing?</span>
            </div>
            <Link
              to="/ctf/challenges"
              className="rounded-lg bg-xeoo-primary px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Start Investigation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};


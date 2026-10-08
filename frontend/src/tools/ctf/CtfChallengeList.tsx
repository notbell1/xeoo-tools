import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  Lock,
  Layers,
  Filter,
  AlertTriangle,
} from "lucide-react";
import { ctfApi } from "./ctfApi";
import { useCtfAuth } from "./ctfAuth";
import type { ChallengeSummary, ChallengeDifficulty } from "./ctfTypes";

export const CtfChallengeList: React.FC = () => {
  const { solvedChallengeIds, settings } = useCtfAuth();
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    let mounted = true;
    ctfApi
      .getChallenges()
      .then((res) => {
        if (mounted && res.success && res.data) {
          setChallenges(res.data.challenges || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      const isSolved = c.solved || solvedChallengeIds.has(c.id);

      if (difficultyFilter !== "all" && c.difficulty !== difficultyFilter) {
        return false;
      }
      if (statusFilter === "solved" && !isSolved) {
        return false;
      }
      if (statusFilter === "unsolved" && isSolved) {
        return false;
      }
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(query);
        const matchesRef = c.case_reference.toLowerCase().includes(query);
        const matchesCat = c.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesRef && !matchesCat) return false;
      }
      return true;
    });
  }, [challenges, solvedChallengeIds, difficultyFilter, statusFilter, search]);

  const difficultyBadge = (diff: ChallengeDifficulty) => {
    switch (diff) {
      case "easy":
        return (
          <span className="rounded-md border border-xeoo-success/30 bg-xeoo-success/10 px-2 py-0.5 text-[10px] font-mono font-bold text-xeoo-success uppercase">
            Easy
          </span>
        );
      case "medium":
        return (
          <span className="rounded-md border border-xeoo-warning/30 bg-xeoo-warning/10 px-2 py-0.5 text-[10px] font-mono font-bold text-xeoo-warning uppercase">
            Medium
          </span>
        );
      case "hard":
        return (
          <span className="rounded-md border border-xeoo-danger/30 bg-xeoo-danger/10 px-2 py-0.5 text-[10px] font-mono font-bold text-xeoo-danger uppercase">
            Hard
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-xeoo-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-xeoo-primary" />
            <h1 className="text-xl font-bold tracking-tight text-xeoo-text">Active Case Files</h1>
          </div>
          <p className="text-xs text-xeoo-muted">
            15 authentic web defacement & forensic investigation cases.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xeoo-muted">
            <Search className="h-3.5 w-3.5" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, case ref, category..."
            className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface py-1.5 pl-8 pr-3 text-xs text-xeoo-text placeholder-xeoo-muted focus:border-xeoo-primary focus:outline-none focus:ring-1 focus:ring-xeoo-primary"
          />
        </div>
      </div>

      {!settings.submissions_enabled && (
        <div className="flex items-center gap-2.5 rounded-xl border border-xeoo-warning/40 bg-xeoo-warning/10 p-3 text-xs text-xeoo-text">
          <AlertTriangle className="h-4 w-4 text-xeoo-warning shrink-0" />
          <p>
            <span className="font-bold text-xeoo-warning">Notice:</span> Pengiriman flag sedang dinonaktifkan sementara oleh administrator CTF. Anda tetap dapat meneliti berkas kasus, tetapi verifikasi flag tidak dapat dikirim saat ini.
          </p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-xeoo-border bg-xeoo-surface">
          <span className="text-[11px] font-mono font-semibold text-xeoo-muted px-2 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Tier:
          </span>
          {["all", "easy", "medium", "hard"].map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => setDifficultyFilter(diff)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all cursor-pointer ${
                difficultyFilter === diff
                  ? "bg-xeoo-primary text-white shadow-sm"
                  : "text-xeoo-muted hover:text-xeoo-text hover:bg-xeoo-surface-soft"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-xeoo-border bg-xeoo-surface">
          <span className="text-[11px] font-mono font-semibold text-xeoo-muted px-2">Status:</span>
          {[
            { id: "all", label: "All" },
            { id: "unsolved", label: "Unsolved" },
            { id: "solved", label: "Solved" },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusFilter(st.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st.id
                  ? "bg-xeoo-surface-soft text-xeoo-text border border-xeoo-border shadow-xs font-bold"
                  : "text-xeoo-muted hover:text-xeoo-text"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-xeoo-muted">
          <Loader2 className="h-7 w-7 animate-spin text-xeoo-primary" />
          <p className="text-xs font-mono">Loading case dossier registry...</p>
        </div>
      ) : filteredChallenges.length === 0 ? (
        <div className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-xeoo-surface-soft text-xeoo-muted">
            <Layers className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-xeoo-text">No cases match your filter criteria.</p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setDifficultyFilter("all");
              setStatusFilter("all");
            }}
            className="text-xs font-semibold text-xeoo-primary hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChallenges.map((challenge) => {
            const isSolved = challenge.solved || solvedChallengeIds.has(challenge.id);

            return (
              <Link
                key={challenge.id}
                to={`/ctf/challenge/${challenge.slug}`}
                className={`group relative flex flex-col justify-between rounded-xl border p-5 transition-all hover:shadow-md ${
                  isSolved
                    ? "border-xeoo-success/30 bg-xeoo-surface hover:border-xeoo-success/60"
                    : "border-xeoo-border bg-xeoo-surface hover:border-xeoo-primary/50"
                }`}
              >
                {/* Header row */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="font-mono text-[11px] font-bold text-xeoo-muted">
                      {challenge.case_reference}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {difficultyBadge(challenge.difficulty)}
                      {isSolved ? (
                        <span className="flex items-center gap-1 rounded-md border border-xeoo-success/30 bg-xeoo-success/15 px-2 py-0.5 text-[10px] font-mono font-bold text-xeoo-success">
                          <CheckCircle2 className="h-3 w-3" />
                          SOLVED
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface-soft px-1.5 py-0.5 text-[10px] font-mono text-xeoo-muted">
                          <Lock className="h-3 w-3" />
                          OPEN
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-xeoo-text group-hover:text-xeoo-primary transition-colors line-clamp-1">
                    {challenge.title}
                  </h3>
                  <p className="mt-1 text-[11px] font-mono text-xeoo-muted uppercase tracking-wider">
                    {challenge.category.replace(/_/g, " ")}
                  </p>
                </div>

                {/* Footer metadata */}
                <div className="mt-5 border-t border-xeoo-border pt-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 font-mono text-[11px] text-xeoo-muted">
                    <span className="font-bold text-xeoo-primary">{challenge.points} PTS</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ~{challenge.estimated_minutes}m
                    </span>
                    <span>•</span>
                    <span>{challenge.solves_count} solves</span>
                  </div>

                  <span className="flex items-center text-xeoo-primary font-bold text-xs group-hover:translate-x-0.5 transition-transform">
                    Inspect <ArrowRight className="h-3 w-3 ml-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};


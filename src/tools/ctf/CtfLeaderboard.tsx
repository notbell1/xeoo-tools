import React, { useEffect, useState } from "react";
import {
  Trophy,
  Medal,
  Crown,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ctfApi } from "./ctfApi";
import { useCtfAuth } from "./ctfAuth";
import type { LeaderboardEntry } from "./ctfTypes";
import { COUNTRIES_MAP } from "./ctfConstants";

export const CtfLeaderboard: React.FC = () => {
  const { user, settings } = useCtfAuth();
  const [top3, setTop3] = useState<LeaderboardEntry[]>([]);
  const [top10, setTop10] = useState<LeaderboardEntry[]>([]);
  const [fullList, setFullList] = useState<LeaderboardEntry[]>([]);
  const [totalChallenges, setTotalChallenges] = useState<number>(15);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFull, setShowFull] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    ctfApi
      .getLeaderboard()
      .then((res) => {
        if (mounted && res.success && res.data) {
          setTop3(res.data.top3 || []);
          setTop10(res.data.top10 || []);
          setFullList(res.data.rankings || []);
          setTotalChallenges(res.data.total_challenges || 15);
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

  // Country display helper
  const renderCountry = (code: string) => {
    const clean = code?.trim().toLowerCase() ?? "";
    const isIso2 = /^[a-z]{2}$/.test(clean) && clean !== "gl" && clean !== "xx";
    const flagUrl = isIso2 ? `https://flagcdn.com/w40/${clean}.png` : null;
    const info = COUNTRIES_MAP[code?.toUpperCase()] || {
      name: code || "Global",
      flag: "🌐",
    };

    return (
      <span
        title={info.name}
        className="inline-flex items-center gap-1.5 font-mono text-xs"
      >
        {flagUrl ? (
          <img
            src={flagUrl}
            alt={info.name}
            title={info.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-3.5 w-5 shrink-0 rounded-[2px] border border-black/10 object-cover"
          />
        ) : (
          <span className="text-sm leading-none">🌐</span>
        )}
        <span className="text-xeoo-text truncate max-w-[100px]">
          {info.name}
        </span>
      </span>
    );
  };

  const displayedList = showFull ? fullList : top10;

  return (
    <div className="mx-auto max-w-6xl px-3 py-5 sm:px-6 lg:px-8 space-y-6">
      {!settings.leaderboard_enabled && (
        <div className="flex items-center gap-2.5 rounded-xl border border-xeoo-warning/40 bg-xeoo-warning/10 p-3 text-xs text-xeoo-text">
          <AlertCircle className="h-5 w-5 text-xeoo-warning shrink-0" />
          <div>
            <p className="font-bold text-xeoo-warning">
              Leaderboard disabled by admin
            </p>
            <p className="text-[11px] text-xeoo-muted mt-0.5 leading-relaxed">
              The global leaderboard has been temporarily frozen by the CTF
              Command administrators. The data currently displayed represents
              the final archived state.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center max-w-lg mx-auto space-y-1.5">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-xeoo-warning/10 border border-xeoo-warning/25 px-2.5 py-0.5 text-xs font-semibold text-xeoo-warning">
          <Trophy className="h-3.5 w-3.5" />
          Global Forensic Standings
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-xeoo-text tracking-tight">
          Leaderboard
        </h1>
        <p className="text-xs text-xeoo-muted">
          CTF operator ranking based on score and case resolution speed.
        </p>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2.5 text-xeoo-muted">
          <Loader2 className="h-6 w-6 animate-spin text-xeoo-primary" />
          <p className="text-xs font-mono">Loading global rankings...</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {/* 2nd Place (Silver) */}
              {top3[1] && (
                <div className="order-2 md:order-1 rounded-xl border border-xeoo-border bg-xeoo-surface p-4 text-center flex flex-col items-center justify-between shadow-xs relative">
                  <div className="absolute top-2.5 left-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-400/20 text-slate-400 font-mono font-bold text-xs">
                    #2
                  </div>
                  <div className="mt-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-400/10 text-slate-400">
                    <Medal className="h-5 w-5" />
                  </div>
                  <div className="mt-2 space-y-1 w-full">
                    <h3 className="font-bold text-sm text-xeoo-text truncate">
                      {top3[1].username}
                    </h3>
                    <div className="flex justify-center">
                      {renderCountry(top3[1].country_code)}
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-xeoo-border w-full flex justify-around text-xs font-mono">
                    <div>
                      <p className="text-[10px] text-xeoo-muted uppercase">
                        Score
                      </p>
                      <p className="font-bold text-xeoo-primary">
                        {top3[1].score}p
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-xeoo-muted uppercase">
                        Solved
                      </p>
                      <p className="font-bold text-xeoo-text">
                        {top3[1].solved}/{totalChallenges}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 1st Place (Gold / Champion) */}
              {top3[0] && (
                <div className="order-1 md:order-2 rounded-xl border-2 border-xeoo-warning/60 bg-gradient-to-b from-xeoo-warning/10 via-xeoo-surface to-xeoo-surface p-4 text-center flex flex-col items-center justify-between shadow-xs relative md:-translate-y-1">
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-xeoo-warning px-2.5 py-0.5 text-[10px] font-bold text-black uppercase tracking-wider shadow-xs">
                    <Crown className="h-3 w-3" /> Champion
                  </div>
                  <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-xl bg-xeoo-warning/20 text-xeoo-warning">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div className="mt-2 space-y-1 w-full">
                    <h3 className="font-bold text-sm text-xeoo-text truncate">
                      {top3[0].username}
                    </h3>
                    <div className="flex justify-center">
                      {renderCountry(top3[0].country_code)}
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-xeoo-border w-full flex justify-around text-xs font-mono">
                    <div>
                      <p className="text-[10px] text-xeoo-muted uppercase">
                        Score
                      </p>
                      <p className="font-bold text-xeoo-primary text-sm">
                        {top3[0].score}p
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-xeoo-muted uppercase">
                        Solved
                      </p>
                      <p className="font-bold text-xeoo-text text-sm">
                        {top3[0].solved}/{totalChallenges}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd Place (Bronze) */}
              {top3[2] && (
                <div className="order-3 rounded-xl border border-xeoo-border bg-xeoo-surface p-4 text-center flex flex-col items-center justify-between shadow-xs relative">
                  <div className="absolute top-2.5 left-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-700/20 text-amber-700 font-mono font-bold text-xs">
                    #3
                  </div>
                  <div className="mt-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-700/10 text-amber-700">
                    <Medal className="h-5 w-5" />
                  </div>
                  <div className="mt-2 space-y-1 w-full">
                    <h3 className="font-bold text-sm text-xeoo-text truncate">
                      {top3[2].username}
                    </h3>
                    <div className="flex justify-center">
                      {renderCountry(top3[2].country_code)}
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-xeoo-border w-full flex justify-around text-xs font-mono">
                    <div>
                      <p className="text-[10px] text-xeoo-muted uppercase">
                        Score
                      </p>
                      <p className="font-bold text-xeoo-primary">
                        {top3[2].score}p
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-xeoo-muted uppercase">
                        Solved
                      </p>
                      <p className="font-bold text-xeoo-text">
                        {top3[2].solved}/{totalChallenges}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Table of Rankings - Zebra styling with clear column divider borders */}
          <div className="rounded-xl border border-xeoo-border bg-xeoo-surface overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead className="border-b border-xeoo-border bg-xeoo-surface-soft font-mono uppercase text-xeoo-text font-bold">
                  <tr>
                    <th className="py-2.5 px-3 w-16 text-center border-r border-xeoo-border">
                      Rank
                    </th>
                    <th className="py-2.5 px-3.5 border-r border-xeoo-border">
                      Name
                    </th>
                    <th className="py-2.5 px-3.5 border-r border-xeoo-border">
                      Country
                    </th>
                    <th className="py-2.5 px-3.5 text-center border-r border-xeoo-border">
                      Cases Solved
                    </th>
                    <th className="py-2.5 px-3.5 text-right font-mono">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-xeoo-muted font-mono"
                      >
                        There is no data yet on challenge completion.
                      </td>
                    </tr>
                  ) : (
                    displayedList.map((entry, idx) => {
                      const isMe = user && user.id === entry.user_id;
                      const zebraClass =
                        idx % 2 === 0
                          ? "bg-xeoo-surface"
                          : "bg-xeoo-surface-soft/60";

                      return (
                        <tr
                          key={entry.user_id}
                          className={`border-b border-xeoo-border last:border-b-0 transition-colors ${
                            isMe
                              ? "bg-xeoo-primary/10 font-medium"
                              : `${zebraClass} hover:bg-xeoo-surface-soft`
                          }`}
                        >
                          {/* Rank */}
                          <td className="py-2.5 px-3 text-center font-mono font-bold border-r border-xeoo-border">
                            {entry.rank === 1 ? (
                              <span className="text-xeoo-warning">🥇 1</span>
                            ) : entry.rank === 2 ? (
                              <span className="text-slate-400">🥈 2</span>
                            ) : entry.rank === 3 ? (
                              <span className="text-amber-700">🥉 3</span>
                            ) : (
                              <span className="text-xeoo-muted">
                                #{entry.rank}
                              </span>
                            )}
                          </td>

                          {/* Operator */}
                          <td className="py-2.5 px-3.5 border-r border-xeoo-border">
                            <span className="font-semibold text-xeoo-text flex items-center gap-1.5 truncate">
                              {entry.username}
                              {isMe && (
                                <span className="rounded bg-xeoo-primary px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                                  You
                                </span>
                              )}
                            </span>
                          </td>

                          {/* Country */}
                          <td className="py-2.5 px-3.5 border-r border-xeoo-border">
                            {renderCountry(entry.country_code)}
                          </td>

                          {/* Solved */}
                          <td className="py-2.5 px-3.5 text-center font-mono border-r border-xeoo-border">
                            <span className="inline-block rounded bg-xeoo-surface-soft border border-xeoo-border px-2 py-0.5 text-xs text-xeoo-text">
                              {entry.solved} / {totalChallenges}
                            </span>
                          </td>

                          {/* Score */}
                          <td className="py-2.5 px-3.5 text-right font-mono font-bold text-xeoo-primary text-xs sm:text-sm">
                            {entry.score} PTS
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Expand / See More Button */}
            {fullList.length > 10 && (
              <div className="border-t border-xeoo-border p-2.5 text-center bg-xeoo-surface-soft">
                <button
                  type="button"
                  onClick={() => setShowFull(!showFull)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-xeoo-primary hover:underline cursor-pointer"
                >
                  {showFull ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Show Top 10 Only
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Show All Operators ({fullList.length})
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

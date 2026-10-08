import { ArrowUpRight, CalendarClock, CheckCircle2, Wrench } from "lucide-react";

import type { LucideIcon } from "lucide-react";
import type { Tool } from "../types";

import { getToolIcon } from "../lib/toolIcons";

import ToolStatus from "./ToolStatus";

interface ToolCardTool extends Omit<Tool, "icon"> {
  icon: LucideIcon | string;
}

interface ToolCardProps {
  tool: ToolCardTool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const isReady = tool.status === "ready";
  const isUpcoming = tool.status === "upcoming";

  const Icon =
    typeof tool.icon === "string"
      ? getToolIcon(tool.icon)
      : (tool.icon ?? Wrench);

  return (
    <article
      className={[
        "group relative overflow-hidden rounded-3xl border",
        "bg-xeoo-surface p-5",
        "transition-all duration-300",
        isReady
          ? [
              "border-xeoo-border",
              "shadow-sm",
              "hover:-translate-y-0.5",
              "hover:border-xeoo-primary/30",
              "hover:shadow-xl hover:shadow-black/5",
            ].join(" ")
          : isUpcoming
            ? [
                "border-sky-300/80",
                "bg-linear-to-br from-white via-sky-50/40 to-blue-50/70 dark:from-slate-900 dark:via-sky-950/30 dark:to-slate-900",
                "shadow-[0_12px_35px_rgba(14,165,233,0.08)]",
              ].join(" ")
            : [
                "border-amber-300/80",
                "bg-linear-to-br from-white via-amber-50/40 to-orange-50/70 dark:from-slate-900 dark:via-amber-950/30 dark:to-slate-900",
                "shadow-[0_12px_35px_rgba(245,158,11,0.08)]",
              ].join(" "),
      ].join(" ")}
    >
      {!isReady && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 opacity-90"
          style={{
            backgroundImage: isUpcoming
              ? "repeating-linear-gradient(135deg, #0EA5E9 0, #0EA5E9 10px, #BAE6FD 10px, #BAE6FD 20px)"
              : "repeating-linear-gradient(135deg, #F59E0B 0, #F59E0B 10px, #FEF3C7 10px, #FEF3C7 20px)",
          }}
        />
      )}

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div
            className={[
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
              isReady
                ? "border-xeoo-primary/20 bg-xeoo-primary-soft text-xeoo-primary"
                : isUpcoming
                  ? "border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300"
                  : "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
            ].join(" ")}
          >
            <Icon size={20} strokeWidth={1.8} />
          </div>

          {isReady ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 size={11} strokeWidth={2.2} />
              Ready
            </span>
          ) : isUpcoming ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300">
              <CalendarClock size={11} strokeWidth={2.2} />
              Upcoming
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <Wrench size={10} />
              Maintenance
            </span>
          )}
        </div>

        <div className="mt-5">
          <h3
            className={[
              "text-base font-semibold",
              isReady
                ? "text-xeoo-text"
                : isUpcoming
                  ? "text-sky-950 dark:text-sky-100"
                  : "text-amber-950 dark:text-amber-100",
            ].join(" ")}
          >
            {tool.name}
          </h3>

          <p
            className={[
              "mt-2 min-h-10.5 text-sm leading-6",
              isReady
                ? "text-xeoo-muted"
                : isUpcoming
                  ? "text-sky-900/70 dark:text-sky-300/70"
                  : "text-amber-900/70 dark:text-amber-300/70",
            ].join(" ")}
          >
            {tool.description}
          </p>
        </div>

        <div className="mt-5">
          <ToolStatus status={tool.status} name={tool.name} />
        </div>

        <button
          type="button"
          disabled={!isReady}
          className={[
            "mt-5 flex w-full items-center justify-between",
            "rounded-2xl border px-4 py-3",
            "text-sm font-semibold",
            "transition-all duration-200",
            isReady
              ? [
                  "border-xeoo-text",
                  "bg-xeoo-text text-white",
                  "hover:bg-xeoo-black",
                  "hover:shadow-lg hover:shadow-black/10",
                ].join(" ")
              : isUpcoming
                ? [
                    "cursor-not-allowed",
                    "border-sky-300/80",
                    "bg-sky-100/70 text-sky-800 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300",
                  ].join(" ")
                : [
                    "cursor-not-allowed",
                    "border-amber-300/80",
                    "bg-amber-100/70 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
                  ].join(" "),
          ].join(" ")}
        >
          <span className="flex items-center gap-2">
            {isReady ? (
              <>
                <CheckCircle2 size={14} strokeWidth={2.2} />
                Open Tool
              </>
            ) : isUpcoming ? (
              <>
                <CalendarClock size={14} />
                Segera Hadir
              </>
            ) : (
              <>
                <Wrench size={14} />
                Sedang Diperbaiki
              </>
            )}
          </span>

          {isReady && <ArrowUpRight size={17} strokeWidth={2} />}
        </button>
      </div>
    </article>
  );
}

import {
  CalendarClock,
  CheckCircle2,
  Construction,
  HardHat,
  Wrench,
} from "lucide-react";

import type { ToolStatus as ToolStatusValue } from "../types/admin";

interface ToolStatusProps {
  status: ToolStatusValue;
  name?: string;
  variant?: "default" | "list" | "ribbon";
  className?: string;
}

const maintenanceMessages = [
  "Sedang dibongkar. Jangan dipaksa.",
  "Lagi diperbaiki. Sabar dulu.",
  "Kabelnya belum diajak kompromi.",
  "Tool-nya sedang mencari jati diri.",
  "Sedang dikerjakan. Jangan spam klik.",
];

const upcomingMessages = [
  "Belum rilis. Jangan di-klik dulu.",
  "Masih dipanaskan. Tunggu tanggal mainnya.",
  "Sedang disiapkan. Jangan buru-buru.",
  "Tool ini belum turun ke lapangan.",
  "Masih antre untuk dilahirkan.",
];

function getMaintenanceMessage(name = "xeoo") {
  const seed = name
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  return maintenanceMessages[seed % maintenanceMessages.length];
}

function getUpcomingMessage(name = "xeoo") {
  const seed = name
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  return upcomingMessages[seed % upcomingMessages.length];
}

function MaintenanceMascot({
  compact = false,
  faded = false,
}: {
  compact?: boolean;
  faded?: boolean;
}) {
  return (
    <div
      className={[
        "pointer-events-none absolute z-0",
        compact ? "-bottom-2 -right-1 w-14" : "-bottom-5 -right-2 w-28",
        faded ? "opacity-35" : "opacity-95",
      ].join(" ")}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto w-full"
      >
        <ellipse
          cx="72"
          cy="108"
          rx="36"
          ry="6"
          fill="#92400E"
          opacity="0.12"
        />

        <rect
          x="64"
          y="76"
          width="34"
          height="25"
          rx="5"
          fill="#D97706"
          stroke="#92400E"
          strokeWidth="2"
        />

        <rect
          x="71"
          y="71"
          width="20"
          height="8"
          rx="3"
          fill="#F59E0B"
          stroke="#92400E"
          strokeWidth="2"
        />

        <path
          d="M76 88H86"
          stroke="#FEF3C7"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <circle cx="91" cy="93" r="2" fill="#FEF3C7" />

        <path
          d="M30 75C30 62.85 39.85 53 52 53H61C73.15 53 83 62.85 83 75V92H30V75Z"
          fill="#F5E7D0"
          stroke="#7C5C43"
          strokeWidth="2"
        />

        <path
          d="M30 72C18 68 15 78 20 85C23 89 29 87 32 82"
          stroke="#7C5C43"
          strokeWidth="5"
          strokeLinecap="round"
        />

        <path
          d="M34 42L37 25L47 34C51 32 57 32 61 34L71 25L74 42V53C74 65 65 72 54 72C43 72 34 65 34 53V42Z"
          fill="#F8E9D4"
          stroke="#7C5C43"
          strokeWidth="2"
        />

        <path
          d="M38 31L39 20L48 29"
          fill="#F8E9D4"
          stroke="#7C5C43"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        <path
          d="M61 29L70 20L71 31"
          fill="#F8E9D4"
          stroke="#7C5C43"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        <path
          d="M31 39C31 27 40 19 53 19C66 19 75 27 75 39H31Z"
          fill="#F59E0B"
          stroke="#92400E"
          strokeWidth="2"
        />

        <path
          d="M28 39H78"
          stroke="#92400E"
          strokeWidth="5"
          strokeLinecap="round"
        />

        <path d="M52 19V39" stroke="#FEF3C7" strokeWidth="2" opacity="0.8" />

        <circle cx="46" cy="49" r="2" fill="#292524" />

        <circle cx="62" cy="49" r="2" fill="#292524" />

        <path
          d="M52 57C54 59 57 59 59 57"
          stroke="#7C5C43"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <path
          d="M38 55L28 53"
          stroke="#A78B72"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <path
          d="M38 59L27 61"
          stroke="#A78B72"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <path
          d="M69 55L79 53"
          stroke="#A78B72"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <path
          d="M69 59L80 61"
          stroke="#A78B72"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <path
          d="M65 71C74 70 78 76 77 82"
          stroke="#7C5C43"
          strokeWidth="5"
          strokeLinecap="round"
        />

        <path
          d="M79 76C76 72 76 68 79 65C81 63 84 63 86 64L82 68L86 72L90 68C91 71 90 74 88 76C86 78 82 78 79 76Z"
          fill="#94A3B8"
          stroke="#475569"
          strokeWidth="1.5"
        />

        <path
          d="M84 74L94 84"
          stroke="#475569"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <path
          d="M101 55V62"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <path
          d="M97.5 58.5H104.5"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <path
          d="M95 48L97 50"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <path
          d="M101 48L99 50"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default function ToolStatus({
  status,
  name = "xeooTool",
  variant = "default",
  className = "",
}: ToolStatusProps) {
  const isReady = status === "ready";
  const isMaintenance = status === "maintenance";
  const isUpcoming = status === "upcoming";

  if (variant === "ribbon") {
    return (
      <div
        className={[
          "pointer-events-none absolute right-0 top-0 z-30 h-16 w-16 overflow-hidden",
          className,
        ].join(" ")}
        aria-label={
          isReady ? "Ready" : isMaintenance ? "Maintenance" : "Upcoming"
        }
      >
        <div
          className={[
            "absolute -right-6.25 top-2.75 flex h-6 w-24 rotate-45 items-center justify-center overflow-hidden shadow-sm",
            isReady
              ? "bg-emerald-600"
              : isMaintenance
                ? "bg-amber-500"
                : "bg-sky-600",
          ].join(" ")}
        >
          {isMaintenance && <MaintenanceMascot compact faded />}

          <span className="relative z-20 inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wide text-white">
            {isReady ? (
              <CheckCircle2 size={9} strokeWidth={2.5} />
            ) : isMaintenance ? (
              <Construction size={9} />
            ) : (
              <CalendarClock size={9} strokeWidth={2.2} />
            )}

            {isReady ? "Ready" : isMaintenance ? "Maintenance" : "Upcoming"}
          </span>
        </div>
      </div>
    );
  }

  if (variant === "list") {
    if (isReady) {
      return (
        <span
          className={[
            "inline-flex items-center gap-1.5 rounded-full",
            "border border-emerald-200 bg-emerald-50",
            "px-2.5 py-1",
            "text-[9px] font-black uppercase tracking-wide",
            "text-emerald-700",
            className,
          ].join(" ")}
        >
          <CheckCircle2 size={11} strokeWidth={2.3} />
          Ready
        </span>
      );
    }

    if (isMaintenance) {
      return (
        <span
          className={[
            "relative inline-flex min-w-32 items-center overflow-hidden",
            "rounded-xl border border-amber-300",
            "bg-linear-to-r from-amber-50 to-orange-50",
            "px-2.5 py-2 pr-12",
            className,
          ].join(" ")}
        >
          <span className="relative z-20 flex min-w-0 items-center gap-1.5">
            <Construction size={11} className="shrink-0 text-amber-800" />

            <span className="text-[8px] font-black uppercase tracking-wide text-amber-900">
              Maintenance
            </span>
          </span>

          <MaintenanceMascot compact />

          <span className="absolute bottom-0 left-0 right-0 h-px bg-amber-300/70" />
        </span>
      );
    }

    return (
      <span
        className={[
          "inline-flex items-center gap-1.5 rounded-full",
          "border border-sky-200 bg-sky-50",
          "px-2.5 py-1",
          "text-[9px] font-black uppercase tracking-wide",
          "text-sky-700",
          className,
        ].join(" ")}
      >
        <CalendarClock size={11} strokeWidth={2.2} />
        Upcoming
      </span>
    );
  }

  if (isReady) {
    return (
      <div
        className={[
          "relative overflow-hidden rounded-2xl",
          "border border-emerald-200",
          "bg-linear-to-r from-emerald-50 via-emerald-50/80 to-white",
          "px-3.5 py-3",
          className,
        ].join(" ")}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={15} strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
                Ready to use
              </span>

              <span className="h-1 w-1 rounded-full bg-emerald-400" />

              <span className="text-[8px] font-bold uppercase tracking-wide text-emerald-700/70">
                Online
              </span>
            </div>

            <p className="mt-0.5 text-[9px] leading-4 text-emerald-700/75">
              Tool siap digunakan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isUpcoming) {
    return (
      <div
        className={[
          "relative overflow-hidden rounded-2xl",
          "border border-sky-200",
          "bg-linear-to-r from-sky-50 via-cyan-50/80 to-white",
          "px-3.5 py-3",
          className,
        ].join(" ")}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent 0, transparent 12px, #0EA5E9 12px, #0EA5E9 24px)",
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-sky-100 text-sky-700">
            <CalendarClock size={15} strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-800">
                Coming Soon
              </span>

              <span className="h-1 w-1 rounded-full bg-sky-400" />

              <span className="text-[8px] font-bold uppercase tracking-wide text-sky-700/70">
                Upcoming
              </span>
            </div>

            <p className="mt-0.5 text-[9px] leading-4 text-sky-700/75">
              {getUpcomingMessage(name)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-2xl",
        "border border-amber-300",
        "bg-linear-to-br from-amber-50 via-orange-50/80 to-white",
        "px-3.5 py-3",
        className,
      ].join(" ")}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, transparent 0, transparent 12px, #F59E0B 12px, #F59E0B 24px)",
        }}
      />

      <MaintenanceMascot />

      <div className="relative z-20 pr-20">
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-300 bg-amber-100 text-amber-800">
            <HardHat size={15} strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-amber-950">
              <Construction size={9} />
              Under Construction
            </span>

            <p className="mt-1.5 text-[10px] font-black uppercase tracking-wide text-amber-950">
              Maintenance Mode
            </p>

            <p className="mt-1 text-[9px] leading-4 text-amber-900/75">
              {getMaintenanceMessage(name)}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-20 mt-3 flex items-center gap-2 border-t border-amber-200/80 pt-2.5 pr-20">
        <Wrench size={10} className="shrink-0 text-amber-700" />

        <span className="text-[8px] font-bold uppercase tracking-wide text-amber-700">
          Work in progress
        </span>
      </div>
    </div>
  );
}

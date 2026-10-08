import { Terminal, ExternalLink, Flag } from "lucide-react";

export default function CtfLauncher() {
  const handleLaunch = () => {
    window.open("/ctf", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 sm:p-6 text-center text-xeoo-text">
      <div className="w-full max-w-md rounded-xl border border-xeoo-border bg-xeoo-surface p-6 shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-xeoo-surface-soft border border-xeoo-border text-xeoo-primary">
          <Terminal className="h-6 w-6" />
        </div>

        <h1 className="mt-4 text-lg font-bold tracking-tight text-xeoo-text sm:text-xl">
          Xeoo Tools — CTF Platform
        </h1>

        <p className="mt-2 text-xs text-xeoo-muted leading-relaxed">
          Standalone browser-first cybersecurity & defacement forensics arena.
          Complete the investigation, discover artifacts, and prove your digital
          forensic analysis skills.
        </p>

        <div className="mt-4 rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-3 text-left space-y-1.5 text-xs text-xeoo-muted">
          <div className="flex items-center gap-2 text-xeoo-text font-semibold">
            <Flag className="h-3.5 w-3.5 text-xeoo-primary" />
            <span>Platform Features:</span>
          </div>
          <p>• 15 Investigation Cases (Easy, Medium, Hard)</p>
          <p>• Live Sandboxed Preview & DOM Inspector</p>
          <p>• Forensic Workbench (Decoders, Ciphers, Notes)</p>
          <p>• Global Leaderboard Hall of Fame</p>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleLaunch}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-xeoo-primary hover:bg-xeoo-primary-hover px-4 py-2.5 text-xs font-bold text-white transition shadow-xs cursor-pointer"
          >
            <span>Launch CTF Platform</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { Wrench, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const CtfMaintenance: React.FC<{ message?: string }> = ({
  message = "XeooTools Defacement CTF is currently undergoing scheduled forensic platform maintenance.",
}) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center border border-xeoo-border bg-xeoo-surface rounded-2xl p-8 shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-xeoo-warning/10 text-xeoo-warning mb-6">
          <Wrench className="h-8 w-8" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-xeoo-warning" />
          <span className="text-xs font-mono uppercase tracking-wider text-xeoo-warning font-semibold">
            System Offline
          </span>
        </div>
        <h1 className="text-2xl font-bold text-xeoo-text mb-3">Under Maintenance</h1>
        <p className="text-sm text-xeoo-muted mb-6 leading-relaxed">{message}</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-lg bg-xeoo-surface-soft border border-xeoo-border px-4 py-2 text-xs font-semibold text-xeoo-text hover:bg-xeoo-border transition-colors"
        >
          Return to XeooTools Hub
        </Link>
      </div>
    </div>
  );
};


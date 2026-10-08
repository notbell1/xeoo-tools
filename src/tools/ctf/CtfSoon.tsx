import React from "react";
import { Clock, Info } from "lucide-react";
import { Link } from "react-router-dom";

export const CtfSoon: React.FC<{ message?: string }> = ({
  message = "XeooTools Defacement CTF investigation cases are launching soon.",
}) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center border border-xeoo-border bg-xeoo-surface rounded-2xl p-8 shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-xeoo-info/10 text-xeoo-info mb-6">
          <Clock className="h-8 w-8" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Info className="h-4 w-4 text-xeoo-info" />
          <span className="text-xs font-mono uppercase tracking-wider text-xeoo-info font-semibold">
            Deploying Archives
          </span>
        </div>
        <h1 className="text-2xl font-bold text-xeoo-text mb-3">Launching Soon</h1>
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


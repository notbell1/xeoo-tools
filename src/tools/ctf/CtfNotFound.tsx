import React from "react";
import { SearchX } from "lucide-react";
import { Link } from "react-router-dom";

export const CtfNotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center border border-xeoo-border bg-xeoo-surface rounded-2xl p-8 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-xeoo-danger/10 text-xeoo-danger mb-4">
          <SearchX className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-xeoo-text mb-2">Evidence File Not Found</h1>
        <p className="text-sm text-xeoo-muted mb-6">
          The requested challenge or dossier does not exist in the active CTF registry.
        </p>
        <Link
          to="/ctf/challenges"
          className="inline-flex items-center justify-center rounded-lg bg-xeoo-primary px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Browse Active Case Files
        </Link>
      </div>
    </div>
  );
};


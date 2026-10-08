const isLocal =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (isLocal
    ? "http://localhost/PROJECT_GIT/xeoo_tools/backend"
    : `${typeof window !== "undefined" ? window.location.origin : ""}/backend`);

/**
 * XeooTools — Defacement CTF Security Utilities
 * Sandbox isolation, CSP injection, flag format validation & sanitization
 */

export const FLAG_PATTERN = /^XEOO\{[a-zA-Z0-9_\-+=!#@$%^&*()]{4,100}\}$/;

export function isValidFlagFormat(flag: string): boolean {
  if (!flag || typeof flag !== "string") return false;
  return FLAG_PATTERN.test(flag.trim());
}

/**
 * Builds an isolated sandbox HTML document with strict CSP
 * Prevents network calls (connect-src 'none'), cookie theft (no allow-same-origin),
 * and parent frame traversal.
 */
export function buildSecureSandboxHtml(rawHtml: string, title = "CTF Sandbox"): string {
  // Safe CSP that disables network connections, blocking exfiltration
  const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' data:; img-src data: blob:; script-src 'unsafe-inline'; connect-src 'none'; form-action 'javascript:void(0);';">`;

  // Neutralize potential top-window navigation or parent messaging traps
  const guardScript = `
    <script>
      (function() {
        try {
          delete window.parent;
          delete window.top;
          delete window.opener;
          window.fetch = function() { return Promise.reject(new Error("Network disabled in sandbox")); };
          window.XMLHttpRequest = function() { throw new Error("Network disabled in sandbox"); };
          window.WebSocket = function() { throw new Error("Network disabled in sandbox"); };
        } catch (e) {}
      })();
    </script>
  `;

  if (rawHtml.toLowerCase().includes("<head>")) {
    return rawHtml.replace(/<head>/i, `<head>${csp}${guardScript}`);
  }

  if (rawHtml.toLowerCase().includes("<html>")) {
    return rawHtml.replace(/<html>/i, `<html><head>${csp}${guardScript}</head>`);
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  ${csp}
  ${guardScript}
</head>
<body>
${rawHtml}
</body>
</html>`;
}

/**
 * Basic HTML escaping utility
 */
export function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Format bytes to readable human string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}


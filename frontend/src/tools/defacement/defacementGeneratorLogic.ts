import {
  DEFACEMENT_THEMES,
  type GeneratorConfig,
  type ImageTransformConfig,
} from "./defacementTemplates";

export function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function escapeAttribute(str: string): string {
  return escapeHtml(str);
}

export function sanitizeFileName(name: string): string {
  if (!name || !name.trim()) return "index.html";
  let cleaned = name.trim().replace(/[\\/:\*\?"<>\|]/g, "_");
  cleaned = cleaned.replace(/\.\.+/g, "_"); // Remove path traversal like ..
  if (!cleaned.endsWith(".html") && !cleaned.endsWith(".htm")) {
    cleaned += ".html";
  }
  return cleaned;
}

export function buildImageStyles(img: ImageTransformConfig): string {
  if (!img.dataUrl) return "display: none;";
  const styles: string[] = [];

  styles.push(`width: ${img.width}px`);
  styles.push(`height: ${img.height}px`);
  styles.push(`object-fit: ${img.objectFit}`);
  styles.push(`object-position: ${img.objectPosition}`);
  styles.push(`border-radius: ${img.borderRadius}px`);
  styles.push(`border: ${img.borderWidth}px solid ${img.borderColor}`);
  styles.push(`opacity: ${img.opacity}`);
  styles.push(
    `box-shadow: 0 0 ${img.shadowBlur}px ${img.shadowColor}`,
  );

  const filters: string[] = [];
  if (img.blur > 0) filters.push(`blur(${img.blur}px)`);
  if (img.brightness !== 1) filters.push(`brightness(${img.brightness})`);
  if (img.contrast !== 1) filters.push(`contrast(${img.contrast})`);
  if (img.saturation !== 1) filters.push(`saturate(${img.saturation})`);
  if (img.hueRotate !== 0) filters.push(`hue-rotate(${img.hueRotate}deg)`);

  if (filters.length > 0) {
    styles.push(`filter: ${filters.join(" ")}`);
  }

  const transforms: string[] = [];
  if (img.scale !== 1) transforms.push(`scale(${img.scale})`);
  if (img.rotation !== 0) transforms.push(`rotate(${img.rotation}deg)`);
  if (img.flipH) transforms.push(`scaleX(-1)`);
  if (img.flipV) transforms.push(`scaleY(-1)`);

  if (transforms.length > 0) {
    styles.push(`transform: ${transforms.join(" ")}`);
  }

  return styles.join("; ") + ";";
}

export function generateGeneratorHtml(config: GeneratorConfig): string {
  const theme =
    DEFACEMENT_THEMES.find((t) => t.id === config.themeId) ||
    DEFACEMENT_THEMES[0];

  const hasMatrix = config.effects.matrixRain || config.background.type === "matrix";
  const hasParticles = config.effects.particles;

  // Render Stats Cards
  const statsHtml =
    config.showStats && config.stats && config.stats.length > 0
      ? `
      <div class="stats-container">
        ${config.stats
          .map(
            (st) => `
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">${escapeHtml(st.label)}</span>
              ${
                st.badge
                  ? `<span class="stat-badge" style="background:${escapeAttribute(
                      st.statusColor || theme.accentColor,
                    )}22; color:${escapeAttribute(
                      st.statusColor || theme.accentColor,
                    )}; border-color:${escapeAttribute(
                      st.statusColor || theme.accentColor,
                    )}44;">${escapeHtml(st.badge)}</span>`
                  : ""
              }
            </div>
            <div class="stat-value" style="color:${escapeAttribute(
              st.statusColor || theme.accentSecondary,
            )};">${escapeHtml(st.value)}</div>
          </div>
        `,
          )
          .join("")}
      </div>
    `
      : "";

  // Render Terminal Lines
  const terminalLinesHtml =
    config.showTerminal && config.terminal && config.terminal.lines
      ? config.terminal.lines
          .map((ln) => {
            if (ln.type === "command") {
              return `<div class="term-line cmd"><span class="term-prompt">${escapeHtml(
                config.terminal.promptUser,
              )}@${escapeHtml(
                config.terminal.promptHost,
              )}:~$</span> <span class="term-cmd-text">${escapeHtml(
                ln.text,
              )}</span></div>`;
            }
            if (ln.type === "success") {
              return `<div class="term-line success"><span class="term-tag">[OK]</span> ${escapeHtml(
                ln.text,
              )}</div>`;
            }
            if (ln.type === "warning") {
              return `<div class="term-line warning"><span class="term-tag">[WARN]</span> ${escapeHtml(
                ln.text,
              )}</div>`;
            }
            if (ln.type === "error") {
              return `<div class="term-line error"><span class="term-tag">[ERR]</span> ${escapeHtml(
                ln.text,
              )}</div>`;
            }
            return `<div class="term-line out">${escapeHtml(ln.text)}</div>`;
          })
          .join("")
      : "";

  const terminalBlockHtml = config.showTerminal
    ? `
    <div class="terminal-box">
      <div class="terminal-header">
        <div class="terminal-dots">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
        </div>
        <div class="terminal-title">${escapeHtml(
          config.terminal.title || "bash",
        )}</div>
        <div class="terminal-meta">TTY:0</div>
      </div>
      <div class="terminal-body">
        ${terminalLinesHtml}
        <div class="term-cursor-line">
          <span class="term-prompt">${escapeHtml(
            config.terminal.promptUser,
          )}@${escapeHtml(
            config.terminal.promptHost,
          )}:~$</span> <span class="cursor-blink">_</span>
        </div>
      </div>
    </div>
  `
    : "";

  // Social links
  const socialsHtml =
    config.showSocials && config.socialLinks && config.socialLinks.length > 0
      ? `
      <div class="socials-row">
        ${config.socialLinks
          .map(
            (soc) =>
              `<a href="${escapeAttribute(
                soc.url,
              )}" class="social-btn" target="_blank" rel="noopener noreferrer">${escapeHtml(
                soc.label,
              )}</a>`,
          )
          .join("")}
      </div>
    `
      : "";

  // Hero / Logo Image
  const logoHtml = config.logo.dataUrl
    ? `<div class="logo-wrapper"><img src="${escapeAttribute(
        config.logo.dataUrl,
      )}" alt="Logo" class="logo-img" style="${buildImageStyles(
        config.logo,
      )}" /></div>`
    : "";

  const heroImageHtml = config.heroImage.dataUrl
    ? `<div class="hero-img-wrapper"><img src="${escapeAttribute(
        config.heroImage.dataUrl,
      )}" alt="Hero" class="hero-img" style="${buildImageStyles(
        config.heroImage,
      )}" /></div>`
    : "";

  const avatarHtml = config.avatar.dataUrl
    ? `<div class="avatar-wrapper"><img src="${escapeAttribute(
        config.avatar.dataUrl,
      )}" alt="Avatar" class="avatar-img" style="${buildImageStyles(
        config.avatar,
      )}" /></div>`
    : "";

  const bgImageOverlay = config.backgroundImage.dataUrl
    ? `<div class="bg-custom-image" style="background-image: url('${escapeAttribute(
        config.backgroundImage.dataUrl,
      )}'); opacity: ${config.backgroundImage.opacity}; filter: blur(${
        config.backgroundImage.blur
      }px);"></div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(config.browserTitle || config.pageTitle)}</title>
  <style>
    /* RESET & BASE */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      min-height: 100vh;
      background-color: ${theme.bgColor};
      color: ${theme.textColor};
      font-family: ${theme.fontFamily};
      overflow-x: hidden;
      line-height: 1.5;
    }

    /* THEME VARIABLES */
    :root {
      --accent: ${theme.accentColor};
      --accent-sec: ${theme.accentSecondary};
      --bg: ${theme.bgColor};
      --surface: ${theme.surfaceColor};
      --text: ${theme.textColor};
      --muted: ${theme.mutedColor};
      --border: ${theme.borderColor};
      --max-width: ${config.contentMaxWidth}px;
    }

    /* BACKGROUNDS */
    .bg-canvas-wrap {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      z-index: 0;
      pointer-events: none;
    }
    .bg-custom-image {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background-size: cover;
      background-position: center;
      z-index: 1;
      pointer-events: none;
    }
    ${
      config.background.type === "grid"
        ? `
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 32px 32px;
      z-index: 1;
      pointer-events: none;
    }
    `
        : ""
    }
    ${
      config.background.type === "dots"
        ? `
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      background-image: radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px);
      background-size: 24px 24px;
      z-index: 1;
      pointer-events: none;
    }
    `
        : ""
    }

    /* OVERLAYS & SCANLINES */
    ${
      config.effects.scanlines
        ? `
    .scanlines-overlay {
      position: fixed;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(255,255,255,0),
        rgba(255,255,255,0) 50%,
        rgba(0,0,0,0.3) 50%,
        rgba(0,0,0,0.3)
      );
      background-size: 100% 4px;
      z-index: 99;
      pointer-events: none;
      opacity: ${config.effects.intensity === "high" ? "0.6" : "0.3"};
    }
    `
        : ""
    }

    ${
      config.effects.crtFlicker
        ? `
    @keyframes crtFlicker {
      0% { opacity: 0.97; }
      50% { opacity: 1; }
      100% { opacity: 0.98; }
    }
    body { animation: crtFlicker 0.15s infinite; }
    `
        : ""
    }

    /* SIMULATION BANNER */
    .sim-banner {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #dc2626;
      color: #ffffff;
      text-align: center;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.18em;
      padding: 5px 12px;
      text-transform: uppercase;
      box-shadow: 0 2px 10px rgba(220,38,38,0.4);
    }

    /* MAIN CONTAINER */
    .page-container {
      position: relative;
      z-index: 10;
      width: 100%;
      min-height: calc(100vh - 30px);
      max-width: var(--max-width);
      margin: 0 auto;
      padding: ${config.contentPadding}px 18px;
      display: flex;
      flex-direction: column;
      justify-content: ${
        config.verticalAlign === "center" ? "center" : "flex-start"
      };
      text-align: ${config.textAlign};
    }

    /* BADGE */
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 9999px;
      background: ${theme.surfaceColor};
      border: 1px solid var(--accent);
      color: var(--accent);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-bottom: 16px;
      box-shadow: 0 0 12px ${theme.accentColor}33;
    }
    .badge-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 6px var(--accent);
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

    /* HEADINGS & GLITCH */
    .main-title {
      font-size: clamp(28px, 6vw, 48px);
      font-weight: 900;
      line-height: 1.15;
      letter-spacing: -0.02em;
      color: var(--accent);
      text-shadow: 0 0 20px ${theme.accentColor}66;
      margin-bottom: 8px;
    }

    ${
      config.effects.glitchText
        ? `
    .glitch-anim {
      position: relative;
      display: inline-block;
    }
    .glitch-anim::before, .glitch-anim::after {
      content: attr(data-text);
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      clip: rect(0, 0, 0, 0);
    }
    .glitch-anim::before {
      left: 2px;
      text-shadow: -2px 0 #ff0055;
      animation: glitch-anim-1 2s infinite linear alternate-reverse;
    }
    .glitch-anim::after {
      left: -2px;
      text-shadow: -2px 0 #00ffff;
      animation: glitch-anim-2 3s infinite linear alternate-reverse;
    }
    @keyframes glitch-anim-1 {
      0% { clip: rect(10px, 9999px, 30px, 0); }
      20% { clip: rect(60px, 9999px, 80px, 0); }
      40% { clip: rect(20px, 9999px, 50px, 0); }
      60% { clip: rect(80px, 9999px, 100px, 0); }
      80% { clip: rect(0px, 9999px, 40px, 0); }
      100% { clip: rect(40px, 9999px, 70px, 0); }
    }
    @keyframes glitch-anim-2 {
      0% { clip: rect(30px, 9999px, 50px, 0); }
      20% { clip: rect(10px, 9999px, 30px, 0); }
      40% { clip: rect(70px, 9999px, 90px, 0); }
      60% { clip: rect(20px, 9999px, 60px, 0); }
      80% { clip: rect(50px, 9999px, 80px, 0); }
      100% { clip: rect(0px, 9999px, 20px, 0); }
    }
    `
        : ""
    }

    .subtitle-text {
      font-size: clamp(14px, 2.5vw, 18px);
      font-weight: 600;
      color: var(--accent-sec);
      margin-bottom: 16px;
      letter-spacing: 0.05em;
    }

    .message-box {
      font-size: 13.5px;
      line-height: 1.65;
      color: var(--muted);
      max-width: 650px;
      margin: 0 auto 20px;
    }

    .quote-box {
      border-left: 3px solid var(--accent);
      padding: 10px 16px;
      background: ${theme.surfaceColor};
      border-radius: 0 8px 8px 0;
      margin: 18px auto;
      max-width: 580px;
      text-align: left;
      font-style: italic;
      font-size: 12.5px;
      color: var(--text);
    }
    .quote-author {
      display: block;
      font-style: normal;
      font-size: 10.5px;
      color: var(--accent-sec);
      font-weight: 700;
      margin-top: 4px;
    }

    /* STATS GRID */
    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 10px;
      width: 100%;
      margin: 20px 0;
    }
    .stat-card {
      background: ${theme.surfaceColor};
      border: 1px solid ${theme.borderColor};
      padding: 10px 12px;
      border-radius: 8px;
      text-align: left;
    }
    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 9px;
      font-weight: 800;
      color: var(--muted);
      letter-spacing: 0.1em;
    }
    .stat-badge {
      font-size: 8px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 999px;
      border: 1px solid;
    }
    .stat-value {
      font-size: 15px;
      font-weight: 800;
      font-family: monospace;
    }

    /* TERMINAL */
    .terminal-box {
      width: 100%;
      background: #000000;
      border: 1px solid ${theme.borderColor};
      border-radius: 10px;
      overflow: hidden;
      margin: 20px 0;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6);
      text-align: left;
    }
    .terminal-header {
      background: #111114;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #222228;
      font-size: 11px;
      color: #888899;
      font-family: monospace;
    }
    .terminal-dots {
      display: flex;
      gap: 6px;
    }
    .terminal-dots .dot {
      width: 9px; height: 9px; border-radius: 50%;
    }
    .dot.red { background: #ff5f56; }
    .dot.yellow { background: #ffbd2e; }
    .dot.green { background: #27c93f; }
    .terminal-body {
      padding: 14px;
      font-family: 'Courier New', Consolas, monospace;
      font-size: 11.5px;
      line-height: 1.6;
      color: #e0e0e0;
      max-height: 280px;
      overflow-y: auto;
    }
    .term-line { margin-bottom: 4px; word-break: break-all; }
    .term-prompt { color: var(--accent); font-weight: bold; }
    .term-cmd-text { color: #ffffff; }
    .term-line.success { color: #4ade80; }
    .term-line.warning { color: #facc15; }
    .term-line.error { color: #f87171; }
    .term-line.out { color: #a1a1aa; }
    .cursor-blink { animation: blink 1s infinite; color: var(--accent); font-weight: 900; }
    @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }

    /* SOCIALS & BUTTONS */
    .socials-row {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
      margin: 16px 0;
    }
    .social-btn {
      display: inline-flex;
      align-items: center;
      padding: 6px 14px;
      border-radius: 6px;
      background: ${theme.surfaceColor};
      border: 1px solid ${theme.borderColor};
      color: var(--text);
      font-size: 11px;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s;
    }
    .social-btn:hover {
      border-color: var(--accent);
      color: var(--accent);
      box-shadow: 0 0 10px ${theme.accentColor}33;
    }

    /* FOOTER */
    .footer-section {
      margin-top: auto;
      padding-top: 24px;
      border-top: 1px solid ${theme.borderColor};
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      font-size: 10px;
      color: var(--muted);
    }

    /* IMAGES */
    .logo-wrapper, .hero-img-wrapper, .avatar-wrapper {
      margin: 12px auto;
      display: flex;
      justify-content: center;
    }

    /* RESPONSIVE */
    @media (max-width: 640px) {
      .page-container { padding: 16px 12px; }
      .main-title { font-size: 26px; }
      .stats-container { grid-template-columns: 1fr 1fr; }
      .footer-section { flex-direction: column; text-align: center; }
    }
  </style>
</head>
<body>
  ${config.showSimulationLabel ? `<div class="sim-banner">${escapeHtml(config.simulationLabel)}</div>` : ""}
  
  ${bgImageOverlay}
  
  ${hasMatrix || hasParticles ? `<div class="bg-canvas-wrap"><canvas id="fx-canvas"></canvas></div>` : ""}
  
  ${config.effects.scanlines ? `<div class="scanlines-overlay"></div>` : ""}

  <main class="page-container">
    ${
      config.showBadge
        ? `<div style="text-align:${config.textAlign};">
            <div class="badge-pill">
              <span class="badge-dot"></span>
              <span>${escapeHtml(config.badgeText || theme.badgeText)}</span>
            </div>
          </div>`
        : ""
    }

    ${logoHtml}
    ${avatarHtml}

    <h1 class="main-title ${config.effects.glitchText ? "glitch-anim" : ""}" data-text="${escapeAttribute(
    config.headline,
  )}">
      ${escapeHtml(config.headline)}
    </h1>

    ${
      config.showSubtitle && config.subtitle
        ? `<div class="subtitle-text">${escapeHtml(config.subtitle)}</div>`
        : ""
    }

    ${heroImageHtml}

    ${
      config.showMessage && config.message
        ? `<p class="message-box">${escapeHtml(config.message)}</p>`
        : ""
    }

    ${
      config.secondaryMessage
        ? `<p class="message-box" style="font-size:11.5px; opacity:0.8;">${escapeHtml(
            config.secondaryMessage,
          )}</p>`
        : ""
    }

    ${
      config.showQuote && config.quoteText
        ? `<blockquote class="quote-box">
            "${escapeHtml(config.quoteText)}"
            ${
              config.quoteAuthor
                ? `<span class="quote-author">— ${escapeHtml(
                    config.quoteAuthor,
                  )}</span>`
                : ""
            }
          </blockquote>`
        : ""
    }

    ${statsHtml}

    ${terminalBlockHtml}

    ${socialsHtml}

    ${
      config.showContact && config.contactText
        ? `<div style="font-size:11px; color:var(--muted); margin: 12px 0;">${escapeHtml(
            config.contactText,
          )}</div>`
        : ""
    }

    ${
      config.showFooter
        ? `<footer class="footer-section">
            <div>${escapeHtml(config.footerLeft)}</div>
            <div>${escapeHtml(config.footerCenter)}</div>
            <div>${escapeHtml(config.footerRight)}</div>
          </footer>`
        : ""
    }
  </main>

  ${
    hasMatrix || hasParticles
      ? `
  <script>
    (function() {
      const canvas = document.getElementById('fx-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let w = canvas.width = window.innerWidth;
      let h = canvas.height = window.innerHeight;

      window.addEventListener('resize', function() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      });

      ${
        hasMatrix
          ? `
      const cols = Math.floor(w / 18) + 1;
      const ypos = Array(cols).fill(0);

      function renderMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '${theme.accentColor}';
        ctx.font = '13pt monospace';

        ypos.forEach((y, ind) => {
          const char = String.fromCharCode(0x30A0 + Math.random() * 96);
          const x = ind * 18;
          ctx.fillText(char, x, y);
          if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
          else ypos[ind] = y + 18;
        });
      }
      setInterval(renderMatrix, 50);
      `
          : ""
      }

      ${
        hasParticles && !hasMatrix
          ? `
      const particles = Array.from({ length: 45 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: (Math.random() - 0.5) * 0.8,
        alpha: Math.random() * 0.5 + 0.2
      }));

      function renderParticles() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
          p.x += p.speedX;
          p.y += p.speedY;
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;

          ctx.fillStyle = '${theme.accentColor}';
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
        requestAnimationFrame(renderParticles);
      }
      renderParticles();
      `
          : ""
      }
    })();
  </script>
  `
      : ""
  }
</body>
</html>`;
}


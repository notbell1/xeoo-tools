# Changelog

All notable changes to the **XeooTools** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-10-31

### 🚀 Added
- **Featured Popular Tools in Hero Section**:
  - Live popular tools card on the landing page hero section showcasing top highlighted utilities.
  - Reusable frontend hook with polling and error resilience.
- **Comprehensive OWASP Top 10 Security Hardening**:
  - **Brute-Force Rate Limiting (A07)**: Admin login attempts limited to 5 failures per 15 minutes per IP; subsequent attempts trigger temporary lockout with `HTTP 429 Too Many Requests`.
  - **Cryptographic Anti-CSRF Protection (A01 / A05)**: Session-bound security tokens generated on authentication and validated on all state-changing admin actions.
  - **Secure Session Cookie Flags (A01 / A07)**: Enforced `HttpOnly`, `SameSite=Lax`, and automatic `Secure` attributes over HTTPS.
  - **Upload Directory Hardening (A03 / A08)**: Disabled script execution and denied executable scripts within user upload storage.
  - **Directory Browsing Prevention (A05)**: Enforced directory index hiding across public and internal folders.
  - **HTTP Security Headers (A05)**: Enabled `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Referrer-Policy: strict-origin-when-cross-origin`.

### 🔄 Changed
- **Catalog Synchronization**:
  - Fully synchronized tool and category definitions between local development and production environments.
  - Standardized network diagnostics utilities under the Network Tools category.
  - Initialized default status of all tools to ready (dynamically configurable via the Admin Dashboard).
- **Global English UI Standardization**:
  - Standardized UI labels, alerts, status badges, and feedback modals across the platform to English.
  - Preserved Indonesian language specifically for the Psychology Tools collection.
- **Local Development & Proxy Routing**:
  - Configured local development API proxying to eliminate cross-origin request issues.

### 🛡️ Security & Dependencies
- Patched development server dependencies addressing command-line argument handling and file system check advisories.
- Patched data validation libraries addressing memory exhaustion advisories on constrained collections.
- Verified clean bundle production build and strict TypeScript type integrity.

---

## [1.1.0] - 2026-10-15

### 🚀 Added
- Interactive Defacement CTF & Lab environment.
- Daily Health Metrics Tracker with local storage persistence.
- Interactive Typing Test with real-time WPM, accuracy, and leaderboard.
- QR Code & Barcode generator with high-resolution canvas export.
- Admin management dashboard for categories, tools, messages, and reports.

### 🔄 Changed
- Migrated design tokens to Tailwind CSS v4.
- Standardized Light/Dark theme switching via centralized semantic tokens.

---

## [1.0.0] - 2026-09-01

### 🚀 Initial Release
- Initial release of the XeooTools platform.
- Modular tool categorization covering Math, Image, File, Security, Network, and SEO utilities.
- PHP & MySQL backend with parameterized database queries and user authentication.

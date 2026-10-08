# XeooTools 🛠️

**XeooTools** is an open-source, all-in-one web utility and developer toolkit designed with a modern, compact, and responsive user experience. It brings together dozens of essential utilities—ranging from cyber security diagnostics and CTF labs to file manipulation, image processing, networking, health, and productivity tools.

---

## 🚀 Features & Categories

XeooTools provides specialized tools categorized into modular sections:

- 🛡️ **Security Tools**: Admin Finder, WordPress Exposure Scanner, Subdomain Scanner, Scam Link Checker, JWT Decoder, Hash Generator & Identifier, File Hash Checker, Password Generator, and Password Strength Analyzer.
- 🏴 **CTF & Defacement Lab**: Interactive CTF challenge player with flag submission, hints, real-time leaderboard, player profiles, and defacement page builder/generator.
- 🌐 **Network Tools**: DNS Lookup, IP Geolocation Lookup, and Reverse IP Lookup.
- 📁 **File Tools**: File Compressor, File Encryptor/Decryptor, File Extractor, File Merger, File Splitter, File Metadata Viewer & Remover, Signature Analyzer, File Type Identifier, and ZIP Inspector.
- 🖼️ **Image Tools**: Client-side Image Compressor, Format Converter (WebP, PNG, JPEG, AVIF), Metadata Viewer, and Resizer.
- 🩺 **Health Tools**: BMI Calculator, Calorie & Macro Nutrient Calculator, Heart Rate Zone Calculator, Sleep Cycle Calculator, and Daily Health Tracker.
- 🧠 **Psychology Tools**: Big Five Personality Test, Attachment Style Assessment, Cognitive Distortion Checker, Procrastination Test, and Stress Level Analyzer.
- 🔢 **Math Tools**: Comprehensive Multi-Function Calculator and Percentage Calculator.
- ⚡ **Productivity Tools**: QR Code & Barcode Generator, Interactive Typing Speed & Accuracy Test.
- 🔍 **SEO Tools**: Domain Authority (DA) & Page Authority (PA) Checker.
- ⚙️ **Admin Management**: Dedicated administrative dashboard to manage categories, tools status, system reports, user messages, and CTF challenges.

---

## 💻 Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme**: Unified Dark & Light mode system via CSS custom tokens

### Backend
- **Core**: PHP 8.x
- **Database**: MySQL / MariaDB (PDO)
- **Local Environment**: Laragon / Apache

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher)
- [PHP](https://www.php.net/) (v8.1 or higher)
- [MySQL](https://www.mysql.com/) / MariaDB

---

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/notbell1/xeoo-tools.git
   cd xeoo-tools
   ```

2. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 🔒 Security & Privacy

- Client-side file processing is utilized wherever possible (Image converter/compressor, File hasher, etc.) so user data stays directly within the browser without uploading to external servers.
- Backend API endpoints enforce rate-limiting, CSRF token validation, input sanitization, and strict directory execution restrictions (`.htaccess`).

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).

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

## 📂 Project Structure

```text
xeoo_tools/
├── backend/                  # PHP API & Administrative backend
│   ├── admin/                # Admin portal logic
│   ├── api/                  # RESTful API endpoints for tools
│   ├── config/               # Database and environment configurations
│   ├── ctf/                  # CTF engine, challenges, auth, & migrations
│   ├── uploads/              # Upload storage (avatars, attachments)
│   ├── database.sql          # Initial MySQL database schema
│   └── .htaccess             # Apache routing & security rules
│
├── frontend/                 # React + TypeScript single page application
│   ├── src/
│   │   ├── components/       # Shared UI components & layouts
│   │   ├── data/             # Static configurations & categories
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Main application pages
│   │   ├── tools/            # Category-specific tool components & logic
│   │   │   ├── ctf/
│   │   │   ├── defacement/
│   │   │   ├── file/
│   │   │   ├── health/
│   │   │   ├── image/
│   │   │   ├── math/
│   │   │   ├── network/
│   │   │   ├── productive/
│   │   │   ├── psychology/
│   │   │   ├── security/
│   │   │   └── seo/
│   │   ├── theme.css         # Authoritative theme design tokens
│   │   └── main.tsx          # Application entry point
│   ├── package.json
│   └── vite.config.ts
│
├── .env.example              # Sample environment configuration
├── .gitignore                # Production-ready git ignore configuration
├── LICENSE                   # MIT License
└── README.md
```

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher)
- [PHP](https://www.php.net/) (v8.1 or higher with `pdo_mysql`, `curl`, and `mbstring` extensions enabled)
- [MySQL](https://www.mysql.com/) / MariaDB
- Local web server (e.g. Laragon or Apache)

---

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/notbell1/xeoo-tools.git
   cd xeoo-tools
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your database credentials:
   ```env
   APP_ENV=local
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_NAME=xeoo_tools_db
   DB_USER=root
   DB_PASSWORD=

   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password
   ```

3. **Import Database Schema:**
   Import `backend/database.sql` into your MySQL server:
   ```bash
   mysql -u root -p xeoo_tools_db < backend/database.sql
   ```

---

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
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

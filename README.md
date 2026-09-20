# Cohart | Production PWA

> **Cohart** is an all-in-one student lifecycle platform engineered for Nigerian tertiary institutions, launched as an immediate, high-performance MVP for **Olabisi Onabanjo University (OOU) Economics students** ahead of the October 5th resumption deadline.

---

## ⚡ Core Philosophy & Architecture

- **Neural Expressive UI**: Google NotebookLM-inspired minimalist dark aesthetic (`#07090E` / `#0D111A`) designed for deep study focus.
- **Brand Identity**: Electric Cyan (`#00F0FF`) to Azure Blue (`#0066FF`) linear gradient derived from the Cohart brand heart. Strictly zero orange.
- **Immediate PWA Installation**: Standard PWA Web Manifest & Service Worker configured for home-screen standalone installation on iOS Safari and Android Chrome without app store fees.
- **Resilient Offline Architecture**: Stale-while-revalidate caching and offline fallback for intermittent Nigerian network environments.
- **Live Campus Navigation**: SSR-safe dynamic React Leaflet engine centered at OOU Ago-Iwoye Permanent Site (`6.9225° N, 3.8714° E`), featuring custom Electric Blue SVG pins and Framer Motion sliding orientation sheets.
- **Bionic Reading Engine**: Programmatic fixation-guided text transformer (`src/lib/bionic.ts`) for rapid reading and study revision.

---

## 🏗️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom Glassmorphism & Electric Cyan Tokens
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Mapping**: [React Leaflet](https://react-leaflet.js.org/) & [OpenStreetMap](https://www.openstreetmap.org/) (CartoDB Dark Matter)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### 2. Installation
```bash
# Clone repository
git clone https://github.com/syntax-services/Cohart.git
cd Cohart

# Install dependencies
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env.local` and add your Supabase credentials:
```bash
cp .env.example .env.local
```

### 4. Database Setup
Run the SQL migration located in `supabase/migrations/20260920000001_create_locations.sql` in your Supabase SQL Editor.

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Production Build
```bash
npm run build
npm run start
```

---

## 📱 PWA Installation Instructions

- **iOS (Safari)**: Tap the Share button &rarr; Select **"Add to Home Screen"**.
- **Android (Chrome)**: Tap the three-dot menu &rarr; Select **"Install App"** or **"Add to Home screen"**.

---

## 🏛️ License
Proprietary & Confidential © 2026 Cohart Team.

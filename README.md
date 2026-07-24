<!-- xonettn -->
<div align="center">

# 🎮 Street Fighter Arcade

Retro browser arcade with three competitive modes: - `Typing Battle` - `Code Clash` - `Arcade Fight`


![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![Netlify](https://img.shields.io/badge/Netlify-00C7B7?logo=netlify&logoColor=white)

![Deploy](https://img.shields.io/badge/Deployed-Netlify-00C7B7?logo=netlify&logoColor=white)

</div>

---

## 📋 Overview
Retro browser arcade with three competitive modes: - `Typing Battle` - `Code Clash` - `Arcade Fight`

## 📦 Tech Stack
- React
- Vite
- Express
- Netlify (deployed)

## 🗂️ Project Structure
```
street-fighter-arcade/
  - public
  - src
  (17 files total)
```

## 🚀 Getting Started

### 📋 Prerequisites
- Node.js (v18+)
- npm or yarn

### 📦 Installation
```bash
git clone https://github.com/1nc0gn30/street-fighter-arcade.git
cd street-fighter-arcade
npm install
```

### 💻 Development
```bash
npm run dev
```

### 🔨 Build
```bash
npm run build
```

### ⚙️ Available Scripts
  npm run dev - vite --port=3000 --host=0.0.0.0
  npm run build - vite build
  npm run preview - vite preview
  npm run clean - rm -rf dist
  npm run lint - tsc --noEmit

## 📂 Original README
<details>
<summary>Click to expand original README</summary>

# Street Fighter Arcade

Retro browser arcade with three competitive modes:
- `Typing Battle`
- `Code Clash`
- `Arcade Fight`

Designed for deployment at `https://sf-arcade.nealfrazier.tech`.

## 📦 Stack

- React + TypeScript + Vite
- Tailwind CSS
- Supabase Auth + Realtime
- Motion + Canvas Confetti

## 💻 Local Development

### 📦 1. Install dependencies

```bash
npm install
```

### ⚙️ 2. Configure env vars

Create `.env` (or `.env.local`) with:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

`/.env.example` is kept in git as reference.

### 🚀 3. Run dev server

```bash
npm run dev
```

App runs on `http://localhost:3000`.

## 🔨 Production Build

```bash
npm run build
npm run preview
```

## 🚀 Netlify Deployment

This repo includes:
- [`netlify.toml`](./netlify.toml) for build, SPA redirect, and headers
- [`public/_redirects`](./public/_redirects) for SPA fallback routing

Recommended Netlify settings:
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `20`

Then attach the custom domain/subdomain:
- `arcade.nealfrazier.tech`

## 👁️ Social Preview (OG)

Social assets are included:
- [`public/og-image.svg`](./public/og-image.svg)
- [`public/og-image.png`](./public/og-image.png)

`index.html` includes Open Graph + Twitter metadata targeting `https://sf-arcade.nealfrazier.tech/og-image.png`.

## Git Hygiene

`.gitignore` is configured to avoid shipping local/private/generated files:
- env files (`.env*`, except `.env.example`)
- `node_modules`, `dist`, coverage, logs
- editor/OS noise and Netlify local state

## ⚙️ Scripts

```bash
npm run dev      # local dev
npm run build    # production build
npm run preview  # preview build
npm run lint     # type-check only
npm run clean    # remove dist
```

# street-fighter-arcade

</details>

## 📝 TODO / Roadmap
- [ ] Add unit tests
- [ ] Add LICENSE file
- [ ] Add Dockerfile for containerized deployment
- [ ] Consider adding Tailwind CSS
- [ ] Add CI/CD pipeline
- [ ] Add contribution guidelines (CONTRIBUTING.md)
- [ ] Improve error handling and edge cases
- [ ] Add environment variable documentation
- [ ] Update dependencies to latest versions
- [ ] Add code comments and inline documentation

## 🚀 Deployment
This project is deployed on Netlify. See netlify.toml for configuration.

## 👤 Author
**Neal Frazier** - [@AshAmplifies](https://github.com/1nc0gn30)

## 🔗 Links
- GitHub: https://github.com/1nc0gn30/street-fighter-arcade

---
*This README was enhanced as part of the neals-projects-2026 batch update.*

---

<div align="center">

**[xonettn]** · Built by [Neal Frazier](https://github.com/1nc0gn30) · [@AshAmplifies](https://twitter.com/AshAmplifies)

</div>

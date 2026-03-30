# Street Fighter Arcade

Retro browser arcade with three competitive modes:
- `Typing Battle`
- `Code Clash`
- `Arcade Fight`

Designed for deployment at `https://sf-arcade.nealfrazier.tech`.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Supabase Auth + Realtime
- Motion + Canvas Confetti

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure env vars

Create `.env` (or `.env.local`) with:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

`/.env.example` is kept in git as reference.

### 3. Run dev server

```bash
npm run dev
```

App runs on `http://localhost:3000`.

## Production Build

```bash
npm run build
npm run preview
```

## Netlify Deployment

This repo includes:
- [`netlify.toml`](./netlify.toml) for build, SPA redirect, and headers
- [`public/_redirects`](./public/_redirects) for SPA fallback routing

Recommended Netlify settings:
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `20`

Then attach the custom domain/subdomain:
- `arcade.nealfrazier.tech`

## Social Preview (OG)

Social assets are included:
- [`public/og-image.svg`](./public/og-image.svg)
- [`public/og-image.png`](./public/og-image.png)

`index.html` includes Open Graph + Twitter metadata targeting `https://sf-arcade.nealfrazier.tech/og-image.png`.

## Git Hygiene

`.gitignore` is configured to avoid shipping local/private/generated files:
- env files (`.env*`, except `.env.example`)
- `node_modules`, `dist`, coverage, logs
- editor/OS noise and Netlify local state

## Scripts

```bash
npm run dev      # local dev
npm run build    # production build
npm run preview  # preview build
npm run lint     # type-check only
npm run clean    # remove dist
```

# street-fighter-arcade

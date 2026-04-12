# Portofolio – Structure & Flow

## High-level

This repo is a Vite + React single-page app with 2 “apps” in one build:

- Public portfolio: `/`
- Admin center: `/login` → `/lead`

Both use Supabase REST (`/rest/v1/*`). Public pages read via anon key (RLS public read). Admin pages authenticate via Supabase Auth and write via RLS `public.is_admin()`.

## Entry points

- `index.html` – Loads `particles.js` (CDN) then `src/main.tsx`.
- `src/main.tsx` – React bootstrap.
- `src/App.tsx` – Switches between portfolio/admin based on `window.location.pathname`.

## Apps

### Portfolio (public)

- `src/apps/portfolio/PortfolioApp.tsx` – Section composition.
- `src/apps/portfolio/page-sections/*` – Section implementations (fetch remote content).
- `src/apps/portfolio/sections/*` – Stable re-export paths.
- `src/apps/portfolio/components/*` – UI components + CSS.
- `src/apps/portfolio/components/icons/*` – Reusable SVG icon components + `IconType`.
- `src/apps/portfolio/data/*` – Local fallback content + icon mapping.

### Admin

- `src/apps/admin/AdminApp.tsx` – AuthProvider + route switch.
- `src/apps/admin/lib/auth.tsx` – Auth state (anonymous/member/admin).
- `src/apps/admin/routes/LoginRoute.tsx` – Login flow.
- `src/apps/admin/routes/LeadRoute.tsx` – Admin editor (CRUD via REST).
- `src/apps/admin/pages/*` – UI for login + lead.

## Shared lib

- `src/lib/supabaseRest.ts` – Supabase REST + auth helpers (no `@supabase/supabase-js`).
- `src/lib/navigation.ts` – Minimal client routing (`navigateTo`, `usePathname`).

## Supabase

- `supabase/sql/001_admin_control.sql` – Admin access + `is_admin()` helper.
- `supabase/sql/002_portfolio_schema.sql` – Portfolio tables + RLS + `app_configs`.
- `supabase/sql/003_portfolio_seed.sql` – Seed data + default UI configs.

## Deployment notes

- `public/_redirects` – SPA fallback for Cloudflare Pages (`/* /index.html 200`).
- Env: copy `.env.example` → `.env` and fill `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

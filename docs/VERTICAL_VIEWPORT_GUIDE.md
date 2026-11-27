# Vertical Viewport Support Guide

## Overview & Motivation

This repository includes foundational partial support for **vertical (portrait) monitors and viewports** — used in particular by YBS and portrait workstation setups — while preserving full layout parity on standard landscape desktop monitors.

The goal of this foundation is not to exhaustively refactor every secondary page at once, but to establish reliable shell primitives, container-query conventions, and automated E2E viewport checks that prospective contributors can extend safely.

---

## Target Viewport Matrix

All vertical-viewport changes and automated checks target four viewports:

| Profile | Resolution | Aspect / Mode | Tailwind Width Tier | Expected Shell Behavior |
|---|---|---|---|---|
| `portrait-900` | `900 x 1600` | Portrait (9:16 scaled) | `md` (`768px–1023px`) | Admin drawer mode (`isDrawerMode = true`); public `Navbar` desktop links visible; `Footer` & `CallToAction` 2-column grid |
| `portrait-1080` | `1080 x 1920` | Portrait (1080p vertical) | `lg` (`1024px–1279px`) | Admin drawer mode (`isDrawerMode = true`); public `Navbar` desktop links visible; 2-col/3-col `@container` grids expand cleanly |
| `portrait-1440` | `1440 x 2560` | Portrait (1440p vertical) | `xl` (`1280px–1535px`) | Admin drawer mode (`isDrawerMode = true`, triggered by `orientation: portrait`); heroes capped at `960px` (`clamp(600px,100dvh,960px)`) |
| `landscape-1440` | `1440 x 900` | Landscape desktop baseline | `xl` (`>= 1280px`) | Admin persistent `256px` (`w-64`) sidebar (`isDrawerMode = false`); no regression vs. desktop baseline |

---

## Architecture & Layout Patterns

### 1. Admin Shell (`src/app/components/admin/AdminLayout.tsx`)

- **Auto-collapsing drawer mode**:
  - Uses `window.matchMedia('(max-width: 1279px), (orientation: portrait)')`.
  - Automatically collapses the `256px` sidebar into an off-canvas slide-over drawer (`#admin-sidebar`) on all portrait viewports (`900x1600`, `1080x1920`, `1440x2560`) and narrow widths (`< 1280px`), while keeping the persistent `w-64` sidebar on wide landscape desktops (`1440x900`).
  - Exposes an accessible toggle button (`data-testid="admin-sidebar-toggle"`, `aria-expanded`, `aria-controls="admin-sidebar"`), backdrop click-to-close, `Escape` key handler, drawer header close button, and auto-close on route changes (`location.pathname`).
- **Compact non-overlapping header (`AdminClock`)**:
  - Removes rigid `min-w-[280px]` constraints in favor of `min-w-0`, `truncate`, `shrink-0`, and responsive `Time:` / `timeSource` badge visibility so the clock never collides with the user avatar/badge.
- **Container query root**:
  - `<main>` content is wrapped in `<div className="@container mx-auto max-w-7xl">` with responsive padding (`p-4 lg:p-6 xl:p-8`), enabling interior cards to respond to *available* content width rather than raw window width.

### 2. Container-Query Grids & Charts (`AdminDashboard.tsx`, `Analytics.tsx`)

The project uses Tailwind CSS v4 (`@tailwindcss/vite`), which supports `@container` and `@sm:` / `@lg:` / `@xl:` / `@3xl:` / `@4xl:` / `@5xl:` variants natively without extra plugins.

- **Card-level `@container` isolation**:
  - `src/app/components/admin/Analytics.tsx` declares `@container` on its root card so it adapts cleanly both on `AdminDashboard` and when embedded inside `EventDetail.tsx`.
  - `src/app/pages/admin/AdminDashboard.tsx` declares `@container` on the dashboard root, the Category Share card, Upcoming Events card, and `CalendarWidget`.
- **Recharts overflow protection**:
  - Flex/grid chart columns include `min-w-0` and Recharts `<ResponsiveContainer width="100%" height="100%" minWidth={0}>` so donut SVGs never collapse to `0px` or overflow card boundaries.
- **Legend scroll behavior**:
  - In `Analytics.tsx`, legend chip lists expand naturally in stacked vertical mode and apply `max-h-24 overflow-y-auto` only when side-by-side (`max-h-none @4xl:max-h-24 @4xl:overflow-y-auto`), avoiding nested scroll traps on portrait screens.

### 3. Public Shell & Hero Height Rules

- **Desktop navigation at `md:` (`src/app/components/user/Navbar.tsx`)**:
  - Switched visibility breakpoints from `lg:` to `md:` (`>= 768px`) with `gap-6 lg:gap-8` and `whitespace-nowrap` on nav links and the Donate CTA so `900x1600` displays full navigation instead of `"Open menu to navigate"`.
- **Flush `MegaMenu` positioning (`src/app/components/user/MegaMenu.tsx`)**:
  - `TopBar` renders at `64px` height (`py-3` + `p-2` + `w-6 h-6`); `MegaMenu` uses `top-[64px]` and `max-h-[calc(100dvh-64px)]` so it sits flush below `TopBar` with zero vertical overlap.
- **2-column intermediate grids (`Footer.tsx`, `CallToAction.tsx`)**:
  - Updated `md:grid-cols-1 lg:grid-cols-4` to `md:grid-cols-2 lg:grid-cols-4` so 4-column blocks balance as `2x2` grids at `900x1600`.
- **Single-utility hero height clamp (`src/components/hero-aura.tsx`, `src/components/hero-2.tsx`)**:
  - Replaced `h-screen` with **`h-[clamp(600px,100dvh,960px)]`**.
  - **Important convention**: Do **not** replace `h-[clamp(...)]` with separate `min-h-[600px]` / `max-h-[960px]` utilities. Callers such as `src/app/pages/user/AlumniDirectory.tsx` pass `className="h-auto ..."` to `AuroraHero`; `tailwind-merge` merges `h-auto` against `h-[clamp(...)]` cleanly, whereas a separate `min-h-[600px]` would not be overridden and would stretch compact page headers to `600px`.

---

## Covered Surfaces vs. Contributor Backlog

### Covered in This Base PR
- `src/app/components/admin/AdminLayout.tsx` (drawer mode, accessible toggle, responsive header/clock, `@container` content wrapper)
- `src/app/components/admin/Analytics.tsx` (container-query header/grid, `min-w-0` + `minWidth={0}`, stacked legend rules)
- `src/app/pages/admin/AdminDashboard.tsx` (container-query grids, Recharts `min-w-0` + `minWidth={0}`, cleaned card headers)
- `src/app/components/user/Navbar.tsx` (`md:` desktop nav + `whitespace-nowrap`)
- `src/app/components/user/MegaMenu.tsx` (`top-[64px]` / `max-h-[calc(100dvh-64px)]`)
- `src/app/components/user/Footer.tsx` (`md:grid-cols-2 lg:grid-cols-4`)
- `src/app/components/user/CallToAction.tsx` (`md:grid-cols-2 lg:grid-cols-4`)
- `src/components/hero-aura.tsx` & `src/components/hero-2.tsx` (`h-[clamp(600px,100dvh,960px)]`)

### Contributor Backlog (Not Yet Migrated)
Prospective contributors extending vertical/narrow-viewport support should inspect these remaining surfaces next:
- `src/app/pages/user/Bulletin.tsx` (`lg:grid-cols-4` sticky filter sidebar)
- `src/app/pages/admin/AdminUsers.tsx` (`md:grid-cols-6` filter bar with `col-span-2` action buttons and wide tables)
- `src/app/components/admin/AdminContentTable.tsx` (`grid-cols-8` filter bar without `< md:` single-column fallback; used by `AdminEvents` and `AdminBulletins`)
- `src/app/pages/admin/AdminDonations.tsx` (chart/summary grids and ledger tables)
- `src/app/pages/Donation.tsx` (`lg:grid-cols-12`)
- `src/app/pages/user/EventDetail.tsx` (`lg:grid-cols-3`) and `src/app/pages/user/EventGuestList.tsx` (`lg:grid-cols-2`)
- `src/app/pages/user/Profile.tsx` and creation/edit modals (`CreateEventModal`, `CreateBulletinModal`, etc.)

---

## Verification & Contributor Checklist

Before opening a follow-up PR for additional vertical-viewport improvements:

1. **Follow repository verification constraints**:
   - Run **targeted** tests and **targeted** ESLint only.
   - **Do NOT** run full project builds (`npm run build`, `pnpm run build`, `tsc`, `vite build`) or workspace-wide lint sweeps (`npm run lint`, `eslint .`).
2. **Run the vertical-viewport E2E suite**:
   ```pwsh
   node --test test/e2e/vertical-viewport.test.mjs
   ```
3. **Run backend query parser unit tests** (when touching query/API code):
   ```pwsh
   node --test api/queryParser.test.js
   ```
4. **Run targeted ESLint on modified `src/` files**:
   ```pwsh
   npx eslint <path/to/modified/file1.tsx> <path/to/modified/file2.tsx>
   ```
5. **Confirm layout checklist** on `900x1600`, `1080x1920`, `1440x2560`, and `1440x900`:
   - `document.documentElement.scrollWidth <= window.innerWidth`
   - Zero clipped or `0px`-collapsed Recharts SVGs
   - Zero overlapping fixed/sticky headers or toolbars (`TopBar`/`MegaMenu`, `AdminClock`/user badge)
   - Zero `pageerror`, console `error`, or `/api/` `>= 400` responses

# Music App — Frontend

Next.js 14 (App Router, TypeScript) frontend for the music streaming app, built from the vibe-code spec: dark Spotify-inspired UI, Zustand + TanStack Query for state, Howler.js for Range-request audio streaming, zod-validated forms, and a JWT auth flow with silent token refresh.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm run dev
```

Open http://localhost:3000 — it redirects to `/login` or `/library` depending on auth state.

**Note:** the build fetches the Inter font from Google Fonts at build time (`next/font/google`). This requires outbound internet access; if you're building in a fully offline/sandboxed environment, swap to `next/font/local` with a bundled font file instead.

## What's implemented

- **Auth** — `/login`, `/register` with zod validation, backend field-error mapping, JWT stored in `localStorage`, axios interceptor with single-flight refresh-token retry on 401, `AuthGuard` protecting the `(main)` route group.
- **Library** (`/library`) — searchable (300ms debounce), sortable track list, drag-drop upload with metadata preview and progress, right-click context menu (rename / add to group / delete), shimmer skeletons, empty states.
- **Groups** (`/groups`, `/groups/[id]`) — mosaic cover cards, create/rename/delete, play-all, add-tracks search modal, drag-to-reorder via `@dnd-kit`.
- **Player** — persistent bottom bar (always visible, glassmorphism blur) + full-screen Now Playing view (`/player`) with blurred backdrop art. Howler.js streams via `html5: true` so the browser issues real Range requests against `/api/tracks/:id/stream`. Playback position syncs to the backend every 5s; queue, shuffle, and repeat (off/one/all) are implemented. Keyboard shortcuts: Space (play/pause), ←/→ (seek ±10s).
- **Search** (`/search`) — real-time track + group search with recent-searches persisted in `localStorage`.
- **Design system** — Tailwind config wired to the exact color palette, type scale, and spacing tokens from the spec; custom scrollbar, accent focus ring, accent text-selection color, shimmer skeleton utility, `glass-player` blur utility.

## What's stubbed or not yet built

- Volume control is wired to Howler but doesn't yet persist across sessions.
- Like/favorite button on the Now Playing view is local-only (no backend endpoint in the spec for it).
- Social login buttons on `/login` are UI-only placeholders, per the spec.
- Lyrics area on Now Playing — explicitly "TBD (future)" in the spec.
- No test suite yet.

## Verified

`npx tsc --noEmit` and `next build` both pass cleanly (font-fetch step aside, which just needs network access to Google Fonts).

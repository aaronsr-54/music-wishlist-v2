# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start              # dev server at localhost:4200
npm run start:demo     # dev server with ?demo query param (enables mock auth)
npm run build          # production build → dist/music-wishlist-v2/browser/
npm test               # Karma/Jasmine unit tests
```

Single test file: `ng test --include='**/wishlist.service.spec.ts'`

## Architecture

Angular 20 SPA deployed on **Vercel**. Two backend integrations:

- **Deezer API** — proxied via `api/search.js` (Vercel serverless function). `SearchService` calls `/api/search?q=&type=track|album`.
- **Firebase** — Auth (Google Sign-In) + Firestore (`wishlist` collection). Configured in `src/environments/`.

### Auth flow

`AuthService` (`src/app/core/auth/auth.service.ts`) has two modes:
1. **Real** — Firebase Google Sign-In via popup.
2. **Mock/Demo** — activated when `?demo` query param is present (`ConfigService` detects it). Credentials: `demo` / `1234`. Used for UI testing without a Google account.

`authGuard` protects all routes except `/login`. Guard reads `AuthService.isLoggedIn` signal.

### State management

Angular signals throughout — no NgRx. `WishlistService` keeps a reactive `signal<WishlistEntry[]>` synced via Firestore `onSnapshot`. Derived signals: `pending`, `downloaded`, `trackIds`, `total`.

### Layout

`ShellComponent` is the root authenticated view. Renders two layouts from the same component:
- **Desktop (≥768px)**: two-pane side-by-side (Search + Wishlist), active panel highlighted, inactive dimmed/blurred.
- **Mobile (<768px)**: tab bar at bottom switches between panels.

### Key paths

| Path | Purpose |
|------|---------|
| `src/app/core/auth/` | Auth service + mock auth + guard |
| `src/app/core/api/search.service.ts` | Deezer search |
| `src/app/core/firebase/wishlist.service.ts` | Firestore CRUD |
| `src/app/core/config/config.service.ts` | Demo mode detection |
| `src/app/shell/shell.component.ts` | Root layout (desktop/mobile) |
| `src/app/features/` | Search, Wishlist, Login, Profile |
| `api/search.js` | Vercel serverless proxy to Deezer |
| `vercel.json` | Build config + SPA rewrite rules |

## Demo mode

Visit `http://localhost:4200/?demo` to enable mock auth. Login with `demo` / `1234`. No Firebase Auth required.

## Conventions

### Change Detection
All components use `ChangeDetectionStrategy.OnPush`. The app is signal-driven — default CD is unnecessary overhead.

### Reactive patterns
- State → `signal()` + `computed()`
- Router/query params → `toSignal()`
- Long-lived subscriptions → `takeUntilDestroyed()`
- Avoid imperative `.subscribe()` without cleanup

### CSS / Tailwind
- Design tokens defined in `src/styles.css` `@theme` block — single source of truth
- All component styles → Tailwind utility classes (no inline `styles: []`)
- Existing `var(--bone-*)`, `var(--ink-*)`, `var(--radius-*)` are legacy aliases in `:root`; replace with Tailwind utilities when touching a component
- New components: Tailwind only, no `styles: []`

### Icons
- All SVGs via `src/app/shared/icons/icon.component.ts` — never inline SVG markup
- `src/app/shared/icons/icon-registry.ts` is the single source for icon paths

### Reusable primitives
- `src/app/shared/animations/animations.ts` — Angular Animations factories
- `src/app/shared/utils/format-fans.ts` — number formatting
- `src/app/shared/components/empty-state/` — empty state pattern
- `src/app/shared/components/button/` — action/add/cover button variants

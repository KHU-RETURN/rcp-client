# AGENTS.md

This file is the single source of truth for AI coding agents (Codex, Claude Code, Cursor, Gemini CLI, etc.) working on this repo. Keep it accurate. When in doubt, read the file before reading the code.

## Project overview

**Return Cloud Platform (RCP)** — a self-service VM provisioning console for an internal university research group (경희대학교 Return). Users sign in with their `@khu.ac.kr` Google account, pick a flavor + OS image, and get an OpenStack-backed VM with browser terminal access.

- **Type:** React SPA, deployed as static assets with a small Node fallback server for SPA routing.
- **Audience:** Bilingual (Korean primary for explanatory copy, English for UI controls). Do not flip this split.
- **Backend:** External REST API (URL from `VITE_API_BASE_URL` env var). This repo does not contain the backend.
- **Visual identity:** Documented in `DESIGN.md`. Read it before any UI change.

## Tech stack

- **Framework:** React 18.3 + TypeScript 5.6 (strict).
- **Build:** Vite 6.
- **Routing:** `react-router-dom` v6.
- **State:** `zustand` v5. Store is sliced under `src/store/slices/`.
- **Terminal:** `@xterm/xterm` v6 + `@xterm/addon-fit`.
- **Styling:** Single `src/styles/main.css` (~2500 lines). No CSS framework, no preprocessor, no CSS-in-JS. Custom properties at `:root` are the design tokens.
- **Server (production):** `server.mjs` (Node, no framework). Serves `dist/` with SPA fallback.
- **Package manager:** `npm` (see `package-lock.json`). Do not switch to pnpm/yarn without coordination.

## Setup commands

```bash
npm install              # install deps
npm run dev              # vite dev server (default :5173)
npm run typecheck        # tsc --noEmit — run this before declaring work done
npm run build            # production build → dist/ + postbuild SPA fallback
npm run preview          # vite preview against built output
npm run serve            # node server.mjs (production-style serve)
```

There is **no `test` script and no `lint` script**. Verification is manual + typecheck. See "Verification" below.

## Environment

- Required: a `.env` file at repo root containing `VITE_API_BASE_URL=...`. Without it, auth and API calls 404 against the dev server.
- The `.env` is gitignored — do not commit it. Reference values are owned by the team lead.
- Deploy target: GitHub Pages (`CNAME` present). SPA fallback handled by `scripts/create-spa-fallback.mjs` at postbuild.

## Project structure

```
src/
  App.tsx                # router root
  main.tsx               # React mount + global CSS
  config.ts              # runtime config (reads VITE_API_BASE_URL)
  components/
    auth/                # LoginPage, SignupPage, ChangesPage, AuthCallback
    layout/              # AuthLayout, AuthGuard, Topbar
    landing/             # LandingPage (marketing, scroll-driven)
    compute/             # CreatePage, InstancesPage, InstanceDetailPage, FlavorTable, InstanceTable, ResultPage, SectionRail
    storage/             # StoragePage
    terminal/            # TerminalPage, TerminalHost
    shared/              # EmptyBlock, InlineBadge, StatusPill
  constants/             # brand assets, routes, templates, terminal theme
  hooks/                 # useFullscreen, useTerminal
  services/              # api, auth, compute, demo (HTTP layer)
  store/
    index.ts             # zustand store assembly
    slices/              # auth, compute, connection, draft, storage, terminal
  types/                 # api, auth, compute, config, release, storage, templates, terminal
  utils/                 # format, helpers, validation
  styles/main.css        # the single CSS file — all tokens, all components
public/                  # static assets (logos)
scripts/                 # build-side scripts
server.mjs               # prod static server with SPA fallback
DESIGN.md                # design system (read before any UI work)
```

**Where to put new code:**
- New page → `src/components/<domain>/<PageName>.tsx`. Register the route in `App.tsx`.
- New state → add a slice in `src/store/slices/<name>.ts`, wire it into `src/store/index.ts`.
- New API call → `src/services/<domain>.ts`, typed by something in `src/types/`.
- New util → `src/utils/<name>.ts`, re-export from `src/utils/index.ts`.
- New shared component → `src/components/shared/<Name>.tsx`.
- New constant → `src/constants/<name>.ts`, re-export from `src/constants/index.ts`.

## Code style

- **TypeScript:** strict mode is on. Don't widen with `any`; prefer `unknown` + narrowing, or define a real type in `src/types/`.
- **Modules:** ES modules. `import`/`export`, never CommonJS.
- **Indentation:** 2 spaces.
- **Quotes:** single quotes in TS/TSX, double quotes only where required (JSX attributes use double).
- **Semicolons:** on.
- **Naming:**
  - Components, types, type aliases: `PascalCase`.
  - Functions, variables, hooks, store actions: `camelCase`.
  - Constants exported from `constants/`: `SCREAMING_SNAKE_CASE` for true constants, `camelCase` for data tables.
  - CSS classes: kebab-case, loosely BEM-ish (`.auth-card`, `.auth-card-head`, `.workspace-summary`).
- **React:** functional components only. Hooks for state and effects. Props are typed inline or via a named `interface`.
- **State:** local `useState` for component-only state. Zustand store for anything shared across routes or persisted.
- **Async:** `async`/`await` over `.then`. Errors caught and surfaced via the relevant store slice or local state.
- **Imports:** group as (1) react / external libs, (2) local store / services / hooks, (3) components, (4) types / constants / utils. Blank line between groups when it improves readability, otherwise compact.

## Styling rules

**Read `DESIGN.md` first.** Then:
- All new visual decisions must use existing tokens from `:root` in `src/styles/main.css` (`--bg`, `--ink`, `--muted`, `--accent`, `--success`, `--warning`, `--danger`, `--radius`, `--radius-small`, `--font-ui`, `--font-mono`).
- Do not add new fonts. Inter (app) and Pretendard (landing only) are the entire type system. Mono via system stack.
- Do not introduce a chromatic brand color. Accent is ink (`#111111`).
- Buttons are pills (`border-radius: 999px`). Primary fill is `#111111`, ghost is white-translucent, danger is outline-only.
- Hover lift is `translateY(-1px)`. Never scale, never rotate.
- New CSS goes into `src/styles/main.css` — not into per-component files. Group new selectors near their visual neighbors (auth section, workspace section, landing section, etc.).
- Korean for explanatory copy and confirm dialogs; English for UI labels, buttons, eyebrows, headings.

## Verification

Since there is no test runner or linter, verify in this order before claiming work is done:

1. **Typecheck:** `npm run typecheck`. Must be clean.
2. **Dev server:** `npm run dev`. Click through the changed flow in a browser. For UI changes, verify in both desktop (>1180px) and tablet (<1180px) widths.
3. **Build:** `npm run build`. The postbuild SPA fallback script must succeed.
4. **Preview (optional but recommended for routing changes):** `npm run preview` or `npm run serve`, then exercise the production-mode bundle.

If you cannot verify a UI change in a browser (e.g., environment limitation), say so explicitly. Do not claim a visual feature works based on diff inspection alone.

## Commit conventions

Inspect recent history with `git log --oneline` and match the style. Current pattern:

```
feat: <what was added>
fix(<scope>): <what was fixed>
chore: <maintenance>
style(<scope>): <visual / formatting only>
docs: <documentation only>
refactor: <no behavior change>
```

- Subject line under ~72 chars, imperative mood.
- Korean or English in the subject is both fine; match the prevailing style in recent commits on the branch.
- Body (optional) for the "why," not the "what." The diff explains the what.
- **Never use `--no-verify` or skip hooks** unless explicitly requested.
- **Never amend already-pushed commits.** Create a new commit.
- Do not commit secrets. The `.env` is gitignored — keep it that way.

## Branch & PR conventions

- Branch naming: `<type>/<short-kebab>`. Examples in this repo: `feat/instance-cleanup`, `chore/remove-auth-debug-logs`, `style/ui-tweaks`, `fix-landing-page`.
- One topic per branch. If scope grows, split.
- PR target: `main`.
- PR title matches commit subject style.
- PR description should cover Summary (1-3 bullets, the why) + Test plan (how you verified).
- Do not create PRs unless explicitly asked. Many tasks end at "commit on branch, ready to push."

## Things to avoid

- **Do not introduce new dependencies** without discussion. The current dep list is intentionally small. If a feature really needs one, propose it first.
- **Do not introduce a CSS framework** (Tailwind, etc.). The CSS is hand-tuned to the design tokens — see DESIGN.md.
- **Do not commit `dist/`.** It's a build artifact.
- **Do not add tests retroactively as part of an unrelated PR.** If tests are warranted, propose a separate test-infra PR.
- **Do not rewrite `main.css` into multiple files** without coordinating. Many selectors share styles via grouping; splitting breaks the cascade ordering.
- **Do not delete `assert`s, error handlers, or seemingly-unused code** without verifying they aren't load-bearing. Some code anticipates server states that don't fire in the demo path.
- **Do not introduce a chromatic brand color, decorative gradients, illustrations, or emoji into the UI.** See DESIGN.md for the rationale.

## Bilingual interaction with agents

This is an internal Korean-language project. When responding to the user in chat / CLI:

- Default to Korean for explanations, summaries, and questions.
- Keep code, identifiers, file paths, command names, and commit messages in English (matching the codebase).
- Quote error messages and tool output verbatim — do not translate them.

## Design system

See `DESIGN.md` (project root) for the full token-level design system. It uses the **getdesign.md / awesome-design-md (Stitch)** standard:
- YAML frontmatter contains machine-readable tokens (`colors`, `typography`, `rounded`, `spacing`, `shadow`, `blur`, `motion`, `components`).
- Markdown body has 11 standard sections (Overview → Known Gaps).
- Token references use the `{colors.primary}` syntax — preserve these when quoting from DESIGN.md.

**Always read DESIGN.md before any visual or UI work.** It is the source of truth for color, type, layout, motion, voice, and component recipes. Tokens are mirrored manually in `src/styles/main.css:1–22` — keep both in sync when you change values.

## Useful references

- Design system: `DESIGN.md`
- Routes: `src/constants/routes.ts`
- Brand assets: `src/constants/brand.ts`
- Terminal theme: `src/constants/terminal-theme.ts`
- Store assembly: `src/store/index.ts`
- API client: `src/services/api.ts`
- Auth layout: `src/components/layout/AuthLayout.tsx`

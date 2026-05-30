---
version: alpha
name: Return-Cloud-Platform-design-system
description: A calm light-canvas console for a university-internal cloud VM platform. The system anchors on a warm off-white canvas (#f5f5f4) with a fixed subtle grid texture, white glass surfaces with backdrop-blur, and pure black ink as both body color and primary accent — no chromatic brand color, only semantic earth tones. Type voice is Inter throughout the app (variable, optical sizing) with Pretendard preferred on the landing page only. SF Mono / ui-monospace carries code, terminal, and slug identifiers. The product has two visual moods on the same color philosophy — a cinematic dark poster landing with scanlines and scroll-driven scale, and a light glass console for auth/app. Brand voltage comes from the monochrome restraint and the single grid-mask body texture that makes the glass cards read as glass.

colors:
  primary: "#111111"
  primary-soft: "rgba(17, 17, 17, 0.08)"
  ink: "#111111"
  body: "#111111"
  muted: "#6b7280"
  hairline: "rgba(17, 17, 17, 0.10)"
  hairline-strong: "rgba(17, 17, 17, 0.16)"
  canvas: "#f5f5f4"
  canvas-alt: "#fafaf9"
  surface: "rgba(255, 255, 255, 0.74)"
  surface-strong: "rgba(255, 255, 255, 0.92)"
  surface-card-top: "rgba(255, 255, 255, 0.94)"
  surface-card-bottom: "rgba(255, 255, 255, 0.84)"
  surface-input: "rgba(255, 255, 255, 0.82)"
  surface-glass-topbar: "rgba(255, 255, 255, 0.84)"
  surface-dark: "#050505"
  surface-dark-elevated: "#0b0d10"
  surface-dark-soft: "#0e0e0f"
  surface-dark-soft-2: "#141414"
  surface-band: "#f4f4f2"
  surface-terminal-top: "#0d1628"
  surface-terminal-bottom: "#121c34"
  on-primary: "#ffffff"
  on-dark: "#ffffff"
  on-dark-soft: "rgba(255, 255, 255, 0.68)"
  on-dark-faint: "rgba(255, 255, 255, 0.58)"
  terminal-fg: "#d6e2ff"
  success: "#15803d"
  success-soft: "rgba(21, 128, 61, 0.10)"
  warning: "#a16207"
  warning-soft: "rgba(161, 98, 7, 0.10)"
  error: "#dc2626"
  error-soft: "rgba(220, 38, 38, 0.10)"
  landing-danger: "rgba(239, 68, 68, 0.82)"
  landing-danger-text: "#fca5a5"

typography:
  display-xl:
    fontFamily: "Pretendard, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(48px, 8vw, 116px)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.06em"
  display-lg:
    fontFamily: "Pretendard, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(28px, 3.6vw, 52px)"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  display-md:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.8rem, 5vw, 5.2rem)"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "-0.06em"
  display-sm:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.05em"
  title-lg:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.55rem"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  title-md:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  title-sm:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0
  body-md:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-lead:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.02rem"
    fontWeight: 400
    lineHeight: 1.85
    letterSpacing: 0
  caption:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.84rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  eyebrow:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.74rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.14em"
    textTransform: uppercase
  group-label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
    textTransform: uppercase
  table-header:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
    textTransform: uppercase
  field-label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.94rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0
  button:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0
  chip:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0
  status-pill:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0
  code:
    fontFamily: "'SFMono-Regular', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.83rem"
    fontWeight: 400
    lineHeight: 1.72
    letterSpacing: 0
  terminal:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.2px"
  mono-title:
    fontFamily: "'SFMono-Regular', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "clamp(18px, 1.6vw, 24px)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: 0

rounded:
  xs: 8px
  sm: 14px
  md: 16px
  lg: 18px
  xl: 20px
  2xl: 22px
  3xl: 28px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 22px
  xl: 32px
  2xl: 48px
  3xl: 72px
  section: 96px
  gutter-lg: 120px

shadow:
  card: "0 24px 52px rgba(15, 23, 40, 0.06)"
  card-hover: "0 18px 36px rgba(15, 23, 40, 0.08)"
  nav-active: "0 10px 24px rgba(17, 17, 17, 0.12)"
  brand-panel: "0 28px 60px rgba(17, 17, 17, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.03)"
  focus-ring: "0 0 0 4px rgba(17, 17, 17, 0.06)"
  focus-ring-strong: "0 0 0 4px rgba(17, 17, 17, 0.08)"

blur:
  glass: "blur(16px)"
  topbar: "blur(18px)"

motion:
  ease-default: "ease"
  ease-snap: "cubic-bezier(0.22, 1, 0.36, 1)"
  duration-micro: "160ms"
  duration-input: "180ms"
  duration-entrance: "180ms"
  duration-reveal: "640ms"
  duration-skeleton: "1200ms"
  hover-lift: "translateY(-1px)"

components:
  topbar:
    backgroundColor: "{colors.surface-glass-topbar}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    backdropFilter: "{blur.topbar}"
    borderBottom: "1px solid {colors.hairline}"
    padding: "18px 30px"
    height: 64px
  nav-button:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.chip}"
    rounded: "{rounded.pill}"
    padding: "9px 12px"
  nav-button-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.chip}"
    rounded: "{rounded.pill}"
    boxShadow: "{shadow.nav-active}"
    padding: "9px 12px"
  primary-button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "13px 18px"
  ghost-button:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    border: "1px solid {colors.hairline}"
    padding: "13px 18px"
  danger-button:
    backgroundColor: transparent
    textColor: "{colors.error}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    border: "1px solid {colors.error}"
    padding: "13px 18px"
  oauth-button:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    border: "1px solid {colors.hairline}"
    boxShadow: "0 12px 28px rgba(17, 17, 17, 0.06)"
    padding: "26px 32px"
    minHeight: 56px
  filter-chip:
    backgroundColor: "rgba(255, 255, 255, 0.6)"
    textColor: "{colors.muted}"
    typography: "{typography.chip}"
    rounded: "{rounded.pill}"
    border: "1px solid rgba(15, 23, 40, 0.08)"
    padding: "9px 12px"
  filter-chip-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.chip}"
    rounded: "{rounded.pill}"
    padding: "9px 12px"
  status-pill:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.status-pill}"
    rounded: "{rounded.pill}"
    padding: "8px 12px"
  inline-badge-valid:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    typography: "{typography.status-pill}"
    rounded: "{rounded.pill}"
  inline-badge-pending:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    typography: "{typography.status-pill}"
    rounded: "{rounded.pill}"
  inline-badge-error:
    backgroundColor: "{colors.error-soft}"
    textColor: "{colors.error}"
    typography: "{typography.status-pill}"
    rounded: "{rounded.pill}"
  field-input:
    backgroundColor: "{colors.surface-input}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.hairline-strong}"
    padding: "14px 16px"
  field-input-focused:
    backgroundColor: "{colors.surface-input}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    border: "1px solid rgba(17, 17, 17, 0.35)"
    boxShadow: "{shadow.focus-ring}"
  auth-note:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    border: "1px solid rgba(17, 17, 17, 0.08)"
    padding: "20px"
  glass-card:
    backgroundColor: "linear-gradient(180deg, {colors.surface-card-top}, {colors.surface-card-bottom})"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.2xl}"
    border: "1px solid rgba(17, 17, 17, 0.08)"
    boxShadow: "{shadow.card}"
    backdropFilter: "{blur.glass}"
    padding: "22px"
  auth-card:
    backgroundColor: "linear-gradient(180deg, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.60))"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.3xl}"
    border: "1px solid rgba(255, 255, 255, 0.90)"
    boxShadow: "{shadow.card}"
    backdropFilter: "{blur.glass}"
    padding: "22px"
    minHeight: 560px
  auth-brand-panel:
    backgroundColor: "linear-gradient(180deg, {colors.surface-dark-soft}, {colors.surface-dark-soft-2})"
    textColor: "{colors.on-dark}"
    typography: "{typography.display-md}"
    rounded: "{rounded.3xl}"
    border: "1px solid rgba(255, 255, 255, 0.90)"
    boxShadow: "{shadow.brand-panel}"
    padding: "34px"
    minHeight: 560px
  image-card:
    backgroundColor: "linear-gradient(180deg, {colors.surface-card-top}, {colors.surface-input})"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    border: "1px solid rgba(17, 17, 17, 0.08)"
    boxShadow: "0 14px 30px rgba(15, 23, 40, 0.05)"
    padding: "18px 20px"
  image-card-selected:
    backgroundColor: "linear-gradient(180deg, {colors.surface-card-top}, {colors.surface-input})"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    border: "1px solid rgba(17, 17, 17, 0.6)"
  code-block:
    backgroundColor: "linear-gradient(180deg, {colors.surface-terminal-top}, {colors.surface-terminal-bottom})"
    textColor: "{colors.terminal-fg}"
    typography: "{typography.code}"
    rounded: "{rounded.2xl}"
    border: "1px solid rgba(255, 255, 255, 0.86)"
    padding: "20px"
  terminal-host:
    backgroundColor: "{colors.surface-terminal-top}"
    textColor: "{colors.terminal-fg}"
    typography: "{typography.terminal}"
    rounded: "{rounded.2xl}"
    padding: "10px"
  landing-dark-card:
    backgroundColor: "{colors.surface-dark-elevated}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xs}"
    border: "1px solid rgba(255, 255, 255, 0.12)"
    padding: "26px"
    minHeight: 190px
  landing-flavor-card:
    backgroundColor: "{colors.surface-dark-elevated}"
    textColor: "{colors.on-dark}"
    typography: "{typography.mono-title}"
    rounded: "{rounded.xs}"
    border: "1px solid rgba(255, 255, 255, 0.13)"
    padding: "28px"
    minHeight: 230px
  footer-line:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    borderTop: "1px solid {colors.hairline}"
    paddingTop: "30px"
---

## Overview

Return Cloud Platform (RCP) is a self-service VM provisioning console for an internal university research group. The interface is consciously calm. Pure-black ink (`{colors.ink}` — #111111) sits on a warm off-white canvas (`{colors.canvas}` — #f5f5f4) with a fixed `28px × 28px` white grid mask that fades top→bottom. The mask is what makes the white-glass cards (`{colors.surface}` with `{blur.glass}`) read as glass instead of as flat translucent rectangles — keep it.

The product has two visual moods on the same color philosophy:

1. **Landing** (`/`) — dark cinematic poster (`{colors.surface-dark}` — #050505) with scanlines, scroll-driven hero scaling, and big display type (`{typography.display-xl}`). The single expressive moment.
2. **Auth + App** — light glass console: topbar with `{blur.topbar}` backdrop, two-column workspace shell, glass cards on warm canvas, generous radii (`{rounded.2xl}`–`{rounded.3xl}`), almost-no-motion interactions (`{motion.hover-lift}` on hover, nothing more).

There is **no chromatic brand color**. The accent (`{colors.primary}`) is the same as the body ink — pure black. Semantic colors (`{colors.success}` `#15803d`, `{colors.warning}` `#a16207`, `{colors.error}` `#dc2626`) are muted earth tones, never saturated primaries. This monochrome restraint is the brand voltage.

**Key characteristics:**
- Warm canvas (`{colors.canvas}` — #f5f5f4) with grid-mask body texture. The signature background.
- Black ink as accent (`{colors.primary}` — #111111). Primary CTAs are pure-black pills.
- Inter throughout the app (variable, optical sizing 14–32, weights 100–900). Pretendard preferred on the landing only.
- SF Mono / `ui-monospace` for code, terminal output, slug-like identifiers, and the landing's data-card titles.
- Glass surfaces: white-translucent gradient (`{colors.surface-card-top}` → `{colors.surface-card-bottom}`), `{blur.glass}` backdrop, `1px` hairline border, large soft shadow `{shadow.card}`.
- Section radius is hierarchical: `{rounded.xs}` (8px) for landing dark cards (deliberately sharper, editorial), `{rounded.md}` (16px) for inputs, `{rounded.2xl}` (22px) for mid cards, `{rounded.3xl}` (28px) for top-level auth panels, `{rounded.pill}` (9999px) for buttons / chips / status pills.
- Hover is `{motion.hover-lift}` (`translateY(-1px)`) — nothing larger, ever.
- Korean for explanatory body copy and confirmation dialogs. English for UI controls, labels, and headings. The mix is intentional, not a bug.

## Colors

### Brand & Accent
- **Primary / Ink** (`{colors.primary}` — #111111): The single accent. Used on `primary-button` background, `nav-button-active`, brand mark dot, and as the body ink. The brand has no chromatic accent — the discipline is the design.
- **Primary Soft** (`{colors.primary-soft}` — `rgba(17, 17, 17, 0.08)`): The wash used for `status-pill` background, `nav-button` hover, `auth-note` background, and `flavor-table` selected row.

### Surface
- **Canvas** (`{colors.canvas}` — #f5f5f4): Default page floor for auth and app. Warm off-white.
- **Canvas Alt** (`{colors.canvas-alt}` — #fafaf9): Slightly warmer tone used at the top of the body gradient.
- **Surface** (`{colors.surface}` — `rgba(255, 255, 255, 0.74)`): Default glass tone for translucent panels.
- **Surface Strong** (`{colors.surface-strong}` — `rgba(255, 255, 255, 0.92)`): For high-contrast glass — `ghost-button`, condensed surfaces.
- **Surface Card** (`{colors.surface-card-top}` / `{colors.surface-card-bottom}`): The 180° gradient used by every mid card (`.table-frame`, `.line-block`, `.workspace-summary`, `.result-pane`, `.image-card`).
- **Surface Input** (`{colors.surface-input}` — `rgba(255, 255, 255, 0.82)`): Form input background.
- **Surface Glass Topbar** (`{colors.surface-glass-topbar}` — `rgba(255, 255, 255, 0.84)`): Sticky topbar.

### Dark surfaces
- **Surface Dark** (`{colors.surface-dark}` — #050505): Landing hero floor (with `#000000` scanline pseudo).
- **Surface Dark Elevated** (`{colors.surface-dark-elevated}` — #0b0d10): Landing platform/story sections, all landing dark cards.
- **Surface Dark Soft** (`{colors.surface-dark-soft}` → `{colors.surface-dark-soft-2}` — #0e0e0f → #141414): Auth brand panel gradient.
- **Surface Band** (`{colors.surface-band}` — #f4f4f2): Landing flavors band (slightly cooler than canvas — used to break landing rhythm).

### Terminal & code
- **Surface Terminal Top → Bottom** (`{colors.surface-terminal-top}` → `{colors.surface-terminal-bottom}` — #0d1628 → #121c34): Dark navy gradient for `code-block` and `terminal-host`. Cool, not warm — the only cool surface in the system.
- **Terminal Foreground** (`{colors.terminal-fg}` — #d6e2ff): Cool ice blue. Do not pull this color into UI chrome — it lives in the terminal pane only.
- **Terminal ANSI palette** is defined separately in `src/constants/terminal-theme.ts`. Those colors are for shell output, never for app UI.

### Text
- **Ink** (`{colors.ink}` — #111111): All headings, all body, labels, table strong values.
- **Muted** (`{colors.muted}` — #6b7280): Captions, help text, group labels, supporting copy, status pill on neutral state. Contrast on canvas is ~4.6:1 — do not lighten further.
- **On Primary** (`{colors.on-primary}` — #ffffff): Text on black buttons and active nav.
- **On Dark** (`{colors.on-dark}` — #ffffff) / **On Dark Soft** (`{colors.on-dark-soft}` — `rgba(255, 255, 255, 0.68)`) / **On Dark Faint** (`{colors.on-dark-faint}` — `rgba(255, 255, 255, 0.58)`): Layered text contrast on landing dark cards.

### Semantic
- **Success** (`{colors.success}` — #15803d) / Soft (`{colors.success-soft}`). Muted forest green.
- **Warning** (`{colors.warning}` — #a16207) / Soft (`{colors.warning-soft}`). Muted amber.
- **Error** (`{colors.error}` — #dc2626) / Soft (`{colors.error-soft}`). Brick red, used for `danger-button` outline + text and `inline-badge-error`.
- **Landing Danger** (`{colors.landing-danger}` — `rgba(239, 68, 68, 0.82)` border, `{colors.landing-danger-text}` — #fca5a5 text): A more vivid red reserved for `.landing-platform-card.is-pending` only — the marketing surface gets a brighter red because the dark context absorbs saturation.

### Hairlines
- **Hairline** (`{colors.hairline}` — `rgba(17, 17, 17, 0.10)`): Card borders, row dividers, footer separator. The default 1px line.
- **Hairline Strong** (`{colors.hairline-strong}` — `rgba(17, 17, 17, 0.16)`): Form input border. Slightly darker to make inputs read as interactive without needing a fill change.

## Typography

### Font family
- **Inter** (variable, italic + roman, weights 100–900, optical sizing 14–32) — loaded via Google Fonts in `index.html`. Carries everything in the app (auth, console, forms, tables, code-adjacent prose).
- **Pretendard** — preferred only on `.landing-page`. Not self-hosted; relies on system install with Inter as graceful fallback. Use it only when the surface is the marketing landing.
- **SF Mono / ui-monospace** (system stack) — code blocks (`{typography.code}`), terminal (`{typography.terminal}`), landing card titles (`{typography.mono-title}`), and any slug-like identifier surfaced in UI.

### Hierarchy
| Token | Used for | Family | Weight | Size | Tracking |
|---|---|---|---|---|---|
| `{typography.display-xl}` | Landing hero H1 | Pretendard / Inter | 800 | `clamp(48–116)` | `-0.06em` |
| `{typography.display-lg}` | Landing big statement | Pretendard / Inter | 800 | `clamp(28–52)` | `-0.03em` |
| `{typography.display-md}` | Auth brand wordmark | Inter | 700 | `clamp(2.8–5.2rem)` | `-0.06em` |
| `{typography.display-sm}` | Result hero H1 | Inter | 700 | `clamp(32–64)` | `-0.05em` |
| `{typography.title-lg}` | Auth kicker | Inter | 700 | `1.55rem` | `-0.03em` |
| `{typography.title-md}` | Section H2 | Inter | 700 | `1.3rem` | `-0.03em` |
| `{typography.title-sm}` | `.line-block-head strong` | Inter | 700 | `1rem` | 0 |
| `{typography.body-md}` | Default body | Inter | 400 | `1rem` | 0 |
| `{typography.body-sm}` | Help text under fields, auth-note span | Inter | 400 | `0.92rem` | 0 |
| `{typography.body-lead}` | `.lead` paragraphs | Inter | 400 | `1.02rem` (LH `1.85`) | 0 |
| `{typography.caption}` | Small meta text | Inter | 400 | `0.84rem` | 0 |
| `{typography.eyebrow}` | Page eyebrows ("Compute", "Instance details") | Inter | 700 | `0.74rem` UPPER | `0.14em` |
| `{typography.group-label}` | Group labels in summaries | Inter | 700 | `0.82rem` UPPER | `0.08em` |
| `{typography.table-header}` | Table TH | Inter | 700 | `0.78rem` UPPER | `0.08em` |
| `{typography.field-label}` | `.field > span` | Inter | 700 | `0.94rem` | 0 |
| `{typography.button}` | All button labels | Inter | 700 | `1rem` | 0 |
| `{typography.chip}` / `{typography.status-pill}` | Filter chips, status pills | Inter | 700 | `0.82` / `0.78rem` | 0 |
| `{typography.code}` | Code blocks | mono stack | 400 | `0.83rem` (LH `1.72`) | 0 |
| `{typography.terminal}` | Terminal pane | mono stack | 400 | `13px` | `0.2px` |
| `{typography.mono-title}` | Landing card titles | mono stack | 700 | `clamp(18–24)` | 0 |

### Principles
- Display headings always pull tracking tight (`-0.03em` to `-0.06em`). Body never tightens tracking.
- Eyebrows, group labels, and table headers always uppercase with positive tracking (`0.08em`–`0.14em`).
- Body line-height is generous (`1.5`–`1.85`). This is a reading interface, not a dense dashboard.
- Mono is for data, not decoration. Code, terminal, slugs, flavor names. Never for headings outside the landing's `mono-title` exception.

### Note on font substitutes
- Pretendard is referenced but **not self-hosted**. If Korean users lack the system install, the landing falls back to Inter. This is by design — Inter is the only font we guarantee at load. If you self-host Pretendard later, add the `@font-face` block in `main.css`, not in a separate file.
- Do not substitute Inter for Roboto, Open Sans, or system-default. The variable Inter is load-bearing for the display weights.

## Layout

### Spacing system
| Token | Value | Used for |
|---|---|---|
| `{spacing.xxs}` | 4px | Tightest inline gaps (icon→text inside chips, card-title meta) |
| `{spacing.xs}` | 8px | Action row internal gap, summary check row vertical |
| `{spacing.sm}` | 12px | Button group gap, summary grid horizontal |
| `{spacing.md}` | 16px | Card content gap, paired blocks horizontal |
| `{spacing.lg}` | 22px | Card interior padding (`.line-block`, `.workspace-summary`, `.auth-card`) |
| `{spacing.xl}` | 32px | Brand panel padding |
| `{spacing.2xl}` | 48px | Landing section internal gap |
| `{spacing.3xl}` | 72px | Result layout bottom padding |
| `{spacing.section}` | 96px | Landing section vertical rhythm |
| `{spacing.gutter-lg}` | 120px | Landing horizontal padding upper bound |

Spacing is on an 8px base in spirit but expressed as raw px values in CSS — there are no `--space-*` variables. Read the value, don't compute one.

### Grid & container
- **Auth shell**: `min(1040px, 100vw - 48px)`, two-column grid `minmax(320px, 0.9fr) minmax(420px, 1fr)`, gap `32px`. Collapses to single column at `1180px`.
- **Result layout**: `min(1280px, 100vw - 48px)`. Used for compute/result pages.
- **Workspace** (`.workspace.workspace-list`): two-column grid (main + right rail). Rail drops below at `1180px`.
- **Landing sections**: full-bleed with `padding: 0 clamp(24px, 8vw, 168px)`.
- **Field grid**: `repeat(2, minmax(0, 1fr))` collapsing to 1fr at `1180px`. `.field-wide` spans full row.
- **Image grid**: `repeat(3, minmax(0, 1fr))` with container query collapse to 1fr at `760px`.

### Whitespace philosophy
- Cards breathe. `{spacing.lg}` (22px) interior padding is the default — do not shrink below `{spacing.md}` (16px) without reason.
- Section headings have 8–16px space before their support text, never a full `{spacing.md}`. Header + eyebrow + support reads as one block.
- Row dividers (`border-bottom: 1px solid {colors.hairline}`) replace heavy gaps inside long lists. Don't combine dividers + large gaps — pick one.
- Mobile (`760px` and below): rows that were side-by-side become stacks. Padding shrinks to `16px` horizontal.

## Elevation & Depth

The system uses **shadow + backdrop-blur + hairline border** to express depth, not material thickness or stacked z layers.

| Token | Value | Used for |
|---|---|---|
| `{shadow.card}` | `0 24px 52px rgba(15, 23, 40, 0.06)` | All mid cards (glass-card, table-frame, line-block, workspace-summary, result-pane, code-block) |
| `{shadow.card-hover}` | `0 18px 36px rgba(15, 23, 40, 0.08)` | Image card hover |
| `{shadow.nav-active}` | `0 10px 24px rgba(17, 17, 17, 0.12)` | Active nav button |
| `{shadow.brand-panel}` | `0 28px 60px rgba(17, 17, 17, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.03)` | Auth brand panel only |
| `{shadow.focus-ring}` | `0 0 0 4px rgba(17, 17, 17, 0.06)` | Form input focus |
| `{shadow.focus-ring-strong}` | `0 0 0 4px rgba(17, 17, 17, 0.08)` | Image card focus-visible |

### Decorative depth
- **Body backdrop** (main.css:32–54): two soft radial gradients (top-left and top-right) over a vertical canvas gradient. Plus a fixed `body::before` pseudo-element with a `28px × 28px` white grid that fades top→bottom via mask-image. This is the silent signature — removing it breaks the glass illusion.
- **Auth brand panel watermark**: `return-black.svg` at `12%` opacity, rotated `-7deg`, positioned `-top: 36px / right: -78px`, sized `520 × 520px`. Subtle, never decorative.
- **Landing hero scanlines**: `repeating-linear-gradient` at `rgba(255, 255, 255, 0.03)`, animated 9s linear infinite. Landing only.

## Shapes

### Border radius scale
| Token | Value | Used for |
|---|---|---|
| `{rounded.xs}` | 8px | Landing dark cards (deliberately sharp for editorial feel) |
| `{rounded.sm}` | 14px | (Reserved; `--radius-small`) |
| `{rounded.md}` | 16px | Form inputs, auth-note, skeleton bands |
| `{rounded.lg}` | 18px | OAuth login button |
| `{rounded.xl}` | 20px | Image cards |
| `{rounded.2xl}` | 22px | Mid cards (`--radius`) — table-frame, line-block, workspace-summary, result-pane, code-block |
| `{rounded.3xl}` | 28px | Auth top-level panels |
| `{rounded.pill}` | 9999px | All buttons, chips, status pills, nav buttons, brand mark dot |

The landing's `{rounded.xs}` is intentionally sharper than the rest of the system. Do not unify the radius scale across the landing and the app — the contrast is the rhythm.

### Photography & illustrations
- **No photography. No illustrations. No emoji in UI.** The infinity-loop brand mark (`/assets/return-black.svg` / `return-white.png` / `return-black.png`) is the only graphic.
- **Provider logos** are the single chromatic exception — the Google G on `oauth-button` is rendered in Google's brand colors at `22px` square.
- **OS / image marks** (`.image-card-mark-ubuntu`, `-rocky`, `-default`) are monochrome glyphs. Don't introduce vendor color here.

## Components

### Top navigation
- `topbar`: sticky, `{blur.topbar}` backdrop, `1px {colors.hairline}` bottom border, `padding: 18px 30px`, `64px` height.
- `nav-button` / `nav-button-active`: pill, `{typography.chip}`, active uses solid black with `{shadow.nav-active}`.

### Buttons
| Variant | Background | Border | Text | When |
|---|---|---|---|---|
| `primary-button` | `{colors.primary}` solid | none | `{colors.on-primary}` | Primary CTA |
| `ghost-button` | `{colors.surface-strong}` | `1px {colors.hairline}` | `{colors.ink}` | Secondary, paired with primary |
| `danger-button` | transparent | `1px {colors.error}` | `{colors.error}` | Destructive (delete instance) |
| `oauth-button` | `#ffffff` | `1px {colors.hairline}` | `{colors.ink}` | OAuth provider entry — login only |

All buttons share: pill radius (`{rounded.pill}`), `{typography.button}`, `13px 18px` padding (chips: `9px 12px`), `{motion.hover-lift}` on hover, `opacity: 0.5` + `cursor: not-allowed` when disabled.

### Cards & containers
- `glass-card` (the default mid card): see token. Used as `.table-frame`, `.line-block`, `.workspace-summary`, `.result-pane`. Padding `{spacing.lg}`.
- `auth-card`: top-level glass at `{rounded.3xl}`, minHeight `560px`, grid rows `auto 1fr` (header + stage). The stage row fills remaining height so `margin-top: auto` on the footer pins it to the bottom — load-bearing.
- `auth-brand-panel`: dark gradient, white wordmark `{typography.display-md}`, watermark behind, minHeight `560px`. Pairs with `auth-card` in `auth-shell`.
- `image-card` / `image-card-selected`: white glass at `{rounded.xl}`. Selected = stronger border (`rgba(17, 17, 17, 0.6)`). Focus-visible adds `{shadow.focus-ring-strong}`.
- `landing-dark-card` / `landing-flavor-card`: dark cards on landing dark sections. `{rounded.xs}` (8px). Mono title for flavor cards.

### Inputs & forms
- `field-input` / `field-input-focused`: see token. Focus drops the border to `rgba(17, 17, 17, 0.35)` and adds `{shadow.focus-ring}`.
- `.field` wrapper: grid with `gap: 10px` between label, input, and small help text.
- Field label uses `{typography.field-label}`; help text uses `{typography.caption}` in `{colors.muted}`.

### Tags / badges
- `status-pill`: see token. Variants (`live`, `demo`, `neutral`) all use the same background — variant class is for screen readers + future divergence, not visible color.
- `inline-badge-{valid|pending|error}`: see tokens. Used in detail panes next to entity names.
- `inline-status`: text-only status under buttons (e.g., "Saving..."). Color is `{colors.success}` / `{colors.error}` / `{colors.ink}` depending on state.

### Tab / filter
- `filter-chip` / `filter-chip-active`: see token. Active matches `primary-button` palette (black fill, white text).

### CTA / footer
- `footer-line` (used by auth `.auth-footer`): `1px {colors.hairline}` top border, `{spacing.lg}+8` padding-top, flex space-between layout for copyright + legal links. Use the same pattern in any future footer.

### Code & terminal
- `code-block`: dark navy gradient at `{rounded.2xl}`, ice-blue mono text, subtle bright top hairline.
- `terminal-host`: minimal padding (`10px`), full-bleed terminal pane inside. Hosts xterm.js — the ANSI palette is loaded from `src/constants/terminal-theme.ts`.

## Do's and Don'ts

### Do
- Use `{colors.primary}` (#111111) as the single accent. Every primary CTA, every active nav, every brand dot is this color.
- Use the body backdrop (canvas + radial gradients + grid mask) as-is on auth and app pages. The glass cards depend on it.
- Pill-shape every button, chip, and status indicator (`{rounded.pill}`).
- Animate hover with `{motion.hover-lift}` only.
- Use English for UI controls and labels, Korean for explanatory copy and confirmation dialogs.
- Use `{typography.eyebrow}` → heading → `{typography.body-sm}` muted support as the section header pattern.
- Keep the landing's `{rounded.xs}` (8px) cards sharp — the rhythm against the app's larger radii is intentional.
- Honor `prefers-reduced-motion` on any new animation. The auth card entrance already does.

### Don't
- Don't introduce a chromatic brand color. There is no blue, no purple, no green except semantic.
- Don't replace Inter with Roboto, Open Sans, or system-default — Inter is load-bearing.
- Don't substitute the glass card recipe with a flat fill. The white-translucent gradient + `{blur.glass}` + `{shadow.card}` reads as glass because of the body grid mask.
- Don't pull `{colors.terminal-fg}` (#d6e2ff) or any terminal ANSI color into the UI chrome.
- Don't scale, rotate, or grow elements on hover. `translateY(-1px)` only.
- Don't add a fourth surface mode. Canvas, glass cards, dark mockups (code/terminal/landing) — that's the trinity.
- Don't unify the radius scale across landing and app — the contrast is the rhythm.
- Don't decorate. No purple gradients, no icon-in-circle feature grids, no decorative blobs, no stock photography, no emoji.

## Responsive Behavior

### Breakpoints
- **`900px`**: Landing collapses (`.landing-platform-grid`, `.landing-story-grid`, `.landing-feature-grid` → single column; nav gap shrinks; hero logo shrinks).
- **`1180px`**: Auth shell collapses to single column (`.auth-shell`, `.workspace`, `.paired-blocks`, `.review-layout`, `.result-grid`, `.field-grid`, `.field-grid-access` → 1fr).
- **`760px`**: Global stack-and-pad — `.topbar` becomes vertical, `.auth-shell` / `.workspace` / `.result-layout` get `16px` horizontal padding, rows in `.bullet-rows` / `.summary-grid` / `.review-rows` stack.

### Touch targets
- All buttons meet `40px+` height via `13px` vertical padding + `{typography.button}` (1rem = ~24px line-height) = ~50px.
- Filter chips are tighter (`9px 12px`) — about `40px`. Don't shrink below this.
- Form inputs are `48px+` tall via `14px` padding + `1rem` text.

### Collapsing strategy
- **Two-column → single column**: at `1180px` for app shells and field grids. Right rails drop below the main column.
- **Wide table → scroll**: `.flavor-table` keeps `min-width: 720px` (drops to `640px` at `760px`) and scrolls horizontally inside `.table-frame`. Do not reflow cells.
- **Detail page**: `.detail-page-grid` → single column at `760px`.

### Image behavior
- Brand watermark (`auth-brand-panel::before`): repositions and shrinks at `1180px` (`width: 360px` / `height: 360px`, `right: -76px / top: 18px`).
- Landing hero logo: `width: min(72vh, 62vw, 760px)` → `min(78vw, 620px)` at `900px`.

## Iteration Guide

When generating or modifying UI for this product, use the design tokens above as the source of truth. Prefer token references over hard-coded values.

**Quick palette reference for prompting:**
- Canvas: `{colors.canvas}` — #f5f5f4
- Ink / accent: `{colors.primary}` — #111111
- Muted: `{colors.muted}` — #6b7280
- Glass card top → bottom: `{colors.surface-card-top}` → `{colors.surface-card-bottom}`
- Hairline: `{colors.hairline}` — `rgba(17, 17, 17, 0.10)`
- Success / Warning / Error: `#15803d` / `#a16207` / `#dc2626`

**Ready-to-use prompts:**

> Build a settings page with the design tokens in `DESIGN.md`. Use the workspace shell pattern: topbar, two-column grid (main + right rail), glass cards for each settings group, pill primary button for save, Korean help text under field labels.

> Build a new compute resource list page following `DESIGN.md`. Reuse the `inventory-toolbar` pattern (search field + filter chips + meta count), the `glass-card` recipe wrapping a table, and the eyebrow → heading → support copy block.

> Build a confirm-destruction dialog using `DESIGN.md`. Use `auth-card`-style glass at `{rounded.2xl}`, Korean confirmation copy as the body, `danger-button` for confirm, `ghost-button` for cancel.

When in doubt: copy the closest existing pattern from `src/components/`, then swap copy and tokens. Don't invent new surfaces.

## Known Gaps

- **No formal dark mode.** The terminal pane and landing hero are the system's "dark" expressions. If true dark mode is added, redesign surfaces — don't invert.
- **Spacing isn't tokenized as CSS variables.** Values are raw px in `main.css`. If a future build tooling step needs CSS variables, generate them from this file's `spacing:` block.
- **No formal motion library or keyframe registry.** `shimmer`, `shellEnter`, `authFade`, `landingScan`, `landingArrow` are defined inline. Reduced-motion support is partial (only auth card entrance).
- **Form validation states beyond focus** are not formalized. Error fields don't have a documented red-border + helper-text pattern yet — the closest reference is `inline-badge-error` for non-field error surfacing.
- **Pretendard is not self-hosted.** Korean landing users without a system install get Inter. Accept this or add an `@font-face` for Pretendard variable in `main.css`.
- **No design tokens build pipeline.** This file is the source of truth but is not consumed by Tailwind, Style Dictionary, or any CSS variable generator. Tokens are mirrored manually in `src/styles/main.css:1–22`. Keep both in sync when changing values.

---

Sources:
- [getdesign.md — DESIGN.md collection for AI coding agents](https://getdesign.md/)
- [VoltAgent/awesome-design-md (the Stitch DESIGN.md format)](https://github.com/VoltAgent/awesome-design-md)
- [DESIGN.md Generator — design.dev](https://design.dev/ai/design-md-generator/)
- [What Is design.md for Coding Agents? — WaveSpeed Blog](https://wavespeed.ai/blog/posts/what-is-design-md-for-coding-agents/)

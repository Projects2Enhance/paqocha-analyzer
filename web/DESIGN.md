# Paqocha Analyzer — Design Conventions

Living document. This phase covers color tokens and the light/dark theme
system only. Other sections are placeholders.

## Brand colors (source)

- Periwinkle `#5F62A4`
- Cream `#FBF3D2`
- Lime `#CFD224`

These aren't used directly in page-chrome UI; they're refined into the
semantic tokens below so every surface, text, and interactive color has a
defined purpose and a verified contrast ratio. The one exception is
`--brand-cream`, a primitive (not theme-switching) kept for content laid
over fixed media rather than the page background — see Tokens below.

## Tokens

All tokens live in `styles/tokens.css`. `:root` defines the light theme
(default); `[data-theme="dark"]` overrides it. Both set `color-scheme` so
native form controls and scrollbars match the active theme.

`--brand-cream` (`#FBF3D2`) is declared once in `:root` and **not**
overridden in `[data-theme="dark"]` — it's a brand primitive, not a
semantic/theme-switching token. Use it only for content that sits on fixed
media (e.g. the hero video's tagline text) where the color must stay
constant regardless of the site's light/dark theme. Everything else should
use the semantic tokens below.

### Light theme (default)

| Token | Value | Why |
|---|---|---|
| `--color-bg` | `#FEFAEA` | Near-white, warm cream tint instead of pure white — softer, on-brand. |
| `--color-surface` | `#FBF3D2` | Brand cream; raised surfaces (cards, panels) one step warmer than the page background. |
| `--color-text` | `#1F2150` | Dark indigo (near-black, never pure black); highest-contrast body text. |
| `--color-text-muted` | `#5B5D80` | Desaturated indigo for secondary text; still clears AA on both `bg` and `surface`. |
| `--color-primary` | `#5F62A4` | Brand periwinkle; primary actions, brand accents. |
| `--color-on-primary` | `#FBF3D2` | Text/icons placed on a `--color-primary` fill. |
| `--color-link` | `#4A4D8F` | Darkened periwinkle so link text clears AA on light backgrounds (`--color-primary` itself does not). |
| `--color-highlight` | `#CFD224` | Brand lime. Reserved for meaningful emphasis only — see rules below. |
| `--color-on-highlight` | `#1F2150` | Text/icons placed on a `--color-highlight` fill. |
| `--color-focus` | `#4A4D8F` | Keyboard-focus ring; same hue as `--color-link` for a consistent "interactive" color. |
| `--color-border` | `#8481A0` | Mid periwinkle-gray, picked to clear the 3:1 non-text minimum against both `bg` and `surface`. |
| `--color-border-subtle` | `#E9E1BE` | Low-contrast divider for non-semantic separation (e.g. inside a list); decorative, not a control boundary. |

### Dark theme

| Token | Value | Why |
|---|---|---|
| `--color-bg` | `#14152E` | Deep indigo (never pure black). |
| `--color-surface` | `#1E2046` | Raised surfaces, one step lighter than `bg`. |
| `--color-text` | `#FBF3D2` | Brand cream; highest-contrast body text on dark surfaces. |
| `--color-text-muted` | `#B9B6A3` | Desaturated cream for secondary text. |
| `--color-primary` | `#9EA1E0` | Lightened periwinkle — the raw brand periwinkle is too dark to use as a fill or accent against a dark background. |
| `--color-on-primary` | `#14152E` | Text/icons on a `--color-primary` fill. |
| `--color-link` | `#9EA1E0` | Same lightened periwinkle as `--color-primary`, reused for link text. |
| `--color-highlight` | `#CFD224` | Same brand lime as light theme — it already has strong contrast on both dark fills and as a fill itself. |
| `--color-on-highlight` | `#14152E` | Text/icons on a `--color-highlight` fill. |
| `--color-focus` | `#CFD224` | Lime focus ring — distinct from `--color-primary`/`--color-link` so focus never gets confused with a regular interactive color in dark mode. |
| `--color-border` | `#6E70A8` | Mid periwinkle, picked to clear the 3:1 non-text minimum against both `bg` and `surface`. |
| `--color-border-subtle` | `#2A2C52` | Low-contrast divider, decorative only. |

### Reserved (not implemented yet)

`--color-gloss-root` and `--color-gloss-suffix` are reserved names for the
future morphosyntactic gloss display (highlighting a word's root vs. its
suffixes). No values or implementation yet — [TO BE DEFINED] in a later
phase, once the gloss UI itself is designed.

## Contrast table

Ratios computed with the standard WCAG 2.1 relative-luminance formula.
"Text" rows need **4.5:1** (AA) or **7:1** (AAA) for normal-size text.
"Non-text" rows (borders, focus rings) need **3:1** (WCAG 1.4.11).

### Light theme

| Pair | Ratio | Level |
|---|---|---|
| `--color-text` on `--color-bg` | 14.42:1 | AAA |
| `--color-text` on `--color-surface` | 13.55:1 | AAA |
| `--color-text-muted` on `--color-bg` | 6.04:1 | AA |
| `--color-text-muted` on `--color-surface` | 5.67:1 | AA |
| `--color-on-primary` on `--color-primary` fill | 5.00:1 | AA |
| `--color-link` on `--color-bg` | 7.30:1 | AAA |
| `--color-on-highlight` on `--color-highlight` fill | 9.27:1 | AAA |
| `--color-highlight` as text on `--color-bg` | 1.56:1 | **Fails** — confirms the rule below |
| `--color-border` vs `--color-bg` (non-text) | 3.56:1 | Pass |
| `--color-border` vs `--color-surface` (non-text) | 3.35:1 | Pass |
| `--color-focus` vs `--color-bg` (non-text) | 7.30:1 | Pass |

### Dark theme

| Pair | Ratio | Level |
|---|---|---|
| `--color-text` on `--color-bg` | 16.03:1 | AAA |
| `--color-text` on `--color-surface` | 13.97:1 | AAA |
| `--color-text-muted` on `--color-bg` | 8.74:1 | AAA |
| `--color-text-muted` on `--color-surface` | 7.61:1 | AAA |
| `--color-on-primary` on `--color-primary` fill | 7.34:1 | AAA |
| `--color-link` on `--color-bg` | 7.34:1 | AAA |
| `--color-link` on `--color-surface` | 6.40:1 | AA |
| `--color-on-highlight` on `--color-highlight` fill | 10.97:1 | AAA |
| `--color-border` vs `--color-bg` (non-text) | 3.86:1 | Pass |
| `--color-border` vs `--color-surface` (non-text) | 3.36:1 | Pass |
| `--color-focus` vs `--color-bg` (non-text) | 10.97:1 | Pass |

## Usage rules

- **Lime is never text color on the light theme** — `1.56:1` against
  `--color-bg`, far below AA. It's a highlight *fill* only
  (`--color-highlight` + `--color-on-highlight` on top).
- **Lime is used sparingly and only with meaning**: highlighting a morpheme,
  marking focus/active state. Never as decoration.
- **No pure black (`#000`) or pure white (`#fff`)** — always use a token.
- Don't rely on color alone to convey state (pair with an icon, underline,
  label, or `aria-*` attribute, per the usage of each component).
- Keep a visible keyboard focus indicator everywhere — see "Theme system"
  below for the global `:focus-visible` rule.

## Theme system

- Tokens live in one file: `styles/tokens.css`. `:root` is the light theme
  (default regardless of OS preference); `[data-theme="dark"]` is the dark
  theme. There is no `prefers-color-scheme` media query — the default is
  always light until the user (or a future setting) changes it.
- `data-theme` is set on `<html>` (`app/layout.tsx` renders `suppressHydrationWarning`
  on it, since the theme is applied by a script before React hydrates).
- A minimal inline script in `<head>` (`ThemeScript`, in
  `lib/theme/theme-script.tsx`) runs before first paint, reads
  `localStorage["paqocha-theme"]` (`"light" | "dark"`), defaults to
  `"light"` if unset or invalid, and sets `data-theme` — this avoids a flash
  of the wrong theme. It's wrapped in `try/catch` since `localStorage` can
  throw (e.g. blocked storage).
- `ThemeProvider` (`lib/theme/theme-provider.tsx`, client component) exposes
  the current theme and a setter/toggle via the `useTheme()` hook. It
  persists the choice to `localStorage` and updates `data-theme` on
  `<html>`.
- `ThemeToggle` (`lib/theme/theme-toggle.tsx`) is a minimal, accessible
  button for manually verifying the system (`aria-pressed`, clear label
  text). It will be redesigned once real UI components are defined.
- No theme-change transition for now.
- Tailwind v4 picks up the tokens via an `@theme inline` block in
  `app/globals.css` that maps Tailwind's color namespace to the same CSS
  variables — so the values stay runtime-switchable instead of being baked
  in at build time.

## Known build constraint: CSS Modules don't scope

`next.config.ts`'s `turbopack.rules["*.css"]` routes **every** `.css` file
(not just `app/globals.css`) through the `@tailwindcss/turbopack` loader.
That loader doesn't apply CSS-Modules scoping, so a `*.module.css` file
compiles with its class names **unhashed** (e.g. `.video` instead of
`.video_a1b2c3`) — the import still resolves and `styles.video` is a string,
but the rule frequently doesn't win against Tailwind's preflight (e.g.
`video { max-width: 100%; height: auto }`), since nothing about it is
actually scoped or specificity-boosted anymore.

**Until this Turbopack rule is scoped to only `app/globals.css` (or dropped
in favor of `@import` inside it), don't use `*.module.css` for component
styles.** Use inline `style={{ ... }}` (reading tokens via
`var(--color-x)`, as `Hero` does) or a plain global stylesheet class.
Revisit this once a real component-styling approach is picked — see
"Components" below.

## Typography

[TO BE DEFINED] — no typeface decision yet. The `next/font` Geist
setup from `create-next-app` is left untouched; do not add new fonts until
this is decided.

## Spacing

[TO BE DEFINED]

## Motion

[TO BE DEFINED]

## Components

### Hero (`components/hero/hero.tsx`)

Full-viewport background video with the "Listen. Break it down.
Understand." tagline (see `docs/project-context.md`) laid over it as three
independently positioned words — modeled on compasspathways.com's hero.
Renders as the entire homepage for now; it's a client component (`"use
client"`) because setting video playback rate requires JS.

**Video**

- `<section>` is `position: fixed; inset: 0;` with `overflow: hidden` — fills
  the viewport exactly and clips whatever the video crops.
- `<video autoPlay muted loop playsInline>` is `position: absolute; inset:
  0; width/height: 100%; max-width: none; object-fit: cover; object-position:
  center;`.
  - `object-fit: cover` scales the video by its own aspect ratio until it
    covers the full box on both axes, cropping only the overflow — so any
    screen size always shows a centered slice of the video, never bars or a
    background color peeking through.
  - `max-width: none` overrides Tailwind's preflight (see the build
    constraint above) — without it, the video can't grow past 100% of the
    viewport's width when a wide/short viewport needs it to, to fully cover
    the height.
  - Styled inline, not with a CSS Module — see the build constraint above.
- Playback rate is set to `0.5` via a `ref` + `useEffect` on mount, and
  reapplied `onLoadedMetadata` — there's no declarative HTML attribute for
  this, it has to be set on the `HTMLVideoElement` imperatively, and some
  browsers reset it once metadata actually finishes loading even if it was
  set right after mount, so it's applied in both places. It survives the
  `loop` automatically (the browser doesn't reset `playbackRate` between
  loop iterations).
- No `prefers-reduced-motion` handling on the video: hiding it would leave
  just `--color-bg` with nothing in it, which the brief explicitly ruled
  out. [TO BE DEFINED] once there's real content to fall back to.

**Tagline words**

- Markup is one real `<h1 aria-label="Listen. Break it down.
  Understand.">` (so screen readers get one clean sentence) containing three
  `aria-hidden="true"` `<span>`s for the visual layout — avoids a
  screen reader running the words together as "ListenBreak it
  downUnderstand".
- Each word is independently `position: absolute` inside the `h1`
  (`top`/`right`/`left`/`bottom` as percentages of the viewport), matching
  the reference site's scattered placement: "Listen" top-right, "Break it
  down" middle-left, "Understand" bottom-center. Percentage-based offsets
  keep each word anchored to the same relative spot across breakpoints,
  exactly as in the reference screenshots.
- Font size uses `clamp(min, vw, max)` per word instead of breakpoints — it
  scales continuously with viewport width (large on desktop, recalculated
  down on mobile) with no layout jump at a fixed breakpoint.
- Color is the `--brand-cream` primitive (see Tokens), not a theme token on
  purpose: this text sits on the video, not the page background, so it must
  stay constant across the light/dark toggle instead of flipping to dark
  indigo in light mode. A soft `text-shadow` using the dark-indigo ink color
  at low opacity (`rgba(31, 33, 80, 0.35)`) keeps it legible over whatever
  part of the video is behind it at a given moment, without adding a visible
  scrim/box.
- Entrance animation (`@keyframes paqocha-hero-word-in`, defined in a plain
  `<style>` tag in the component — not a CSS Module, see the build
  constraint above): each word fades in and slides up
  (`translateY(20px) → 0`, 1100ms, `cubic-bezier(0.22, 1, 0.36, 1)`),
  staggered 180ms apart (`Listen` → `Break it down` → `Understand`).
- Plays on mount, and again after a window resize settles: a debounced
  (`200ms`) `resize` listener bumps a `replayKey` state used as the `<h1>`'s
  React `key`, which remounts the word `<span>`s and restarts their CSS
  animation. Debounced so it replays once after the resize finishes, not on
  every frame while dragging. Positioning/sizing itself stays continuously
  responsive via the percentage/`clamp()` values above regardless of this —
  the replay is purely the extra visual flourish asked for, not what makes
  it responsive.
  `prefers-reduced-motion: reduce` disables the animation itself (words
  render fully visible, no animation), but the resize listener still fires
  harmlessly (just remounts already-visible spans).

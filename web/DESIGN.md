# Paqocha Analyzer — Design Conventions

Living document. This phase covers color tokens and the light/dark theme
system only. Other sections are placeholders.

## Brand colors (source)

- Periwinkle `#5F62A4`
- Cream `#FBF3D2`
- Lime `#CFD224`

These aren't used directly in page-chrome UI; they're refined into the
semantic tokens below so every surface, text, and interactive color has a
defined purpose and a verified contrast ratio. The exceptions are
`--brand-cream`, `--brand-ink`, and `--brand-periwinkle-light`, primitives
(not theme-switching) kept for UI laid over fixed media rather than the page
background — see Tokens below.

## Tokens

All tokens live in `styles/tokens.css`. `:root` defines the light theme
(default); `[data-theme="dark"]` overrides it. Both set `color-scheme` so
native form controls and scrollbars match the active theme.

`--brand-cream` (`#FBF3D2`), `--brand-ink` (`#1F2150`, the same hex as
`--color-text` in the light theme), and `--brand-periwinkle-light` (`#9EA1E0`,
the same hex as `--color-primary` in the dark theme) are declared once in
`:root` and **not** overridden in `[data-theme="dark"]` — they're brand
primitives, not semantic/theme-switching tokens. Use them only for UI that
sits on fixed media (e.g. the hero video's tagline text, the search pill's
dark background and its hover accent) where the color must stay constant
regardless of the site's light/dark theme — see "Theme-independent UI"
under Components. Everything else should use the semantic tokens below.

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

**Nunito** (`app/layout.tsx`, via `next/font/google` — no new dependency,
`next/font` ships with Next.js itself), weights 400/500/600/700/800, CSS
variable `--font-sans`. Replaces `create-next-app`'s default Geist.

Why: Nunito's rounded terminals read as warmer and friendlier than a neutral
grotesque like Geist — a better fit for an approachable learning tool than
Geist's more "SaaS-neutral" look, while staying highly legible at both UI and
body-text sizes.

`body` in `app/globals.css` sets `font-family: var(--font-sans), Arial,
Helvetica, sans-serif` — note this actually *wires up* the font variable for
the first time; the previous Geist setup was loaded but never applied (`body`
hardcoded `Arial, Helvetica, sans-serif` the whole time, a leftover from
`create-next-app` nobody had corrected yet). `Hero`'s tagline and
`SearchBar`'s text don't set their own `font-family` — they inherit this
through normal cascade.

Weight/size scale, line-height, and further pairing (e.g. a distinct display
face for very large hero-type moments) are still [TO BE DEFINED].

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
  (`top`/`right`/`left`/`bottom` as percentages of the viewport) — the
  reference site's scattered-placement pattern, but mirrored left/right from
  it: "Listen" top-**left**, "Break it down" middle-**right**, "Understand"
  bottom-**left**-of-center. (Still the same vertical rhythm — top / middle /
  bottom — only the horizontal side of each word is flipped.) Percentage-based
  offsets keep each word anchored to the same relative spot across
  breakpoints, exactly as in the reference screenshots.
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
  (`translateY(36px) → 0`, 2200ms, `cubic-bezier(0.16, 1, 0.3, 1)`, an
  ease-out-expo-style curve), staggered 280ms apart (`Listen` → `Break it
  down` → `Understand`). Also starts `filter: blur(16px)` and resolves to
  `blur(0px)` over the same animation, so each word comes into focus as it
  rises instead of popping in sharp.
- Plays on mount, and again after a window resize settles: a debounced
  (`450ms`) `resize` listener bumps a `replayKey` state used as the `<h1>`'s
  React `key`, which remounts the word `<span>`s and restarts their CSS
  animation. It only replays if `innerWidth`/`innerHeight` actually moved by
  more than `24px` since the last firing — otherwise a continuous drag of
  the window edge (each pause past 450ms counting as "settled") or a mobile
  browser's address bar hiding/showing would retrigger the fade-in
  repeatedly, which read as "flickery" rather than "smooth" in practice.
  Positioning/sizing itself stays continuously responsive via the
  percentage/`clamp()` values above regardless of this — the replay is
  purely the extra visual flourish asked for, not what makes it responsive.
  `prefers-reduced-motion: reduce` disables the animation itself (words
  render fully visible, no animation), but the resize listener still fires
  harmlessly (just remounts already-visible spans).

### SearchBar (`components/search/search-bar.tsx`)

Top-center search pill, fixed above the hero — modeled on
compasspathways.com's dark expanding navbar pill, but it searches instead of
navigating, and the word inside is Quechua instead of the brand name. A
sibling of `Hero` in `app/page.tsx`, not nested inside it.

- Collapsed: a pill (`border-radius: 999px`, `height: 4.5rem`) showing the
  word **"Maskhay"** (Southern/Cusco-Collao Quechua for "to search") and a
  circular magnifying-glass icon button. **"Maskhay" is a real word, not
  invented, but its spelling hasn't been checked against Puno/Collao-specific
  usage by a Quechua speaker on the team yet — [TO BE DEFINED]/verify before
  this ships for real.**
- Clicking the word swaps it for a real, autofocused `<input>` (same slot,
  same visual spot) with "Maskhay" as its `placeholder`, and the pill widens
  (`width` transitions between two `clamp()` values — collapsed
  `clamp(260px, 55vw, 360px)`, expanded `clamp(380px, 88vw, 620px)` — height
  stays constant, only width "extends", on purpose: simpler and less jumpy
  than also animating height for what's a one-line input). A full-screen
  backdrop (always mounted, `opacity`/`backdrop-filter` transitioned for a
  smooth fade rather than conditionally mounted) blurs **everything** behind
  it — the hero video and tagline words both, since neither is inside this
  component, `backdrop-filter: blur(18px)` on an overlay above them both
  does it without touching Hero at all — tinted with `--brand-ink` at low
  opacity (`rgba(31, 33, 80, 0.35)`), matching the reference screenshot's
  darkened-and-blurred look.
- Closes on `Escape` or a click on the backdrop (outside the pill). There's
  no close button — the magnifying-glass icon intentionally does nothing
  (see below), so it isn't overloaded as a close control too.
- The magnifying-glass button is **decorative only, on purpose**: on hover it
  shows a soft `--brand-periwinkle-light` circle behind the icon
  (`rgba(158, 161, 224, 0.25)`, icon itself also turns that lighter
  periwinkle), a stronger `0.38` + `scale(0.92)` on `:active` — but has no
  `onClick` handler, so no search request, no navigation. Matches the brief:
  pressing search shouldn't do anything yet. (Originally lime — switched to
  a lighter periwinkle on request, since lime reads as a strong semantic
  "active/focus" signal per the Usage rules, not a plain hover affordance.)
  - **Bug fixed:** this circle originally never appeared, because the
    button's *base* `background: "transparent"` was set as an inline style.
    An inline style always outranks a stylesheet rule regardless of
    specificity or `:hover`/`:active`, so the `<style>` tag's hover/active
    backgrounds could never win. The fix, applied here and to the pill's
    `box-shadow` below (same bug): move anything a `:hover`/`:active` rule
    needs to *override* into the stylesheet as the element's own base style,
    and keep only genuinely static values (layout, one-time colors) inline.
- Pill background is `--brand-ink`, text/icon color `--brand-cream`; icon
  hover/press accent is `--brand-periwinkle-light` — same "theme-independent"
  reasoning as the hero tagline (see Tokens): this floats over the video,
  not the page background, so none of it should flip with the light/dark
  toggle.
- **No focus indicator at all on this component, by explicit request.** An
  earlier lime `box-shadow` ring around the whole pill (`:focus-within`) was
  tried and removed; after removing it, the page's global `:focus-visible`
  rule (`app/globals.css`) took over by default and drew its own outline —
  which, being a plain `outline` on the bare `<input>`'s own square box (no
  `border-radius` of its own), rendered as the exact same sharp rectangle
  poking out of the pill, just lime-colored this time (`--color-focus` is
  lime in the dark theme). That outline is now explicitly suppressed
  (`:focus-visible { outline: none; }`) on the input and both buttons.
  **[TO BE DEFINED] / accessibility gap:** this component currently gives
  keyboard users no visible indication of which control has focus. Revisit
  with a deliberate design (not another quick override) once the rest of
  the component's interaction design is settled.
- Icon is a hand-drawn inline SVG magnifying glass
  (`components/search/search-icon.tsx`), not an icon library — keeping the
  "no new dependencies" constraint from the theme-system phase.
- Styled inline / with a scoped `<style>` tag — see "Known build
  constraint" above.

### Theme-independent UI

Both `Hero` and `SearchBar` deliberately opt out of the light/dark theme
system (`--brand-cream` / `--brand-ink` instead of `--color-text` /
`--color-surface`) because they sit on top of the fixed hero video, not the
page's `--color-bg`/`--color-surface` chrome. Reach for the semantic,
theme-switching tokens for anything that sits on the page background; reach
for the `--brand-*` primitives only for UI that sits on the video.

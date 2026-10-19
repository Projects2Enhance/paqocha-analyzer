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
native form controls match the active theme. Scrollbars used to ride along
with that (`color-scheme` alone re-colors the OS-default scrollbar) but are
now repainted by the `.paqocha-scroll` class instead — see "Custom
scrollbars" under Components.

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

### Morphosyntactic gloss colors

`--color-gloss-root` and `--color-gloss-suffix` (used by `WordAnalysis`,
under KaraokePlayer below) highlight a word's root vs. its suffixes. Rather
than new hex values, each is a dedicated token carrying the **same** hex as
an existing one — `--color-gloss-root` = `--color-primary`,
`--color-gloss-suffix` = `--color-highlight`, in both themes — so gloss
colors can be retuned independently later without touching those tokens'
other semantics, while reusing their already-verified contrast pairing today
(`--color-on-primary` on a root fill, `--color-on-highlight` on a suffix
fill — see the Contrast table above; no new ratios to verify).

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
  - **Bug fixed — hydration error.** `theme` used to come from a lazy
    `useState` initializer that read `data-theme` off `document` on first
    client render. That's a real client/server divergence whenever the
    stored theme was `"dark"`: the server (no `document`) always renders as
    if `"light"`, so any descendant that branches its *rendered output* on
    `theme` produced a server/client mismatch React's hydration diffing
    caught (visible as a "Recoverable Error" in the dev overlay, surfaced
    the first time anything actually consumed `theme` this way). **Fix:**
    `theme` now comes from `useSyncExternalStore` (`subscribe` on an
    internal listener set `setTheme` notifies, `getSnapshot` =
    `readActiveTheme()`, `getServerSnapshot` = always `"light"`) — the
    React-sanctioned API for exactly this "value SSR can't see" case, which
    renders the server-safe value first and re-renders with the real one
    right after hydration with **no mismatch warning**, unlike `useState` +
    a mount `useEffect` doing the same sync (which also separately trips
    `react-hooks/set-state-in-effect`). `toggleTheme` reads
    `readActiveTheme()` directly instead of closing over `theme`, so it
    never toggles off a stale snapshot either.
  - **Bug fixed — a visible flash on every navigation.** `useSyncExternalStore`
    fixed the *error*, but it necessarily renders the server-safe `"light"`
    value first and corrects to the real one only after hydration — fine
    for CSS-driven theming (already right at first paint, from the
    `data-theme` attribute directly), but `ThemeToggle` used `theme` from
    this hook to pick *which icon to render in JSX*, so the wrong icon
    genuinely painted first and was swapped a beat later — worse once every
    page visit became a full reload (see KaraokePlayer below), since this
    then happened on every single visit instead of once per SPA session.
    Consuming `theme` for a one-level CSS class/attribute wouldn't have hit
    this; branching actual child *content* on it does, no matter how
    correctly the state itself is synced. **Fix:** described under
    `ThemeToggle` below — the component no longer branches on `theme` in
    JSX at all.
- `ThemeToggle` (`lib/theme/theme-toggle.tsx`): icon-only, a plain button
  with no self-positioning — it's a filled circle, caller decides where it
  goes and what fills it. Shows a moon while light (click to go dark) or a
  sun while dark (click to go light) — the icon for the theme a click
  switches *to*, the common convention. **Lives in `KaraokePlayer`'s header
  now** (`components/player/karaoke-player.tsx`'s `PageShell`, top-right of
  the same row as the back button — see KaraokePlayer below), not on the
  home page; it used to be fixed top-right over the hero video there, with
  a `--brand-ink` fill to match SearchBar's pill (`--color-primary` read as
  too pale in the dark theme against the bright video). On `KaraokePlayer`
  — a normal themed page, no video — it instead takes `--color-primary`/
  `--color-on-primary`, the same fill as that page's back/play buttons, as
  plain props/classes from its caller rather than a baked-in color.
  - **Both icons are always rendered**; a `[data-theme="dark"]` CSS rule
    decides which one is `display`ed, not a React branch on `theme`. This
    is what actually fixes the flash above: `data-theme` is set on `<html>`
    synchronously before first paint (`ThemeScript`), so the right icon is
    showing in the very first paint purely from CSS, with no client/server
    `theme` value to reconcile at all for this component. `aria-label` is
    theme-agnostic ("Cambiar tema") for the same reason — nothing left here
    that depends on knowing the theme during render.
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

Full-viewport background video with the "Escucha. Descompón. Entiende."
tagline (see `docs/project-context.md`) laid over it as three independently
positioned words — modeled on compasspathways.com's hero. Renders as the
entire homepage for now; it's a client component (`"use client"`) because
setting video playback rate requires JS. **Originally rendered the
tagline's English translation** ("Listen. Break it down. Understand.") —
the UI as a whole later switched to Spanish (see `docs/project-context.md`'s
"Language note"), at which point this became the one place still carrying
the stand-in English text instead of the actual Spanish tagline
`project-context.md` had specified from the start.

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
- **Bug fixed — paused on first load on iOS (Safari, Chrome, Brave — all
  WebKit there), showing a native play affordance instead of looping.**
  React never writes a `muted` *attribute* into the server-rendered HTML
  for a `<video>` — confirmed against the actual SSR output, which has
  `autoplay`/`playsinline` but no `muted` — it only sets the `.muted`
  *property* imperatively, after hydration. iOS's autoplay gate checks the
  element's real muted state at the moment the `autoplay` attribute itself
  tries to fire, which happens as the browser parses the tag, before any
  of React's JS has run. An unmuted autoplay request there gets blocked,
  and unlike desktop Chrome, iOS doesn't retry once `.muted` is set a
  moment later by hydration — the video is just left paused. **Fix:** the
  `ref` on `<video>` (`setVideoRef`) is now a callback ref instead of a
  plain `useRef` target — callback refs run synchronously at commit, well
  before a `useEffect` would, and well before the gap above — and it sets
  `defaultMuted`/`muted` as real DOM properties and calls `.play()` itself
  from JS, instead of relying on the declarative `autoplay` attribute at
  all (the `autoPlay`/`muted` JSX props stay too, as a no-JS fallback).
  If `.play()` still rejects — e.g. a shield like Brave's "Block Autoplay"
  blocking it outright regardless of mute state — a one-time
  `touchstart`/`pointerdown` listener on `document` retries it on the
  viewer's first tap, so it never depends on a visible play button to get
  going.
- No `prefers-reduced-motion` handling on the video: hiding it would leave
  just `--color-bg` with nothing in it, which the brief explicitly ruled
  out. [TO BE DEFINED] once there's real content to fall back to.

**Tagline words**

- Markup is one real `<h1 aria-label="Escucha. Descompón. Entiende.">` (so
  screen readers get one clean sentence) containing three
  `aria-hidden="true"` `<span>`s for the visual layout — avoids a
  screen reader running the words together as "EscuchaDescompónEntiende".
- Each word is independently `position: absolute` inside the `h1`
  (`top`/`right`/`left`/`bottom` as percentages of the viewport) — the
  reference site's scattered-placement pattern, but mirrored left/right from
  it: "Escucha" top-**left**, "Descompón" middle-**right**, "Entiende"
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
  ease-out-expo-style curve), staggered 280ms apart (`Escucha` →
  `Descompón` → `Entiende`). Also starts `filter: blur(16px)` and resolves to
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

- Collapsed: a pill (`border-radius: 999px`, `height: 4.5rem`) showing a
  rotating Quechua word and a circular magnifying-glass icon button. The
  word cycles through a fixed list (`QUECHUA_WORDS` in `search-bar.tsx`) —
  **"P'unchaykuna"**, **"Mikhuy"**, **"T'anta"**, **"Wasi"**, **"P'unchay"**.
  Every word holds for `WORD_DISPLAY_MS` (3000ms), then cross-fades to the
  next via a `<span>` that transitions `opacity`/`transform` over
  `WORD_FADE_MS` (350ms) while a `setTimeout` nested inside a `setInterval`
  swaps the underlying word index during that fade's invisible midpoint —
  looping forever, back to the first word after the last. The rotation
  pauses while the pill is open (the effect bails out on `isOpen`) so the
  word doesn't shift under the user while they're focused on typing;
  closing it resumes the loop and force-resets visibility to `true` first,
  in case the pill was reopened mid-fade-out. **Each word is checked
  present in the real generated `search-index.json`, not just
  plausible-looking** — an earlier list ("Maskhay", "Uyariy", "Yachay",
  "Rimay", "Simi", themed around the product's search → listen → learn
  flow) turned out to have three of five words absent from the real
  corpus once real search replaced the single hand-placed example (see
  KaraokePlayer below); hitting search with one of those showing landed on
  `NoResultsState` by coincidence of word choice, which read as the search
  itself being broken. [TO BE DEFINED]/verify the current five against
  Puno/Collao-specific usage by a Quechua speaker before this ships for
  real — being *indexed* confirms they occur in the corpus, not that
  they're spelled/used correctly.
- Clicking the word swaps it for a real, autofocused `<input>` (same slot,
  same visual spot) with the current rotating word as its `placeholder`
  (frozen, since rotation is paused while open), and the pill widens
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
- **Search trigger:** the input is now controlled (`query` state), and
  pressing `Enter` in it or clicking the magnifying-glass icon (now wired,
  no longer purely decorative) calls `handleSearch()`, which navigates to
  `/search?q=<term>` — `term` falls back to whichever rotating word is
  currently showing if the input is empty. See `KaraokePlayer` below for
  what that route renders, and for why this is `window.location.href`, a
  full navigation, rather than `next/link`'s client-side `router.push`.
- **Single word only.** `onChange` runs the typed value through
  `sanitizeSingleWord()` (`value.replace(/\s+/g, "")`) before it ever
  reaches `query` state — strips every whitespace character anywhere in
  the string, not just the ends, so a pasted `"two words"` becomes
  `"twowords"` live as it's typed, not just trimmed. There's no real search
  yet to validate this against, but the product is word lookup, not
  phrase search, so the input shouldn't accept something it was never
  going to honor. `PlayerSearchOverlay` (see KaraokePlayer below) has an
  identical, separately-defined helper of the same name — small enough
  that a shared `utils.ts` for one line felt like more ceremony than the
  duplication it would remove.

### KaraokePlayer (`components/player/`)

The search-results page (`app/search/page.tsx`, route `/search`) — a
YouGlish-style karaoke player: synced transcript on top, classic transport
controls below, a sidebar list of other matching clips. Still no database
or search-backend server — search is real against the real corpus, but
entirely over static files generated offline from the raw dataset. See
`../data/README.md` for the generation pipeline (TSV + a colleague's
`inverted_index.json` + real forced-alignment timestamps -> `public/data/
search-index.json` + one combined `public/data/clips/<audio_id>.json` per
transcribed audio, 1222 of them). `KaraokePlayer` fetches
`search-index.json` once on mount, looks up the normalized query for its
matching `audio_id`s (capped at `MAX_MATCHES`, 24 — see that constant's own
comment for why), and fetches each matched clip's combined JSON. This
replaced an earlier version of this component that always opened the same
one hand-placed example clip regardless of the query — real search over
the full dataset, not a demo of the UI shape.

- **Route/Suspense:** `app/search/page.tsx` is a server component that just
  wraps the client `KaraokePlayer` in `<Suspense>`, because `KaraokePlayer`
  reads `?q=` via `useSearchParams()`, which always needs a Suspense
  boundary (see Next's Cache-Components migration guide — this repo runs
  Next 16 with `cacheComponents: true`). The header's `h1` echoes `q` back
  (`"word"` in quotes, or "Example clip" if absent) purely as context — this
  is the only thing left of the header's original three lines; an earlier
  italic disclaimer paragraph and a "SEARCH" eyebrow label above the title
  were both removed on request, for a cleaner header with just the title
  itself (and now the back/theme buttons above it — see "Back button"/
  `ThemeToggle` under Tokens).
- **Search resolution and matching — two tiers, by design.** `activeQuery`
  is normalized (`normalizeWord()` — lowercase, strip only leading/trailing
  punctuation, so `"hampiqmi,"` and the index key `"hampiqmi"` compare equal
  while internal characters like the hyphen in `"ayllu-ayllunta"` survive —
  this must stay in sync with the identical function in
  `data/scripts/lib/normalize-word.js`, which built the index's keys in the
  first place) and looked up directly in the already-loaded
  `search-index.json` for its matching `audio_id`s (`matchIds`, a `useMemo`
  — a plain in-memory lookup, no fetch at all). Every one of those matches
  renders its sidebar card straight from the also-already-loaded
  `metadata.json` catalog. **Only the one *active* match's full clip —
  real alignment timestamps and the word-by-word morphosyntactic
  breakdown — is ever fetched**, keyed on
  `activeId` (`matchIds[activeMatchIndex]`); switching matches changes
  `activeId` and triggers that fetch for the newly selected one, not
  before. The audio itself is never fetched by the app at all — the
  `<audio src>` points straight at the CDN (`AUDIOS_BASE_PATH`, see
  `../data/README.md` -> "Audio hosting"), which the browser streams
  directly and needs no CORS headers for (a plain media `src`, not a
  `fetch()`). **This replaced an earlier version that fetched every matched
  clip's full combined JSON up front** (metadata *and* alignment *and*
  analysis, for every card in the list, not just the one being played) —
  functionally fine for a handful of matches, but a common grammatical word
  with 200+ real occurrences (see `MAX_MATCHES`'s own comment) would have
  downloaded 24 clips' worth of alignment/analysis data to show a list that
  only ever plays one of them at a time. `resolvedClip` bundles `{ id,
  clip }` together — checking `resolvedClip.id === activeId` (not just
  `resolvedClip !== null`) is what tells "this clip's full data actually
  answers the current selection" apart from "the previous match's full
  data is still sitting here while a new fetch is in flight"; the
  alternative, clearing it synchronously at the top of the fetch effect,
  trips `react-hooks/set-state-in-effect` and would let the *previous*
  clip's `<audio>` keep seeking/playing under the *new* selection for a
  moment. Within whichever clip is active, `findSearchMatches()` highlights
  every occurrence (see the transcript
  bullet below) and `computeInitialSeekTime()` jumps playback to
  `MATCH_LEAD_IN_WORDS` (3) words before the *first* one, applied to the
  `<audio>` element in the event-listener effect — tried immediately and
  reapplied on `"loadedmetadata"`, since setting `currentTime` before the
  browser knows the real `duration` can silently get reset once it loads.
  **Autoplays** on every fresh match or match switch
  (`audio.play().catch(() => {})` right after the initial seek) — landing
  on a lead-in position that then sat paused read as broken, on request.
  The `.catch()` matters: browsers can block autoplay without a preceding
  user gesture (`NotAllowedError`), which would otherwise be an uncaught
  promise rejection; swallowing it just leaves the clip paused at the
  right position instead. In this app's real flow, the gesture that
  submitted the search (a click or Enter in SearchBar) carries over
  through the full-navigation to `/search` and satisfies that requirement
  — confirmed in-browser; autoplay only fails when the page is reached
  with no prior interaction at all, e.g. opening the URL directly. If the
  term occurs in zero transcripts, the whole player body is blocked — see
  "No-results state" below.
- **No-results state** (`no-results-state.tsx`). Once `isReady`, a query
  that resolved to zero matching clips (`matchCount === 0` — see
  "Search resolution" above) replaces the entire two-column body —
  transcript, transport controls, match list/Analysis, and the `<audio>`
  element itself (never mounted, so there's nothing to autoplay) — with a
  single centered message: a muted circular `SearchOffIcon` (the same
  magnifying glass as `SearchIcon`, with an extra diagonal slash through
  the lens), "No se encontraron coincidencias", and a line naming the
  searched term (UI copy in Spanish — see `docs/project-context.md`'s
  "Language note"). The
  header (back button, in-player search, `ThemeToggle`) stays live
  throughout, so trying another word doesn't need a full round trip back
  to "/". An **empty** query (direct navigation to `/search` with no
  `?q=`) now counts as a no-results search too — with real, per-query data
  there's no fallback "example" clip left to fall through to the way there
  used to be back when every search opened the same hand-placed clip.
  Wiring this up to the real dataset is also what surfaced that
  `SearchBar`'s own rotating demo words weren't all guaranteed to exist in
  the real corpus — see "Each word is checked present..." under SearchBar
  above for that fix.
- **Real loading state + skeleton UI, no artificial delay.** `isReady =
  matchIds !== null && metadataCatalog !== null && (matchCount === 0 ||
  activeClip !== null)` in `karaoke-player.tsx` gates every section of real
  content on data that has *actually* arrived — nothing is held back
  longer than the real fetches take. **This replaced an earlier
  `SIMULATED_SEARCH_DELAY_MS` (3000ms) that force-held every search in a
  loading state for a fixed 3 seconds regardless of how fast the local
  fetches resolved**, on request, specifically to preview how the loading
  UI itself should feel before there was real data or a real fetch worth
  waiting for. Once search became real multi-clip lookups and the per-match
  fetch split described above, an artificial floor on top of that would
  have meant waiting even when the real work was already done — removed
  outright rather than tuned down, since "as long as the real request
  takes, however long that is" was the explicit replacement, not a shorter
  fixed number.
  - **The whole page shell renders immediately** — header, title,
    `ViewSwitch`, `AudioPlayerControls` — only the sections whose content
    actually depends on the fetched data swap to a skeleton
    (`loading-skeletons.tsx`): the transcript (`TranscriptSkeleton`, word-
    shaped blocks grouped into two paragraph-shaped clusters, a rough
    approximation of this example's actual shape, not a literal
    placeholder for its real word count), the matches list (exactly one
    `MatchCardSkeleton` — the list doesn't know yet how many real matches
    there will be, so it doesn't pretend to), and the Analysis tab
    (`WordAnalysisSkeleton`, chip-row-shaped blocks + three detail-row-
    shaped blocks). `AudioPlayerControls` itself needed no skeleton
    variant: `duration` simply isn't set from `metadata` until the real
    `<audio>` element reports it (see below), so it already reads "0:00"
    during this whole phase for free, from its ordinary initial state.
  - **The pulse is a slow, gentle opacity breathe** (`--color-border-subtle`
    blocks, `opacity: 0.55 -> 1 -> 0.55` over 1.6s, `ease-in-out`,
    infinite) — not a hard blink, matching the "soft, minimal" brief;
    respects `prefers-reduced-motion`.
  - **`<audio>` itself doesn't mount until `isReady`.** It used to mount as
    soon as `metadata` arrived, to let the browser start buffering during
    the wait — but that would leave a fully wired, clickable
    `AudioPlayerControls` sitting over a skeleton transcript with a real
    `<audio>` element already behind it: pressing play during the
    simulated delay would have started real, audible playback while the
    page still looked like it was loading. Waiting for `isReady` closes
    that off entirely (no `<audio>` element, so `handleTogglePlay`'s
    `if (!audio) return` is always true) at the cost of a real, independent
    buffering delay right when the content reveals — negligible for a
    33-second local file.
  - **The reveal itself is one more animation, not a hard swap.**
    Real content fades up (`paqocha-reveal-in`, `opacity`+`translateY`,
    420ms) the moment it first mounts — which is exactly the reveal
    moment, since each piece (`KaraokeTranscript`, the matches list,
    `WordAnalysis`) only ever mounts once `isReady` is true. No separate
    crossfade state is needed: the skeleton unmounts and the real content
    mounts in the same render, and the mounting content's own entrance
    animation is what reads as the transition.
  - **Bug fixed — UI froze while audio kept playing.** A direct
    consequence of making `<audio>` wait for `isReady` above: the
    event-listener effect (the one that attaches `"timeupdate"`,
    seeks to the lead-in position, autoplays, etc.) depended on
    `[metadata, alignment, query]`, none of which change again once data
    first loads — so it ran exactly once, at the moment `metadata`/
    `alignment` settle, which is *before* `isReady` (and therefore
    `<audio>`) exists. `audioRef.current` was still `null`, the effect's
    `if (!audio || !alignment) return` fired, and no listeners were ever
    attached — not then, and not later either, since nothing in its
    dependency list changes when `<audio>` finally mounts a few seconds
    after. The transport buttons still worked (`handleTogglePlay` calls
    `audioRef.current.play()` directly, no effect involved), so audio
    audibly played — just with `currentTime` never updating, so the
    transcript highlight, seek bar, and Analysis tab all sat frozen.
    **Fix:** added a dependency that still changes once `<audio>` actually
    mounts, so the effect re-evaluates and attaches the listeners for real
    at that point — `minLoadingElapsed` at the time (the skeleton phase's
    now-removed artificial-delay flag, see "Real loading state" below);
    today that role is filled by `activeClip` itself, which only becomes
    non-null once the active match's clip has actually loaded.
  - **Bug fixed (for real this time) — same symptom reported again,
    iPhone-only but across Safari, Chrome, *and* Brave there (so not one
    rendering engine specifically).** Landing on `/search` from a Home
    search left playback paused (iOS doesn't carry the tap's user-gesture
    token across the full-navigation to `/search`, unlike what was
    observed on desktop Chrome — see "autoplay only fails when the page is
    reached with no prior interaction at all" above, which turns out not
    to generalize to iOS); tapping the transport's own play button *did*
    start audible playback (a real, synchronous click handler, so iOS
    allows it) — but after that, the transcript highlight, seek bar, and
    play/pause icon never moved again, no matter how long it played:
    "pierdo el control". An intermediate attempt reordered this effect so
    `addEventListener` for `timeupdate`/`play`/`pause`/`ended` ran
    *before* the initial seek/`play()` call, on the theory that something
    in the seek/play sequence was throwing and skipping the
    `addEventListener` lines after it — that didn't fix it, which rules
    that theory out: whatever's actually happening on that device, those
    three events themselves just never fire, regardless of when they're
    attached. **Fix:** stopped depending on `timeupdate`/`play`/`pause`
    entirely. A `setInterval` (100ms) reads `audio.currentTime` and
    `audio.paused`/`audio.ended` directly off the real `HTMLAudioElement`
    instead and mirrors them into `currentTime`/`isPlaying` state every
    tick — this needs nothing to have fired correctly first, so it can't
    be broken by whatever made those three events unreliable on that
    device; the UI can never drift more than one tick (100ms) from actual
    playback. `loadedmetadata` is kept as a real listener (it only needs
    to fire once, to pick up `duration` and reapply the lead-in seek, not
    continuously), and `ended` no longer needs its own listener — the
    poll's `!audio.paused && !audio.ended` already covers it, which also
    removes the old reliance on "`ended` doesn't reliably also fire
    `pause`" needing its own workaround.
- **Bugs fixed — stale state surviving navigation, both directions.**
  Clicking the back button used to leave the clip audibly playing on `/`;
  separately, a typed-but-unsent SearchBar query (or an open pill) could
  still be showing after a round trip to `/search` and back, and
  revisiting `/search` could land on whatever tab/playback position the
  *previous* visit left `KaraokePlayer` in. Root cause for all three: Next's
  client-side navigation (`next/link`, `router.push`) doesn't reliably
  unmount/remount components across a route change here — in practice
  (confirmed in-browser) a previous route's `<audio>` node could stay
  `isConnected` and its React state alive after navigating away, consistent
  with this app's instant-navigation/router-cache setup (`cacheComponents` +
  `partialPrefetching` in `next.config.ts`).
  **Fix:** both directions — `SearchBar`'s `handleSearch()` and
  `KaraokePlayer`'s back button — now use a real full-page navigation
  (`window.location.href` / a plain `<a href="/">`, not `<Link>`/
  `router.push`) instead of trying to out-think the router cache's edge
  cases. A full navigation guarantees every visit to either route starts
  from a genuinely fresh module/component instantiation — no leftover
  `isPlaying`, `currentTime`, selected tab, or pill state is even possible,
  by construction, not by remembering to reset each one by hand. This is a
  deliberate trade of the SPA's instant-transition feel for correctness
  between exactly these two routes; each `<a>`/`window.location.href` use
  carries an `eslint-disable-next-line` for the Next.js rule that otherwise
  pushes back toward `<Link>`, with a comment explaining why. The earlier,
  narrower fix — the event-listener effect's cleanup in `karaoke-player.tsx`
  explicitly calling `audio.pause()` on the `audio` constant it captures at
  effect-setup time, not a fresh `audioRef.current` read (which
  `react-hooks/exhaustive-deps` correctly flags as unreliable) — is kept as
  defense-in-depth, but the full-navigation change is what actually
  guarantees the clean-slate behavior requested, for the player and for
  SearchBar alike.
- **Layout:** viewport-locked (`position: fixed; inset: 0`), same pattern as
  `Hero` — no page-level scroll; the transcript and the matches/analysis
  panel each scroll independently inside their own area. `flex-col`
  (stacked, transcript+player above, sidebar below, capped at
  `max-h-[38vh]`) below the `lg` breakpoint, `lg:flex-row` (transcript+player
  left, sidebar fixed at `320px` right, full height) at/above it — satisfies
  "matches to the right on desktop, below on small screens" directly via
  Tailwind responsive classes, no JS breakpoint logic. Content is capped at
  `max-w-[1240px]` and centered, rather than stretched edge-to-edge, since
  this one short (33s) example otherwise reads as mostly empty space.
- **No borders or shadows anywhere in this component tree, by explicit
  request.** `match-card.tsx` and `audio-player-controls.tsx` originally had
  a `1px solid --color-border-subtle` outline (and the active match card had
  a `--color-primary` border + `box-shadow` ring) — both read as generic
  "card UI" rather than intentional design, so both are gone. Separation
  between panels and the page background now comes from flat background
  color alone (`--color-surface` vs. `--color-bg`); the active match card's
  "selected" state is a tinted fill (`color-mix(in srgb, var(--color-primary)
  14%, var(--color-surface))`) instead of a ring. Hover/pressed feedback
  (e.g. the karaoke word hover, the transport buttons) still uses a flat
  background-color change — that's a fill, not a border, so it stays.
- **Back button:** a circular icon-only button (just `BackArrowIcon`,
  `aria-label="Volver al inicio"`) replacing an earlier text+icon "← Home"
  link — on request, to read as a plain nav control rather than a labeled
  link.
  Filled `--color-primary`/`--color-on-primary`, matching the play button's
  circle exactly (same colors, `filter: brightness(1.08)` hover, `scale(0.94)`
  press) — an earlier version only showed a background on `:hover`, i.e. no
  visible circle at rest, which read as "just an arrow" until moused over,
  and that hover fill used `--color-border-subtle` rather than a button
  color, hence "a weird color" at the wrong moment. A plain `<a>` (see the
  bug fix above), not `next/link`'s `<Link>`. Its hover/press rules now live
  under a shared `.paqocha-icon-button` class in `PageShell`'s stylesheet
  (was `.paqocha-back-link`) — the new search trigger button below is
  visually identical (same fill, same feedback), so one class covers both
  instead of defining the same four rules twice. `ThemeToggle` keeps its own
  equivalent class in its own file rather than importing this one, on
  purpose — it's meant to stay a self-contained, drop-in-anywhere component,
  not coupled to a class name defined in its caller.
- **In-player search** (`player-search-overlay.tsx`): a second, smaller
  entry point into the same search flow as SearchBar on the home page,
  for searching again without first going back to "/". A magnifying-glass
  button — `SearchIcon`, the same component SearchBar uses, in a circle
  styled identically to the back/theme buttons (`.paqocha-icon-button`,
  `--color-primary`) — sits to the left of `ThemeToggle` in the header;
  clicking it opens `PlayerSearchOverlay`: the same backdrop-blur +
  centered expanding-pill interaction as SearchBar, deliberately *not* a
  literal reuse of that component (see the file's own doc comment for why
  — different colors, different sizing, no rotating placeholder word, no
  collapsed-pill state), built fresh with the page's semantic tokens
  (`--color-surface`/`--color-text`) instead of SearchBar's theme-
  independent `--brand-*` ones, since this page has no video underneath.
  Same single-word sanitization as SearchBar (see its own bullet above).
  - **Submitting does *not* navigate anywhere, let alone reload** — the one
    deliberate exception to "every Home<->player transition is a full
    page load" elsewhere in this doc. That rule exists to dodge Next's
    router-cache state leaking *across routes*; searching again here never
    leaves `/search` at all, so there's no route boundary for the cache to
    leak across. `handleInPageSearch()` in `karaoke-player.tsx` instead: 1)
    updates `activeQuery` (plain `useState`, not derived live from
    `useSearchParams()` after the initial render) — `matchIds` recomputes
    against the already-loaded search index synchronously, and the new
    `activeId` this produces triggers the clip-fetch effect for real (see
    "Search resolution and matching" above — this *does* fetch, unlike the
    search index/metadata catalog, which never need refetching since
    neither depends on the query); 2) calls `window.history.replaceState(...)`
    directly — not `router.push` or `<Link>`, so Next's router is never
    asked to do anything — purely to keep the address bar honest. The
    overlay closing (without submitting) is its own `isOpen` prop flipping
    back to `false` via `closeSearchOverlay()` — see "Bug fixed — playback
    kept running under the search overlay" below.
  - **Bug fixed — playback kept running under the search overlay.**
    Opening this overlay used to leave the clip audibly playing (and its
    transcript highlight still advancing) behind the blur, on request
    fixed to stop everything — audio and the highlight it drives — while
    searching, then pick back up exactly where it left off if the overlay
    is dismissed without submitting a new search. **Fix:** `openSearchOverlay()`
    records whether the `<audio>` element was actually playing
    (`wasPlayingBeforeSearchRef`, a ref rather than state — this is a
    one-shot fact read back once on close, never rendered, so it doesn't
    need to trigger a re-render) and pauses it before opening the overlay;
    `closeSearchOverlay()` resumes playback only if that ref says it was
    playing. Both are wired to `PageShell`'s `onOpenSearch` and
    `PlayerSearchOverlay`'s `onClose` instead of the plain `setIsSearchOpen`
    calls those used to be — `handleInPageSearch()` (an actual submission)
    deliberately keeps calling `setIsSearchOpen(false)` directly, not
    `closeSearchOverlay()`, since a submitted search already autoplays
    whatever clip it resolves to on its own (see "Search resolution and
    matching" above) and doesn't need this resume logic layered on top.
    No separate "animation" pause was needed: the transcript highlight and
    seek bar are both driven by `currentTime`, which only advances while
    the `<audio>` element is actually playing, so pausing *it* is what
    pauses *them* too.
- **Play icon — size and rounding.** The transport play button's icon was
  small relative to its circle (`size={24}` in a `3.5rem` button); bumped to
  `size={28}`. Its corners are now also subtly rounded: each sharp vertex of
  the Material `play_arrow` triangle (see the Icons bullet below for why
  that path specifically) is cut by a quadratic Bezier curve (control point
  = that vertex), rather than a sharp point — `player-icons.tsx` has the
  exact coordinates and the reasoning for the specific radius per corner
  (smaller at the tip, which is more acute). Both `AudioPlayerControls`'
  play button and `MatchCard`'s
  small list-item play icon share the same `PlayIcon` component, so the
  rounding applies to both automatically; only the transport button's size
  changed.
- **Seek bar border, fixed properly.** The native `<input type="range">`
  kept a visible groove/border around its track even after an explicit
  `border: none` (on the input and on every vendor track/thumb
  pseudo-element) — because that groove is the OS/browser's *native widget
  rendering* for a range input, not an actual CSS `border` property
  `accentColor` or `border: none` can touch. **Fix:** `appearance: none` /
  `-webkit-appearance: none` on the input drops that native rendering
  entirely, so the track and thumb are rebuilt by hand in
  `audio-player-controls.tsx`'s stylesheet — flat `--color-border-subtle`
  track, `--color-primary` thumb, no border on anything. The "filled"
  portion left of the thumb no longer comes from `accentColor` (which does
  nothing once `appearance` is `none` — this is why the first fix attempt,
  which kept `accentColor` and only tried to zero out borders, couldn't
  actually work) but from a two-stop `linear-gradient` computed in JS from
  `currentTime / duration` and set as the input's own inline `background`,
  shown through `::-webkit-slider-runnable-track`'s now-transparent
  background. Firefox doesn't need the gradient trick — `::-moz-range-progress`
  draws its own fill natively — so that rule is there too, redundantly
  harmless alongside the gradient.
- **Karaoke transcript** (`karaoke-transcript.tsx`): renders
  `alignment.segments[].words[]` as clickable word spans. The active word
  (last word whose `start` has passed `audio.currentTime`, held through any
  inter-word silence gap until the next word's `start`) gets
  `--color-highlight`/`--color-on-highlight` — this is exactly the "lime
  marks focus/active state" usage rule from Tokens, not decoration. Already-
  played words fade to `--color-text-muted`; upcoming words stay full
  `--color-text` (not grayed out, to stay legible). Clicking any word seeks
  the audio there — a deliberate YouGlish-like "jump to this word"
  affordance, not just a progress display — **without changing play state**:
  `onWordClick` calls `seekTo(time)` with no `autoplay` argument, so a
  paused player stays paused at the new position and a playing one just
  continues from there. An earlier version always force-played on click
  (`seekTo(time, true)`), which meant clicking a word while paused silently
  resumed playback — surprising, and specifically not wanted: pausing
  should stay a deliberate, sticky state until the user presses play again,
  not something a transcript click can undo as a side effect. (Jumping
  straight to a search match still autoplays — that's `selectMatch()` in
  `karaoke-player.tsx`, a different, explicit "go listen to this" action,
  not a transcript click.) The active word also auto-scrolls into view
  (`scrollIntoView({block: "nearest"})`).
  - **Search matches get their own, separate highlight.** Every word index
    in `matchWordIndices` (from "Search matching against this transcript"
    above) gets a persistent `color-mix(in srgb, var(--color-primary) 18%,
    transparent)` tint, `:not(.is-active)` — deliberately *not* another use
    of lime, since lime here already means "playing right now specifically"
    and reusing it for "this word matches the search, independent of
    playback position" would blur two different meanings into one color.
    When the currently-active word is also a search match, lime still wins
    (the `:not(.is-active)` guard), so "what's playing now" never stops
    being the most prominent signal.
  - **Known inline-style bug, fixed here too:** the active/past/match
    colors are applied via CSS classes (`.is-active`/`.is-past`/`.is-match`,
    combinable), not inline `style`, specifically so the `:hover` rule in
    the same stylesheet can still win — see SearchBar's identical fix
    above. Setting these conditionally in `style={{ background: ... }}`
    would silently defeat `:hover` again.
  - **Bug fixed — clicking a word activated the *previous* one.** Reported
    against a real clip: clicking "kan," (immediately after "nuqapaq," no
    gap to speak of) highlighted "nuqapaq" instead — reproducible, not a
    punctuation issue as it first looked. Confirmed in-browser: "kan,"'s
    recorded `start` is `8.264`, but seeking `audio.currentTime` to exactly
    that value and reading it back immediately gave `8.263999` — a
    browser/media seek-precision artifact, not anything this app computed
    wrong. `findActiveWordIndex()`'s plain `word.start <= time` then failed
    by a fraction of a millisecond right at the moment of the click, so the
    word seeked-to was never counted as "reached," and the previous word
    stayed active. **Fix:** `ACTIVE_WORD_EPSILON_S` (0.02s) added to the
    comparison (`word.start <= time + ACTIVE_WORD_EPSILON_S`) — comfortably
    larger than the sub-millisecond drift actually observed, comfortably
    smaller than any real inter-word gap in the dataset (tens to hundreds
    of ms), so it absorbs the seek imprecision without ever making the
    *next* word activate early. Affects every path that sets
    `audio.currentTime` directly (word clicks, the match-lead-in seek,
    the seek bar), not just this one report — the same imprecision could
    otherwise surface anywhere a word's own exact `start` is seeked to.
- **Transport controls** (`audio-player-controls.tsx`): play/pause, a seek
  bar (see "Seek bar border" above for how it's built), and previous/
  next-match buttons. Previous/next navigate the *matches list* (different
  clips), not words/segments within one clip — matching the brief's
  "pausar, siguiente audio, anterior audio". No "Match N / M" text under
  the controls anymore (removed on request, for a cleaner control row) —
  the active card's own highlight in the sidebar list is the only
  indicator of position now.
- **Analysis / List switch** (`view-switch.tsx`): a flat segmented control
  (two pill buttons, active one filled `--color-primary`) replacing what was
  a static "Matches (N)" heading — toggles the sidebar between a
  morphosyntactic word-breakdown demo and the matches list. No count label
  anymore; the list itself shows how many there are. **Analysis is first
  (left) and is the default tab on open** — on request, switched from the
  original Lista-first/Lista-default order; `view-switch.tsx`'s `OPTIONS`
  array controls the order (`ViewSwitch` just renders it in order, so this
  is the only place that needs to change to reorder the tabs again) and
  `karaoke-player.tsx`'s `useState<ResultsView>("analysis")` controls the
  default. **Picking a match resets the tab back to Analysis** too —
  `selectMatch()` (used by the list's own cards and by the transport's
  previous/next buttons, see below) calls `setView("analysis")` alongside
  updating `activeMatchIndex`, on request, so choosing a clip from the list
  doesn't leave you sitting on the list you just picked from.
  - **List** (`match-card.tsx`): one card per matching clip — region/accent,
    a 2-line clamped transcript excerpt, speaker age/gender (humanized:
    `"male_masculine"` → `"Hombre"`, `"thirties"` → `"30 años"`), and
    duration.
    The selected card's "selected" state is the tinted-fill background
    described above (not lime — lime is reserved for the karaoke
    active-word state specifically, so a second "selected" meaning doesn't
    dilute it); its play icon swaps for a small pulsing dot while that clip
    is actually playing. `karaoke-player.tsx` renders one real card per
    match id (`matchIds.map(...)`, looked up in `metadataCatalog` — see
    "Search resolution and matching" above — keyed by `audio_id`, stable
    across re-searches, unlike an array index) — `matchCount` is now a
    genuine match count (`matchIds.length`, capped at `MAX_MATCHES`), not
    an earlier placeholder that only ever showed `0` or `1`. The
    transport's previous/next buttons move `activeMatchIndex` between them
    (clamped to `matchCount`, not wrapping); switching clips this way now
    loads a genuinely different audio file (a different `<audio src>`, not
    just a different position in the same one), so `selectMatch()` just
    updates `activeMatchIndex` (and resets the tab to Analysis — see
    "Analysis / List switch" above) and lets the clip-fetch + event-listener
    effects described above take it from there, rather than seeking
    synchronously itself the way it did when every match pointed at the
    same file.
    - **Bug fixed — crash on a real record with no `gender`.** `humanize()`
      assumed its `value` argument was always a string and called
      `.replace()` on it unconditionally; 30 of the 1222 real transcribed
      records have `gender: null` (checked against the generated dataset,
      not assumed), so searching a word that happened to match one of them
      crashed the whole page with `Cannot read properties of null (reading
      'replace')` — a real-data edge case the single hand-placed example
      never had a chance to surface, since every one of its fields was
      always populated. **Fix:** `humanize()` returns `""` for a
      falsy/null `value`; `speakerLine`'s existing `.filter(Boolean)` then
      drops that empty segment on its own, so a card with no gender on
      record just shows age alone instead of crashing. `AudioMetadata.gender`/
      `accents` in `types.ts` are now typed `string | null` to match —
      every field `build-audios.js` writes is nullable in principle (any
      empty TSV cell becomes `null`), but these two are the ones actually
      confirmed null in the real data so far; treat any other field as
      nullable too unless it's been checked the same way.
  - **Analysis** (`word-analysis.tsx`): a graphical morphosyntactic
    breakdown — root and suffixes rendered as flat colored chips (root =
    `--color-gloss-root`/`--color-on-primary`, suffixes =
    `--color-gloss-suffix`/`--color-on-highlight`, finally *using* the
    tokens that Tokens above had reserved since the theme-system phase) —
    **synced to whichever word is currently active in the karaoke
    transcript**, not a single fixed word: `KaraokePlayer` passes it the
    same `activeWordIndex` the transcript uses, and it indexes into
    `words` (below) with that. No translation line anymore (removed on
    request).
    - **Per-word data**: each clip's own `wordAnalysis.words`, one entry per
      `alignment.word_segments` (same order/count, guaranteed by how
      `data/scripts/build-clips.js` builds it — see `../data/README.md`),
      so the two line up by plain array index. Real morphology from
      `inverted_index.json`: a transcript word is normalized and looked up
      for its `morphology.root`/`morpheme_chain`/`suffixes`; `gloss`/
      `meaning` reuse that index's own Spanish linguistic-register fields
      as-is (`name`/`role` for suffixes, `pos`/first sense definition for
      the root) rather than the short English glosses an earlier
      hand-authored single-example fixture used — there's no English gloss
      in the real data. A transcript word with no index entry (proper
      noun, loanword, etc.) becomes its own unanalyzed root with `"—"`
      gloss/meaning rather than being dropped, keeping the array's
      length/order intact.
    - **Playing vs. paused show different amounts of detail, on purpose.**
      While `isPlaying`, only the chip row shows — in fast speech the
      active word can advance a couple of times a second, far too fast to
      read prose alongside it, and toggling the detail list on and off
      that often would just be noisy. The detail list (each morpheme
      restated with its gloss and a short explanation) only appears once
      playback actually stops on a word — paused, or the clip reached the
      end — the one moment there's actually time to read it.
    - **Two separate, deliberately different animations.** The chip row
      remounts on every `activeWordIndex` change (keyed by it) and plays a
      short (220ms) fade/slide-up-in on each remount — quick, since it has
      to keep up with fast speech. The detail list's reveal uses a
      `grid-template-rows: 0fr -> 1fr` + opacity transition (360ms,
      `cubic-bezier(0.22, 1, 0.36, 1)`) toggled by an `is-visible` class
      tied to `!isPlaying` — a pure-CSS way to animate from/to `height:
      auto` smoothly without measuring pixel heights in JS, slower and
      gentler since it's for the one moment someone stops to actually read.
- **Icons** (`player-icons.tsx`): hand-drawn inline SVGs (pause, prev/next
  track, back arrow), same convention as `SearchIcon` — no icon library.
  **Exception: `PlayIcon`** — the original hand-drawn triangle path's
  centroid sat left of the 24×24 viewBox's center, so it read as visibly
  off-center inside the round play button. Replaced with Material Design's
  well-tested `play_arrow` path (`M8 5v14l11-7z`) instead of hand-tuning
  another custom one, specifically for its already-correct optical
  centering.
- Metadata fields actually used are typed in `types.ts`; fields the UI
  doesn't read (votes, prompt IDs, etc.) are left untyped on purpose rather
  than modeling the full example schema.
- **No Spanish translation shown.** `project-context.md`'s dataset model
  describes one, but the real corpus's metadata only has `prompt`
  (the Quechua prompt the speaker was given) and `transcription` (Quechua) —
  no translation field — so none is fabricated here. [TO BE DEFINED] once a
  real translation field exists in the dataset.

### Custom scrollbars (`app/globals.css`)

A `.paqocha-scroll` class, applied to every independently-scrolling panel in
`KaraokePlayer` — the transcript (`karaoke-transcript.tsx`), the match list
(`karaoke-player.tsx`), and the Analysis tab (`word-analysis.tsx`) — repaints
the browser's default scrollbar as a slim, fully-rounded, floating thumb
instead of the plain OS-gray bar `color-scheme` alone produces (see Tokens
above). Global, not per-component, since all three panels need the exact
same look; defined once in `app/globals.css` rather than three component
`<style>` tags.

- **Firefox**: `scrollbar-width: thin` + `scrollbar-color` (thumb, track) —
  the only two properties Firefox's standardized scrollbar API exposes.
- **Chrome/Edge/Safari**: `::-webkit-scrollbar*` pseudo-elements — a
  transparent track, and a thumb colored with `color-mix(in srgb,
  var(--color-primary) 40%, transparent)` (65% on hover), the same tinted-fill
  idiom as `MatchCard`'s hover/active states. `border: 2px solid transparent`
  + `background-clip: padding-box` insets the painted thumb from the
  scrollbar's own edges, so it reads as a floating pill rather than a bar
  flush against the content.
- **Bug found on Windows Chrome: leftover up/down arrow buttons.** Styling
  `::-webkit-scrollbar-thumb` doesn't suppress the classic Windows-style
  arrow buttons at each end of the track — confirmed in-browser, the thumb
  itself rendered correctly (rounded, tinted) but with native triangle arrow
  buttons still sitting above and below it, undermining the "slim, modern"
  intent. **Fix:** `::-webkit-scrollbar-button { display: none; }`.
- A pre-existing `paqocha-karaoke-scroll` class on the transcript container
  predates this and had no rule defined anywhere for it — effectively a
  no-op left over from an earlier pass. Renamed to `paqocha-scroll` rather
  than kept alongside it.

### Theme-independent UI

Both `Hero` and `SearchBar` deliberately opt out of the light/dark theme
system (`--brand-cream` / `--brand-ink` instead of `--color-text` /
`--color-surface`) because they sit on top of the fixed hero video, not the
page's `--color-bg`/`--color-surface` chrome. Reach for the semantic,
theme-switching tokens for anything that sits on the page background; reach
for the `--brand-*` primitives only for UI that sits on the video.

`KaraokePlayer` is the opposite case and a useful contrast: it's a normal
page (own route, own `--color-bg` background, no video underneath), so it
uses the semantic tokens throughout (`--color-surface` for the transcript/
controls/match-card panels, `--color-primary` for the play/back/theme
buttons and the selected match's tinted background, `--color-highlight` for
the karaoke active word) and follows the site's light/dark theme like any
other page content would. `ThemeToggle` briefly lived on the home page, over
the video, with a `--brand-ink` fill for exactly the reason above — it now
lives in `KaraokePlayer`'s header instead (see KaraokePlayer below for why),
so that reasoning no longer applies to it; it takes `--color-primary` from
its caller like the rest of that page's buttons.

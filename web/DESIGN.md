# Paqocha Analyzer — Design Conventions

Living document. This phase covers color tokens and the light/dark theme
system only. Other sections are placeholders.

## Brand colors (source)

- Periwinkle `#5F62A4`
- Cream `#FBF3D2`
- Lime `#CFD224`

These are not used directly in UI; they're refined into the semantic tokens
below so every surface, text, and interactive color has a defined purpose and
a verified contrast ratio.

## Tokens

All tokens live in `styles/tokens.css`. `:root` defines the light theme
(default); `[data-theme="dark"]` overrides it. Both set `color-scheme` so
native form controls and scrollbars match the active theme.

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

## Typography

[TO BE DEFINED] — no typeface decision yet. The `next/font` Geist
setup from `create-next-app` is left untouched; do not add new fonts until
this is decided.

## Spacing

[TO BE DEFINED]

## Motion

[TO BE DEFINED]

## Components

[TO BE DEFINED]

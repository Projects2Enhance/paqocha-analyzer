// Minimal line-style icons, matching components/search/search-icon.tsx's
// convention (inline SVG, currentColor, no icon library — "no new
// dependencies" constraint from the theme-system phase).

type IconProps = { size?: number };

export function PlayIcon({ size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7 4.5c0-1.1 1.2-1.77 2.14-1.2l11 6.5a1.4 1.4 0 0 1 0 2.4l-11 6.5C8.2 19.27 7 18.6 7 17.5v-13Z" />
    </svg>
  );
}

export function PauseIcon({ size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="6" y="4" width="4.5" height="16" rx="1.2" />
      <rect x="13.5" y="4" width="4.5" height="16" rx="1.2" />
    </svg>
  );
}

export function PreviousTrackIcon({ size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="2.4" height="16" rx="1" />
      <path d="M19.5 5.1c1 -.6 2.2 .1 2.2 1.25v11.3c0 1.15-1.2 1.85-2.2 1.25l-9.4-5.65a1.4 1.4 0 0 1 0-2.4l9.4-5.65Z" />
    </svg>
  );
}

export function NextTrackIcon({ size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="17.6" y="4" width="2.4" height="16" rx="1" />
      <path d="M4.5 5.1c-1-.6-2.2 .1-2.2 1.25v11.3c0 1.15 1.2 1.85 2.2 1.25l9.4-5.65a1.4 1.4 0 0 0 0-2.4L4.5 5.1Z" />
    </svg>
  );
}

export function BackArrowIcon({ size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="11 6 5 12 11 18" />
    </svg>
  );
}

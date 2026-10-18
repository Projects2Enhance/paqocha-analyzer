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
      {/* Sharp-triangle vertices (8,5)/(8,19)/(19,12) — Material's
          play_arrow, a known-good optical center for a right-pointing
          triangle, so the original off-center hand-rolled path (centroid
          left of (12,12)) is still gone — each corner is cut by a
          quadratic Bezier (control point = the sharp vertex) for a subtle
          rounded-corner read instead of Material's sharp points. */}
      <path d="M9.52 5.97 17.99 11.36Q19 12 17.99 12.64L9.52 18.03Q8 19 8 17.2V6.8Q8 5 9.52 5.97Z" />
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

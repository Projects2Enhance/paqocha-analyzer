import type { AudioMetadata } from "./types";
import { formatSeconds } from "./format-time";
import { PlayIcon } from "./player-icons";

const AGE_LABELS: Record<string, string> = {
  teens: "Teens",
  twenties: "20s",
  thirties: "30s",
  fourties: "40s",
  forties: "40s",
  fifties: "50s",
  sixties: "60s",
  seventies: "70s",
};

const GENDER_LABELS: Record<string, string> = {
  male_masculine: "Male",
  female_feminine: "Female",
};

function humanize(value: string, table: Record<string, string>): string {
  return table[value] ?? value.replace(/_/g, " ");
}

type MatchCardProps = {
  metadata: AudioMetadata;
  isActive: boolean;
  isPlaying: boolean;
  onSelect: () => void;
};

// A single "coincidence" card — one audio clip where the searched word
// occurs. Only one real example exists right now (see KaraokePlayer), but
// this is shaped to render a scrollable list of many once search is real.
export function MatchCard({
  metadata,
  isActive,
  isPlaying,
  onSelect,
}: MatchCardProps) {
  const speakerLine = [
    humanize(metadata.gender, GENDER_LABELS),
    humanize(metadata.age, AGE_LABELS),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`paqocha-match-card${isActive ? " is-active" : ""}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        width: "100%",
        textAlign: "left",
        borderRadius: "1rem",
        padding: "1rem 1.1rem",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {metadata.accents ?? metadata.language}
        </span>
        <span
          aria-hidden="true"
          className="paqocha-match-card-indicator"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "1.6rem",
            height: "1.6rem",
            borderRadius: "999px",
            flexShrink: 0,
          }}
        >
          {isActive && isPlaying ? (
            <span className="paqocha-match-card-pulse" aria-hidden="true" />
          ) : (
            <PlayIcon size={13} />
          )}
        </span>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: "1.02rem",
          lineHeight: 1.45,
          color: "var(--color-text)",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {metadata.transcription}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.85rem",
          color: "var(--color-text-muted)",
        }}
      >
        <span>{speakerLine}</span>
        <span>{formatSeconds(metadata.duration_ms / 1000)}</span>
      </div>
    </button>
  );
}

// Shared by every MatchCard instance — hoisted here and rendered once by
// the matches-list container, not per card, so N cards don't inject N
// copies of the same rules.
export const MATCH_CARD_STYLES = `
  /* Flat background only — no borders/shadows. "Active" is a tinted fill
     (color-mix with --color-primary) rather than a ring, consistent with
     the rest of KaraokePlayer's minimalism. */
  .paqocha-match-card {
    background: var(--color-surface);
    transition: background 180ms ease, transform 120ms ease;
  }

  .paqocha-match-card:hover {
    background: color-mix(in srgb, var(--color-primary) 6%, var(--color-surface));
  }

  .paqocha-match-card:active {
    transform: scale(0.99);
  }

  .paqocha-match-card.is-active {
    background: color-mix(in srgb, var(--color-primary) 14%, var(--color-surface));
  }

  .paqocha-match-card-indicator {
    background: var(--color-primary);
    color: var(--color-on-primary);
  }

  .paqocha-match-card-pulse {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 999px;
    background: var(--color-on-primary);
    animation: paqocha-match-pulse 1.1s ease-in-out infinite;
  }

  @keyframes paqocha-match-pulse {
    0%, 100% { opacity: 0.45; transform: scale(0.85); }
    50% { opacity: 1; transform: scale(1); }
  }
`;

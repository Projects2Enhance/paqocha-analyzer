import { formatSeconds } from "./format-time";
import {
  NextTrackIcon,
  PauseIcon,
  PlayIcon,
  PreviousTrackIcon,
} from "./player-icons";

type AudioPlayerControlsProps = {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  matchPosition: string;
};

export function AudioPlayerControls({
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onSeek,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  matchPosition,
}: AudioPlayerControlsProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
        padding: "1rem 1.25rem",
        borderRadius: "1.25rem",
        background: "var(--color-surface)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
        }}
      >
        <span
          style={{
            fontSize: "0.78rem",
            color: "var(--color-text-muted)",
            minWidth: "2.6rem",
          }}
        >
          {formatSeconds(currentTime)}
        </span>
        <input
          type="range"
          aria-label="Seek"
          min={0}
          max={Math.max(duration, 0.01)}
          step={0.01}
          value={Math.min(currentTime, duration)}
          onChange={(event) => onSeek(Number(event.target.value))}
          className="paqocha-seek-bar"
          style={{ flex: 1, accentColor: "var(--color-primary)" }}
        />
        <span
          style={{
            fontSize: "0.78rem",
            color: "var(--color-text-muted)",
            minWidth: "2.6rem",
            textAlign: "right",
          }}
        >
          {formatSeconds(duration)}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.1rem",
        }}
      >
        <button
          type="button"
          aria-label="Previous match"
          disabled={!canGoPrevious}
          onClick={onPrevious}
          className="paqocha-transport-button"
        >
          <PreviousTrackIcon />
        </button>

        <button
          type="button"
          aria-label={isPlaying ? "Pause" : "Play"}
          onClick={onTogglePlay}
          className="paqocha-transport-button paqocha-play-button"
        >
          {isPlaying ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
        </button>

        <button
          type="button"
          aria-label="Next match"
          disabled={!canGoNext}
          onClick={onNext}
          className="paqocha-transport-button"
        >
          <NextTrackIcon />
        </button>
      </div>

      <span
        style={{
          textAlign: "center",
          fontSize: "0.78rem",
          color: "var(--color-text-muted)",
        }}
      >
        Match {matchPosition}
      </span>

      <style>{`
        .paqocha-seek-bar {
          height: 1.1rem;
          cursor: pointer;
        }

        .paqocha-transport-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.75rem;
          height: 2.75rem;
          border-radius: 999px;
          border: none;
          background: transparent;
          color: var(--color-text);
          cursor: pointer;
          transition: background 180ms ease, color 180ms ease, transform 120ms ease;
        }

        .paqocha-transport-button:hover:not(:disabled) {
          background: var(--color-border-subtle);
        }

        .paqocha-transport-button:active:not(:disabled) {
          transform: scale(0.94);
        }

        .paqocha-transport-button:disabled {
          color: var(--color-border);
          cursor: not-allowed;
        }

        .paqocha-play-button {
          width: 3.5rem;
          height: 3.5rem;
          background: var(--color-primary);
          color: var(--color-on-primary);
        }

        .paqocha-play-button:hover:not(:disabled) {
          background: var(--color-primary);
          filter: brightness(1.08);
        }
      `}</style>
    </div>
  );
}

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
}: AudioPlayerControlsProps) {
  const seekPercent =
    duration > 0 ? (Math.min(currentTime, duration) / duration) * 100 : 0;

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
          style={{
            flex: 1,
            background: `linear-gradient(to right, var(--color-primary) ${seekPercent}%, var(--color-border-subtle) ${seekPercent}%)`,
          }}
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
          {isPlaying ? <PauseIcon size={24} /> : <PlayIcon size={28} />}
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

      <style>{`
        /* accentColor alone left a native browser-drawn groove/border
           around the track on Windows Chrome — that's the OS theming the
           *native* control, not a CSS border accentColor can remove.
           appearance: none drops that native rendering entirely, so the
           track/thumb are rebuilt by hand below; the "filled" portion
           comes from the gradient set inline on the input itself (its
           JS-computed background, visible through the now-transparent
           track), not accentColor, which has no effect once appearance
           is none. */
        .paqocha-seek-bar {
          appearance: none;
          -webkit-appearance: none;
          width: 100%;
          height: 0.35rem;
          border-radius: 999px;
          border: none;
          outline: none;
          cursor: pointer;
        }

        .paqocha-seek-bar::-webkit-slider-runnable-track {
          appearance: none;
          -webkit-appearance: none;
          height: 0.35rem;
          border-radius: 999px;
          background: transparent;
          border: none;
        }

        .paqocha-seek-bar::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          width: 1rem;
          height: 1rem;
          margin-top: calc((0.35rem - 1rem) / 2);
          border-radius: 999px;
          border: none;
          background: var(--color-primary);
          cursor: pointer;
        }

        .paqocha-seek-bar::-moz-range-track {
          height: 0.35rem;
          border-radius: 999px;
          background: var(--color-border-subtle);
          border: none;
        }

        .paqocha-seek-bar::-moz-range-progress {
          height: 0.35rem;
          border-radius: 999px;
          background: var(--color-primary);
          border: none;
        }

        .paqocha-seek-bar::-moz-range-thumb {
          width: 1rem;
          height: 1rem;
          border-radius: 999px;
          border: none;
          background: var(--color-primary);
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

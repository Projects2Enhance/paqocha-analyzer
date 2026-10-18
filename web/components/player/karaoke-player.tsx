"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AudioPlayerControls } from "./audio-player-controls";
import { KaraokeTranscript } from "./karaoke-transcript";
import { MatchCard, MATCH_CARD_STYLES } from "./match-card";
import { BackArrowIcon } from "./player-icons";
import type { Alignment, AlignmentWord, AudioMetadata } from "./types";

const EXAMPLE_BASE_PATH = "/example";

// Finds the last word whose start time has passed — words are sorted
// ascending, so once we pass `time` we can stop. Keeps the current word
// highlighted through any silence gap until the next word actually starts.
function findActiveWordIndex(words: AlignmentWord[], time: number): number {
  let active = -1;
  for (const word of words) {
    if (word.start <= time) {
      active += 1;
    } else {
      break;
    }
  }
  return active;
}

// Loads the one provisional real example from public/example/ and plays it
// karaoke-style, regardless of what was searched — see web/DESIGN.md ->
// Components -> KaraokePlayer. No real search/backend yet; this is the UI
// shape search results will eventually render into.
export function KaraokePlayer() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim();

  const [metadata, setMetadata] = useState<AudioMetadata | null>(null);
  const [alignment, setAlignment] = useState<Alignment | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`${EXAMPLE_BASE_PATH}/metadata.json`).then((res) => res.json()),
      fetch(`${EXAMPLE_BASE_PATH}/alignment.json`).then((res) => res.json()),
    ])
      .then(([metadataJson, alignmentJson]: [AudioMetadata, Alignment]) => {
        if (cancelled) return;
        setMetadata(metadataJson);
        setAlignment(alignmentJson);
        setDuration(metadataJson.duration_ms / 1000);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    // "ended" doesn't reliably also fire "pause" per the HTML spec, so
    // isPlaying would otherwise stay stuck true once playback reaches the end.
    audio.addEventListener("ended", handlePause);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handlePause);
    };
  }, [metadata]);

  function seekTo(time: number, autoplay = false) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
    if (autoplay) audio.play();
  }

  function handleTogglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
  }

  if (loadError) {
    return (
      <PageShell query={query}>
        <p style={{ color: "var(--color-text-muted)" }}>
          Couldn&apos;t load the example clip. Try refreshing.
        </p>
      </PageShell>
    );
  }

  if (!metadata || !alignment) {
    return (
      <PageShell query={query}>
        <p style={{ color: "var(--color-text-muted)" }}>Loading example…</p>
      </PageShell>
    );
  }

  const activeWordIndex = findActiveWordIndex(
    alignment.word_segments,
    currentTime,
  );

  return (
    <PageShell query={query}>
      <div className="flex flex-1 min-h-0 flex-col lg:flex-row gap-5 lg:gap-6 px-5 sm:px-8 pb-5 sm:pb-8 overflow-hidden">
        <div className="flex flex-col min-h-0 flex-1 gap-4">
          <KaraokeTranscript
            segments={alignment.segments}
            activeWordIndex={activeWordIndex}
            onWordClick={(time) => seekTo(time, true)}
          />
          <AudioPlayerControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onTogglePlay={handleTogglePlay}
            onSeek={(time) => seekTo(time)}
            onPrevious={() => {}}
            onNext={() => {}}
            canGoPrevious={false}
            canGoNext={false}
            matchPosition="1 / 1"
          />
        </div>

        <div className="flex flex-col min-h-0 max-h-[38vh] lg:max-h-none lg:h-full lg:w-[320px] flex-shrink-0 gap-3">
          <h2
            style={{
              margin: 0,
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Matches (1)
          </h2>
          <div className="flex flex-col gap-3 min-h-0 overflow-y-auto">
            <MatchCard
              metadata={metadata}
              isActive
              isPlaying={isPlaying}
              onSelect={() => seekTo(0, true)}
            />
          </div>
        </div>
      </div>

      <style>{MATCH_CARD_STYLES}</style>

      <audio ref={audioRef} src={`${EXAMPLE_BASE_PATH}/${metadata.audio_file}`} preload="auto" />
    </PageShell>
  );
}

function PageShell({
  query,
  children,
}: {
  query: string | undefined;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      <div className="flex flex-col flex-1 min-h-0 w-full max-w-[1240px] mx-auto">
        <header className="flex flex-col gap-3 px-5 sm:px-8 pt-5 sm:pt-7 pb-4">
          <Link
            href="/"
            className="paqocha-back-link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              width: "fit-content",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "var(--color-text-muted)",
              textDecoration: "none",
            }}
          >
            <BackArrowIcon size={16} />
            Home
          </Link>

          <div>
            <p
              style={{
                margin: "0 0 0.15rem",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Search
            </p>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(1.5rem, 3.4vw, 2.1rem)",
                fontWeight: 700,
              }}
            >
              {query ? `“${query}”` : "Example clip"}
            </h1>
            <p
              style={{
                margin: "0.3rem 0 0",
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
                fontStyle: "italic",
              }}
            >
              Real audio and transcript, demo data — every search opens this
              clip until matching across the full dataset is wired up.
            </p>
          </div>
        </header>

        {children}
      </div>

      <style>{`
        .paqocha-back-link {
          transition: color 160ms ease;
        }

        .paqocha-back-link:hover {
          color: var(--color-link);
        }
      `}</style>
    </div>
  );
}

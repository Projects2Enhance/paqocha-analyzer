"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AudioPlayerControls } from "./audio-player-controls";
import { KaraokeTranscript } from "./karaoke-transcript";
import {
  MatchCardSkeleton,
  SKELETON_STYLES,
  TranscriptSkeleton,
  WordAnalysisSkeleton,
} from "./loading-skeletons";
import { MatchCard, MATCH_CARD_STYLES } from "./match-card";
import { NoResultsState } from "./no-results-state";
import { BackArrowIcon } from "./player-icons";
import { PlayerSearchOverlay } from "./player-search-overlay";
import type {
  Alignment,
  AlignmentWord,
  AudioMetadata,
  WordAnalysisData,
} from "./types";
import { ViewSwitch, type ResultsView } from "./view-switch";
import { WordAnalysis } from "./word-analysis";
import { ThemeToggle } from "@/lib/theme/theme-toggle";
import { SearchIcon } from "@/components/search/search-icon";

const EXAMPLE_BASE_PATH = "/example";
// How many words of lead-in before the first search match to start
// playback from, so the clip doesn't open mid-sentence right on the word.
const MATCH_LEAD_IN_WORDS = 3;
// Artificial minimum wait before revealing real content, simulating a
// search request — the actual fetches (static local JSON) resolve far
// faster than this. See web/DESIGN.md -> Components -> KaraokePlayer.
const SIMULATED_SEARCH_DELAY_MS = 3000;

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

// Lowercases and strips leading/trailing punctuation (keeps internal
// characters, e.g. the hyphen in "ayllu-ayllunta") so a search term and a
// transcript word compare equal regardless of trailing commas/periods.
function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");
}

// Every word index whose normalized text equals the normalized query —
// real matching against this one loaded transcript (not a real search
// backend; see the module doc comment below).
function findSearchMatches(words: AlignmentWord[], query: string | undefined): number[] {
  const normalizedQuery = query ? normalizeWord(query) : "";
  if (!normalizedQuery) return [];
  const indices: number[] = [];
  words.forEach((word, index) => {
    if (normalizeWord(word.word) === normalizedQuery) indices.push(index);
  });
  return indices;
}

// Start MATCH_LEAD_IN_WORDS words before the first match, or 0 if the term
// doesn't occur in this transcript at all.
function computeInitialSeekTime(
  words: AlignmentWord[],
  matchIndices: number[],
): number {
  if (matchIndices.length === 0) return 0;
  const startIndex = Math.max(0, matchIndices[0] - MATCH_LEAD_IN_WORDS);
  return words[startIndex].start;
}

// Loads the one provisional real example from public/example/ and plays it
// karaoke-style — see web/DESIGN.md -> Components -> KaraokePlayer. No real
// search backend exists yet, so every search opens this same example, but
// the search term *is* matched for real against this one transcript: if it
// occurs there, playback starts a few words before the first occurrence,
// every occurrence is highlighted in the transcript, and the match list
// shows this one real clip; if it doesn't occur at all, the whole player
// body is replaced by NoResultsState — no transcript, controls, or match
// list/analysis to interact with.
export function KaraokePlayer() {
  const searchParams = useSearchParams();
  // Initial value only — see handleInPageSearch below for why this isn't
  // re-read from searchParams on every render.
  const [activeQuery, setActiveQuery] = useState(() =>
    searchParams.get("q")?.trim(),
  );

  const [metadata, setMetadata] = useState<AudioMetadata | null>(null);
  const [alignment, setAlignment] = useState<Alignment | null>(null);
  const [wordAnalysis, setWordAnalysis] = useState<WordAnalysisData | null>(
    null,
  );
  const [loadError, setLoadError] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [view, setView] = useState<ResultsView>("list");
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [minLoadingElapsed, setMinLoadingElapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Depends on `activeQuery`, not `[]`: an in-page re-search (see
  // handleInPageSearch) resets `minLoadingElapsed` to false in its own event
  // handler, and this effect re-arms the same timer, so the skeleton phase
  // plays again for every search, not just the first one.
  useEffect(() => {
    const timeoutId = setTimeout(
      () => setMinLoadingElapsed(true),
      SIMULATED_SEARCH_DELAY_MS,
    );
    return () => clearTimeout(timeoutId);
  }, [activeQuery]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`${EXAMPLE_BASE_PATH}/metadata.json`).then((res) => res.json()),
      fetch(`${EXAMPLE_BASE_PATH}/alignment.json`).then((res) => res.json()),
      fetch(`${EXAMPLE_BASE_PATH}/word-analysis.json`).then((res) =>
        res.json(),
      ),
    ])
      .then(
        ([metadataJson, alignmentJson, wordAnalysisJson]: [
          AudioMetadata,
          Alignment,
          WordAnalysisData,
        ]) => {
          if (cancelled) return;
          setMetadata(metadataJson);
          setAlignment(alignmentJson);
          setWordAnalysis(wordAnalysisJson);
          // Not setting `duration` from metadata here — it stays at its
          // initial 0 (shown as "0:00" in AudioPlayerControls) until the
          // real <audio> element reports it below, so the skeleton phase
          // never flashes the real duration early.
        },
      )
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !alignment) return;

    const initialTime = computeInitialSeekTime(
      alignment.word_segments,
      findSearchMatches(alignment.word_segments, activeQuery),
    );

    function applyInitialTime() {
      if (!audio) return;
      audio.currentTime = initialTime;
      setCurrentTime(initialTime);
    }

    // Tried immediately (works once the browser already has metadata
    // cached) and reapplied on "loadedmetadata" — setting currentTime
    // before duration is known can silently get reset once it loads.
    applyInitialTime();
    // Defensive: if duration somehow is already known the instant this
    // runs, pick it up immediately rather than only from "loadedmetadata"
    // below (which won't fire again if it already fired once, missed).
    if (!Number.isNaN(audio.duration)) setDuration(audio.duration);
    // Autoplays on every fresh load (this effect only meaningfully runs
    // once per mount — see the full-navigation note above) — requested on
    // purpose: landing on a search-match lead-in that's still paused read
    // as broken. `.catch()` swallows a rejected autoplay promise (blocked
    // by the browser's autoplay policy) rather than an uncaught rejection;
    // worst case it just stays paused at the right position, same as
    // before this existed.
    audio.play().catch(() => {});

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      applyInitialTime();
    };
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
      // Stops playback whenever this cleanup runs, not only on unmount —
      // also on every `activeQuery` change, i.e. a new in-page search (see
      // PlayerSearchOverlay/handleInPageSearch below): a brief, synchronous
      // pause right before the new run's own `audio.play()` a few lines up,
      // not a perceptible gap. The unmount case (e.g. navigating back to
      // "/" via the back button) is still the main reason this exists:
      // removing an <audio> element from the DOM doesn't reliably stop it
      // immediately in every browser — a real bug, not a demo-data
      // shortcut — so it's paused directly here rather than relying on
      // implicit cleanup.
      audio.pause();
    };
    // `activeQuery` deliberately reruns this whole effect on an in-page
    // re-search — same seek-to-lead-in + autoplay + (re)attach-listeners
    // behavior as the very first load, just triggered by a new search term
    // instead of a fresh mount. `minLoadingElapsed` is a dependency for a
    // different reason, not just a formality: the <audio> element itself
    // only mounts once `isReady` (which needs it) is true — see the render
    // below — so `audioRef.current` is still null the first time this
    // effect runs (right when `metadata`/`alignment` settle, well before
    // the simulated delay elapses). Without this in the deps, the effect
    // would hit the `!audio` early return once, never re-run once <audio>
    // actually exists a few seconds later, and silently never attach any
    // listeners at all — audio would still play (the transport buttons
    // call `audioRef.current.play()` directly), just with the transcript/
    // seek bar/Analysis never updating, since nothing was listening for
    // "timeupdate". This was a real bug, caught after the fact, not a
    // hypothetical.
  }, [metadata, alignment, activeQuery, minLoadingElapsed]);

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

  // Re-searching *from* the player (the new magnifying-glass button in the
  // header, not SearchBar on "/") deliberately does *not* repeat the
  // full-navigation pattern documented above for Home <-> player — that
  // pattern exists to dodge Next's router-cache state leaks *across
  // routes*; this never leaves "/search" at all. Updating `activeQuery`
  // (plain React state) and reseeking the already-mounted <audio> element
  // directly is simpler and smoother, and the metadata/alignment/
  // word-analysis fetches don't need to repeat either, since they don't
  // depend on the query — only the derived matches/seek position do.
  // `history.replaceState`, not a Next.js navigation of any kind (no
  // `router.push`, no `<Link>`), keeps the address bar honest without
  // asking Next's router to do anything at all.
  function handleInPageSearch(term: string) {
    const sanitized = term.replace(/\s+/g, "");
    if (!sanitized) return;
    setActiveQuery(sanitized);
    setActiveMatchIndex(0);
    // Replays the same simulated-search skeleton phase as the first load
    // (see the `minLoadingElapsed` effect above) instead of snapping
    // straight to the new result.
    setMinLoadingElapsed(false);
    window.history.replaceState(
      null,
      "",
      `/search?q=${encodeURIComponent(sanitized)}`,
    );
    setIsSearchOpen(false);
  }

  if (loadError) {
    return (
      <PageShell
        query={activeQuery}
        onOpenSearch={() => setIsSearchOpen(true)}
      >
        <p style={{ color: "var(--color-text-muted)" }}>
          Couldn&apos;t load the example clip. Try refreshing.
        </p>
      </PageShell>
    );
  }

  const isDataLoaded = Boolean(metadata && alignment && wordAnalysis);
  // Gates on the simulated delay too, not just the (near-instant, local)
  // fetches — see SIMULATED_SEARCH_DELAY_MS above.
  const isReady = isDataLoaded && minLoadingElapsed;

  const activeWordIndex = alignment
    ? findActiveWordIndex(alignment.word_segments, currentTime)
    : -1;
  const searchMatchIndices = alignment
    ? findSearchMatches(alignment.word_segments, activeQuery)
    : [];
  const matchStartTime = alignment
    ? computeInitialSeekTime(alignment.word_segments, searchMatchIndices)
    : 0;

  // A query with zero real occurrences in this transcript blocks the whole
  // player body (see NoResultsState) instead of showing a dead transcript
  // and an empty match list. An empty query (direct nav to "/search" with
  // no "?q=") isn't a "no results" search at all, so it still falls
  // through to the one example clip as before.
  const hasQuery = Boolean(activeQuery);
  const hasMatches = !hasQuery || searchMatchIndices.length > 0;
  const noResults = isReady && hasQuery && !hasMatches;
  // Exactly one real clip exists either way — this isn't "how many times
  // the word occurs", it's "how many clips matched" (see MatchCard).
  const matchCount = hasMatches ? 1 : 0;

  function selectMatch(index: number) {
    setActiveMatchIndex(index);
    seekTo(matchStartTime, true);
  }

  return (
    <PageShell query={activeQuery} onOpenSearch={() => setIsSearchOpen(true)}>
      {noResults ? (
        <NoResultsState query={activeQuery} />
      ) : (
        <div className="flex flex-1 min-h-0 flex-col lg:flex-row gap-5 lg:gap-6 px-5 sm:px-8 pb-5 sm:pb-8 overflow-hidden">
          <div className="flex flex-col min-h-0 flex-1 gap-4">
            {isReady && alignment ? (
              <KaraokeTranscript
                segments={alignment.segments}
                activeWordIndex={activeWordIndex}
                matchWordIndices={searchMatchIndices}
                onWordClick={(time) => seekTo(time)}
              />
            ) : (
              <TranscriptSkeleton />
            )}
            <AudioPlayerControls
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              onTogglePlay={handleTogglePlay}
              onSeek={(time) => seekTo(time)}
              onPrevious={() => selectMatch(activeMatchIndex - 1)}
              onNext={() => selectMatch(activeMatchIndex + 1)}
              canGoPrevious={activeMatchIndex > 0}
              canGoNext={activeMatchIndex < matchCount - 1}
            />
          </div>

          <div className="flex flex-col min-h-0 max-h-[38vh] lg:max-h-none lg:h-full lg:w-[320px] flex-shrink-0 gap-3">
            <ViewSwitch value={view} onChange={setView} />
            {view === "list" ? (
              isReady && metadata ? (
                <div className="flex flex-col gap-3 min-h-0 overflow-y-auto paqocha-scroll paqocha-reveal-fade">
                  {Array.from({ length: matchCount }, (_, index) => (
                    <MatchCard
                      key={index}
                      metadata={metadata}
                      isActive={index === activeMatchIndex}
                      isPlaying={isPlaying}
                      onSelect={() => selectMatch(index)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3 min-h-0 overflow-y-auto">
                  <MatchCardSkeleton />
                </div>
              )
            ) : isReady && wordAnalysis ? (
              <WordAnalysis
                words={wordAnalysis.words}
                activeWordIndex={activeWordIndex}
                isPlaying={isPlaying}
              />
            ) : (
              <WordAnalysisSkeleton />
            )}
          </div>
        </div>
      )}

      <style>{MATCH_CARD_STYLES}</style>
      <style>{SKELETON_STYLES}</style>

      {isReady && metadata && !noResults && (
        <audio
          ref={audioRef}
          src={`${EXAMPLE_BASE_PATH}/${metadata.audio_file}`}
          preload="auto"
        />
      )}

      <PlayerSearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSubmit={handleInPageSearch}
      />
    </PageShell>
  );
}

function PageShell({
  query,
  onOpenSearch,
  children,
}: {
  query: string | undefined;
  onOpenSearch: () => void;
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
          <div className="flex items-center justify-between">
            {/* Plain <a>, not next/link's <Link> — a full navigation on
                purpose, see the long comment on SearchBar's handleSearch. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages --
                deliberate: see the comment above. */}
            <a
              href="/"
              aria-label="Back to home"
              className="paqocha-icon-button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "2.75rem",
                height: "2.75rem",
                borderRadius: "999px",
                background: "var(--color-primary)",
                color: "var(--color-on-primary)",
              }}
            >
              <BackArrowIcon size={18} />
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenSearch}
                aria-label="Search"
                className="paqocha-icon-button"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "2.75rem",
                  height: "2.75rem",
                  borderRadius: "999px",
                  border: "none",
                  background: "var(--color-primary)",
                  color: "var(--color-on-primary)",
                  cursor: "pointer",
                }}
              >
                <SearchIcon size={18} />
              </button>

              <ThemeToggle />
            </div>
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(1.5rem, 3.4vw, 2.1rem)",
              fontWeight: 700,
            }}
          >
            {query ? `“${query}”` : "Example clip"}
          </h1>
        </header>

        {children}
      </div>

      <style>{`
        /* Shared by the back link and the new search trigger — both are
           plain filled --color-primary circles with identical hover/press
           feedback, so one class covers both instead of two near-duplicate
           ones. (ThemeToggle keeps its own equivalent rules under its own
           class name, self-contained on purpose — see its own file.) */
        .paqocha-icon-button {
          transition: filter 160ms ease, transform 120ms ease;
        }

        .paqocha-icon-button:hover {
          filter: brightness(1.08);
        }

        .paqocha-icon-button:active {
          transform: scale(0.94);
        }
      `}</style>
    </div>
  );
}

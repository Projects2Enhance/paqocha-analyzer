import { SearchOffIcon } from "./player-icons";

type NoResultsStateProps = {
  query: string | undefined;
};

// Replaces the whole player body (transcript, controls, match list/analysis,
// audio element) when the searched word has zero real occurrences in this
// example's transcript — see findSearchMatches in karaoke-player.tsx. Rather
// than show an empty transcript and a dead seek bar, the page just states
// there's nothing to play; the header's back/search/theme controls stay
// live so the user can try another word.
export function NoResultsState({ query }: NoResultsStateProps) {
  return (
    <div className="flex flex-1 min-h-0 flex-col items-center justify-center gap-4 px-5 sm:px-8 pb-5 sm:pb-8 text-center">
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "3.5rem",
          height: "3.5rem",
          borderRadius: "999px",
          background: "var(--color-border-subtle)",
          color: "var(--color-text-muted)",
        }}
      >
        <SearchOffIcon size={22} />
      </span>

      <div
        style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "1.05rem",
            fontWeight: 700,
            color: "var(--color-text)",
          }}
        >
          No matches found
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "0.92rem",
            color: "var(--color-text-muted)",
            maxWidth: "26rem",
          }}
        >
          {query ? (
            <>
              We couldn&apos;t find{" "}
              <strong style={{ color: "var(--color-text)" }}>
                “{query}”
              </strong>{" "}
              in this clip.
            </>
          ) : (
            "We couldn't find that word in this clip."
          )}{" "}
          Try another Quechua word.
        </p>
      </div>
    </div>
  );
}

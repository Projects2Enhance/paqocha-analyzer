import { Suspense } from "react";
import { KaraokePlayer } from "@/components/player/karaoke-player";

// KaraokePlayer reads the ?q= search param via useSearchParams, which always
// needs a Suspense boundary (search params are only known at request time).
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <KaraokePlayer />
    </Suspense>
  );
}

function SearchPageFallback() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        color: "var(--color-text-muted)",
      }}
    >
      Cargando…
    </div>
  );
}

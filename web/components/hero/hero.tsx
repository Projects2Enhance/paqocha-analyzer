"use client";

import { useEffect, useRef, useState } from "react";

// Full-viewport background video plus the "Escucha. Descompón. Entiende."
// tagline (see docs/project-context.md), laid out as three independently
// positioned words. See web/DESIGN.md -> Components -> Hero.
//
// Styles are inline / a plain <style> tag on purpose: this project's
// Turbopack config routes every *.css through the Tailwind loader, which
// strips CSS-module scoping — see DESIGN.md's "Known build constraint".

const PLAYBACK_RATE = 0.5;
const RESIZE_REPLAY_DEBOUNCE_MS = 450;
// Ignore sub-pixel/UI-chrome noise (e.g. a mobile browser's address bar
// hiding) so the replay only fires on a resize the viewer actually made.
const RESIZE_REPLAY_THRESHOLD_PX = 24;

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Remounts the word spans (restarting their CSS entrance animation) once
  // per resize, after the resize settles rather than on every frame of it.
  const [replayKey, setReplayKey] = useState(0);

  const applyPlaybackRate = () => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = PLAYBACK_RATE;
    }
  };

  // Bug fixed — paused on first load on iOS (Safari, Chrome, Brave — all
  // WebKit there), showing a native play button instead of looping.
  // React never writes `muted` into the server-rendered HTML for a <video>
  // (it only sets the `.muted` *property* imperatively, after hydration) —
  // confirmed by inspecting the SSR output, which has `autoplay` and
  // `playsinline` but no `muted` attribute. iOS's autoplay gate checks the
  // element's actual muted state at the moment the `autoplay` attribute
  // tries to fire, which happens as the browser parses the tag — i.e.
  // before React's JS has run at all. An unmuted autoplay is blocked there,
  // and unlike desktop Chrome, iOS doesn't retry once `.muted` is set a
  // moment later by hydration — the video just stays paused.
  // Fix: a callback ref runs synchronously at commit (still before paint,
  // and far earlier than a useEffect), so `muted`/`defaultMuted` are set as
  // real DOM properties and `play()` is requested from JS as early as
  // possible instead of relying on the declarative `autoplay` attribute at
  // all. The `autoPlay`/`muted` JSX props stay as a no-JS fallback.
  const setVideoRef = (node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (!node) return;
    node.defaultMuted = true;
    node.muted = true;
    node.playbackRate = PLAYBACK_RATE;
    node.play().catch(() => {
      // Autoplay can still be blocked outright (e.g. Brave's "Block
      // Autoplay" shield) regardless of muted state — fall back to
      // starting playback on the viewer's first tap/click anywhere, so it
      // never requires a visible play button to get going.
      const resume = () => {
        node.play().catch(() => {});
      };
      document.addEventListener("touchstart", resume, { once: true });
      document.addEventListener("pointerdown", resume, { once: true });
    });
  };

  useEffect(() => {
    applyPlaybackRate();
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    function handleResize() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const { innerWidth, innerHeight } = window;
        const changedEnough =
          Math.abs(innerWidth - lastWidth) > RESIZE_REPLAY_THRESHOLD_PX ||
          Math.abs(innerHeight - lastHeight) > RESIZE_REPLAY_THRESHOLD_PX;
        lastWidth = innerWidth;
        lastHeight = innerHeight;
        if (changedEnough) {
          setReplayKey((key) => key + 1);
        }
      }, RESIZE_REPLAY_DEBOUNCE_MS);
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "var(--color-bg)",
      }}
    >
      <video
        ref={setVideoRef}
        src="/video.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        // Some browsers reset playbackRate once metadata actually loads,
        // even if it was set right after mount — reapply it here too.
        onLoadedMetadata={applyPlaybackRate}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          maxWidth: "none",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />

      <h1
        key={replayKey}
        aria-label="Escucha. Descompón. Entiende."
        style={{
          position: "absolute",
          inset: 0,
          margin: 0,
          fontWeight: 500,
          color: "var(--brand-cream)",
          textShadow: "0 2px 20px rgba(31, 33, 80, 0.35)",
          lineHeight: 1.05,
        }}
      >
        <span
          aria-hidden="true"
          className="hero-word"
          style={{
            position: "absolute",
            top: "14%",
            left: "6%",
            fontSize: "clamp(2.5rem, 7.5vw, 5.75rem)",
            animationDelay: "0ms",
          }}
        >
          Escucha
        </span>
        <span
          aria-hidden="true"
          className="hero-word"
          style={{
            position: "absolute",
            top: "47%",
            right: "5%",
            maxWidth: "60%",
            fontSize: "clamp(2.25rem, 7vw, 5.25rem)",
            animationDelay: "280ms",
          }}
        >
          Descompón
        </span>
        <span
          aria-hidden="true"
          className="hero-word"
          style={{
            position: "absolute",
            bottom: "14%",
            right: "32%",
            fontSize: "clamp(2.5rem, 8vw, 6.25rem)",
            animationDelay: "560ms",
          }}
        >
          Entiende
        </span>
      </h1>

      <style>{`
        .hero-word {
          opacity: 0;
          transform: translateY(36px);
          filter: blur(16px);
          animation: paqocha-hero-word-in 2200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes paqocha-hero-word-in {
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-word {
            animation: none;
            opacity: 1;
            transform: none;
            filter: none;
          }
        }
      `}</style>
    </section>
  );
}

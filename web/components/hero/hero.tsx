"use client";

import { useEffect, useRef, useState } from "react";

// Full-viewport background video plus the "Listen. Break it down.
// Understand." tagline (see docs/project-context.md), laid out as three
// independently positioned words. See web/DESIGN.md -> Components -> Hero.
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
        ref={videoRef}
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
        aria-label="Listen. Break it down. Understand."
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
            right: "6%",
            fontSize: "clamp(2rem, 6vw, 4.5rem)",
            animationDelay: "0ms",
          }}
        >
          Listen
        </span>
        <span
          aria-hidden="true"
          className="hero-word"
          style={{
            position: "absolute",
            top: "47%",
            left: "5%",
            maxWidth: "60%",
            fontSize: "clamp(1.75rem, 5.5vw, 4rem)",
            animationDelay: "220ms",
          }}
        >
          Break it down
        </span>
        <span
          aria-hidden="true"
          className="hero-word"
          style={{
            position: "absolute",
            bottom: "14%",
            left: "32%",
            fontSize: "clamp(2rem, 6.5vw, 4.75rem)",
            animationDelay: "440ms",
          }}
        >
          Understand
        </span>
      </h1>

      <style>{`
        .hero-word {
          opacity: 0;
          transform: translateY(28px);
          animation: paqocha-hero-word-in 1500ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes paqocha-hero-word-in {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-word {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}

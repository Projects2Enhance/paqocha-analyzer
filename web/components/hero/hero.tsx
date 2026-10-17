// Full-viewport background video, no overlay or content yet — see web/DESIGN.md.
//
// Styles are inline on purpose: this project's Turbopack config routes every
// *.css through the Tailwind loader, which strips CSS-module scoping, so a
// *.module.css class silently never applies. Inline styles also outrank
// Tailwind's preflight (`video { max-width: 100%; height: auto }`), which would
// otherwise stop the video from scaling up to cover the viewport.
export function Hero() {
  return (
    <section
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "var(--color-bg)",
      }}
    >
      <video
        src="/video.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          maxWidth: "none",
          // Scale preserving aspect ratio until the viewport box is fully
          // covered, cropping the overflow and keeping it centered on both axes.
          objectFit: "cover",
          objectPosition: "center",
        }}
      />
    </section>
  );
}

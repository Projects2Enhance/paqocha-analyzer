import { ThemeToggle } from "@/lib/theme/theme-toggle";

// TEMPORARY verification screen for the theme system — not product UI.
// Will be replaced once real screens are designed. See web/DESIGN.md.

const swatches: Array<{ token: string; label: string }> = [
  { token: "--color-bg", label: "bg" },
  { token: "--color-surface", label: "surface" },
  { token: "--color-text", label: "text" },
  { token: "--color-text-muted", label: "text-muted" },
  { token: "--color-primary", label: "primary" },
  { token: "--color-on-primary", label: "on-primary" },
  { token: "--color-link", label: "link" },
  { token: "--color-highlight", label: "highlight" },
  { token: "--color-on-highlight", label: "on-highlight" },
  { token: "--color-focus", label: "focus" },
  { token: "--color-border", label: "border" },
  { token: "--color-border-subtle", label: "border-subtle" },
];

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100%",
        flex: 1,
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
        TEMPORARY verification screen — theme tokens only, not product UI.
      </p>

      <ThemeToggle />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "1rem",
        }}
      >
        {swatches.map((s) => (
          <div
            key={s.token}
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: "0.5rem",
              overflow: "hidden",
            }}
          >
            <div style={{ height: "4rem", background: `var(${s.token})` }} />
            <div
              style={{
                padding: "0.5rem",
                fontSize: "0.75rem",
                color: "var(--color-text)",
              }}
            >
              <div>{s.label}</div>
              <div style={{ color: "var(--color-text-muted)" }}>
                {s.token}
              </div>
            </div>
          </div>
        ))}
      </div>

      <a href="#" style={{ color: "var(--color-link)" }}>
        Sample link (var(--color-link))
      </a>
    </div>
  );
}

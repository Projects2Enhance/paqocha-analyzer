export type ResultsView = "list" | "analysis";

type ViewSwitchProps = {
  value: ResultsView;
  onChange: (value: ResultsView) => void;
};

const OPTIONS: { value: ResultsView; label: string }[] = [
  { value: "list", label: "List" },
  { value: "analysis", label: "Analysis" },
];

// Flat segmented control, no border/shadow — the active tab is a filled
// pill, same "state = fill, not outline" approach as everywhere else in
// this component tree (see DESIGN.md's minimalism note under KaraokePlayer).
export function ViewSwitch({ value, onChange }: ViewSwitchProps) {
  return (
    <div
      role="tablist"
      aria-label="Results view"
      className="paqocha-view-switch"
      style={{ display: "inline-flex", gap: "0.25rem" }}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={`paqocha-view-switch-tab${
            value === option.value ? " is-active" : ""
          }`}
        >
          {option.label}
        </button>
      ))}

      <style>{`
        .paqocha-view-switch-tab {
          border: none;
          background: transparent;
          color: var(--color-text-muted);
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 0.4rem 0.85rem;
          border-radius: 999px;
          cursor: pointer;
          transition: background 180ms ease, color 180ms ease;
        }

        .paqocha-view-switch-tab:hover:not(.is-active) {
          background: var(--color-border-subtle);
        }

        .paqocha-view-switch-tab.is-active {
          background: var(--color-primary);
          color: var(--color-on-primary);
        }
      `}</style>
    </div>
  );
}

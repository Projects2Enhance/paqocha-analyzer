type MorphemeType = "root" | "suffix";

type Morpheme = {
  text: string;
  type: MorphemeType;
  gloss: string;
  meaning: string;
};

type WordAnalysisData = {
  word: string;
  translationEn: string;
  translationEs: string;
  morphemes: Morpheme[];
};

// Hardcoded demo analysis — a first pass at the "Analysis" tab's shape, see
// web/DESIGN.md -> Components -> WordAnalysis. "mikhusqaña" is a real word
// from this same loaded example's transcript (public/example/metadata.json:
// "...ña mikhusqaña uywa hampiyta qallariq kayku."), but this specific
// root/suffix breakdown is reconstructed from general Southern Quechua
// morphology, not verified against Puno/Collao usage by a native
// speaker — same caveat as QUECHUA_WORDS in SearchBar.
// [TO BE DEFINED]: a real morphosyntactic analysis backend to replace this,
// most likely keyed off the word currently active in the karaoke transcript.
const EXAMPLE_ANALYSIS: WordAnalysisData = {
  word: "mikhusqaña",
  translationEn: "had already eaten",
  translationEs: "ya había comido",
  morphemes: [
    {
      text: "mikhu",
      type: "root",
      gloss: "eat",
      meaning: "Verb root — “to eat.”",
    },
    {
      text: "-sqa",
      type: "suffix",
      gloss: "perfect · narrative past",
      meaning:
        "Marks a completed action the speaker experienced or is recounting — roughly “having eaten.”",
    },
    {
      text: "-ña",
      type: "suffix",
      gloss: "already",
      meaning: "Common discourse particle — “already / by then.”",
    },
  ],
};

const TYPE_COLOR: Record<MorphemeType, { bg: string; fg: string }> = {
  root: { bg: "var(--color-gloss-root)", fg: "var(--color-on-primary)" },
  suffix: { bg: "var(--color-gloss-suffix)", fg: "var(--color-on-highlight)" },
};

export function WordAnalysis() {
  const { word, translationEn, translationEs, morphemes } = EXAMPLE_ANALYSIS;

  return (
    <div className="flex flex-col gap-6 min-h-0 overflow-y-auto">
      <div>
        <div
          aria-label={word}
          style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}
        >
          {morphemes.map((morpheme, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                padding: "0.3rem 0.6rem",
                borderRadius: "0.5rem",
                background: TYPE_COLOR[morpheme.type].bg,
                color: TYPE_COLOR[morpheme.type].fg,
                fontSize: "1.4rem",
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              {morpheme.text}
            </span>
          ))}
        </div>
        <p
          style={{
            margin: "0.7rem 0 0",
            fontSize: "0.85rem",
            color: "var(--color-text-muted)",
          }}
        >
          “{translationEn}” · “{translationEs}”
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {morphemes.map((morpheme, i) => (
          <div key={i} style={{ display: "flex", gap: "0.65rem" }}>
            <span
              aria-hidden="true"
              style={{
                width: "0.55rem",
                height: "0.55rem",
                marginTop: "0.4rem",
                borderRadius: "999px",
                background: TYPE_COLOR[morpheme.type].bg,
                flexShrink: 0,
              }}
            />
            <div>
              <p style={{ margin: 0, fontSize: "0.95rem" }}>
                <span
                  style={{ color: TYPE_COLOR[morpheme.type].bg, fontWeight: 700 }}
                >
                  {morpheme.text}
                </span>{" "}
                <span style={{ color: "var(--color-text-muted)" }}>
                  — {morpheme.gloss}
                </span>
              </p>
              <p
                style={{
                  margin: "0.2rem 0 0",
                  fontSize: "0.85rem",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.45,
                }}
              >
                {morpheme.meaning}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

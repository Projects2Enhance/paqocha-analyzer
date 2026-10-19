# Paqocha Analyzer — Project Context

## What it is

Paqocha Analyzer is an open, login-free web platform for Puno Quechua (Quechua
Collao, Puno, Peru). It works like a "YouGlish on steroids" for Quechua: a
user searches a word and finds real audio clips of native speakers where that
word is actually used, so they can hear it spoken.

## Who it's for

People learning Quechua, and teachers/educators. It is an educational tool
with real-world impact; morphosyntactic analysis of spoken Quechua is its key
differentiator from a plain audio/translation lookup.

## Scope

**Includes:**
- Searching a word across a dataset of real native-speaker audio.
- Playing matching audio clips with their transcription, Spanish
  translation, and timestamps.
- Opening a morphosyntactic analysis of a word or a full phrase (root,
  suffixes, glosses) for full usage context.

**Does NOT include (for now):**
- User accounts, login, or any personalization tied to an identity.
- User-generated content (comments, uploads, corrections) — not addressed in
  this phase.
- [TO BE DEFINED] Any functionality beyond search → listen → read → analyze.

## Dataset model (conceptual)

The dataset is owned by the team. Each audio item conceptually has:
- An audio recording of a real speaker.
- A Quechua transcription.
- A Spanish translation.
- Timestamps (aligning audio to transcription).
- A morphosyntactic analysis: root, suffixes, glosses.

No concrete schema, field names, or storage format are defined yet — see
"Pending decisions" below.

## Primary user flow

1. Search a word.
2. See matching audio clips where that word occurs.
3. Listen to how it's pronounced and used.
4. Read the Spanish translation.
5. Open the morphosyntactic analysis of the word, or of the whole phrase, for
   full context and usage insight.

## High-level architecture

- A single Next.js application (App Router, TypeScript) lives in `web/` and
  covers both the UI and the server layer — there is no separate backend,
  no database, and no per-request analysis: everything the client needs is
  precomputed offline (see `data/README.md`) into static JSON.
- **Audio**: hosted in the `paqocha-audio` Cloudflare R2 bucket, served
  publicly via its CDN (`https://cdn-paqocha.iampol.dev/audios/<file>`).
  The client references it directly as a plain `<audio src>` — no fetch,
  no CORS requirement.
- **Transcriptions, translations, and morphosyntactic analysis**: not in a
  database or search engine. A one-time offline pipeline
  (`data/scripts/`) turns the raw corpus + a colleague's inverted index +
  forced-alignment timestamps into static JSON shipped with the app
  (`web/public/data/{metadata,search-index}.json`,
  `web/public/data/clips/<audio_id>.json`): a lean catalog + search index
  fetched once, and one self-contained per-clip file (alignment + full
  word-by-word analysis) fetched lazily only for the active match. See
  `web/DESIGN.md` -> Components -> KaraokePlayer for the fetch strategy.

## Principles

- Quechua is a living language: the platform features speakers of today, not
  a historical or folkloric framing.
- Exclusive focus on Puno Quechua (Collao); avoid imagery or references tied
  to other cultures, regions, or countries.
- Tagline (Spanish, product-facing): "Escucha. Analiza. Entiende." ("Listen.
  Analyze. Understand.")
- Planned hero: a short, looping video of a face. [TO BE DEFINED] — pending
  confirmation that the subject is a person from Puno, with their permission.

## Language note

Platform UI content is in Spanish (switched from an initial English pass once
the real morphosyntactic analysis data — sourced in Spanish, see "Dataset
model" above — made Spanish the natural fit for the whole interface, not just
the tagline). Quechua words/transcripts themselves are never translated or
altered. [TO BE DEFINED] whether a Quechua UI option is introduced later.

## Pending decisions

- [TO BE DEFINED] Hero video subject and consent.

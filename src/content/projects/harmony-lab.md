---
title: Harmony Lab
summary: Interactive harmony workspace for musicians, with a deterministic music theory engine in Java, a voice-leading optimizer, explained chord suggestions, an improvisation mode and in-browser playback.
stack: [Java 21, Spring Boot, PostgreSQL, Flyway, JPA, React, TypeScript, Tone.js, Testcontainers, Docker Compose, GitHub Actions]
repo: https://github.com/matisdpz/harmony-lab
cover: ../../assets/projects/harmony-lab/workspace.png
coverAlt: Harmony workspace with a chord progression, piano keyboard, chord inspector and Roman numeral analysis
order: 2
---

## The problem

As a pianist, I often want to try alternatives to a chord, see how the voices move into
the next one, and hear the result right away. Most tools either just play chords or show
theory without any context. I wanted one workspace where a progression can be built,
analysed, re-voiced and heard, with every result explained.

All the music theory is computed by deterministic code that I can test and explain.
The application does not depend on any external service.

## What it does

- Builds a chord progression from symbols (`Dm7`, `G/B`, `F#m7b5`) or pickers. Chords can be
  edited, reordered, duplicated and played, with undo and redo.
- Highlights the selected chord on an interactive piano keyboard, with the root marked and
  notes spelled correctly (E7 contains G#, not Ab).
- Analyses the progression in a chosen key: Roman numerals, diatonic or borrowed chords,
  secondary dominants, cadences and voice movement. Each statement is labelled as a fact or
  a stylistic heuristic.
- Ranks voicings of the next chord by voice-leading cost, and re-voices the whole
  progression to minimise movement.
- Suggests alternative chords for four goals (smooth voice leading, stronger resolution,
  diatonic substitutes, more colour), each with a score breakdown and reasons.
- Loops preset or custom progressions for improvisation. For the chord that is sounding,
  the keyboard shows the chord tones, the safe scale notes and the tension notes (in red),
  each with a reason. Notes can be played along with the mouse or the computer keyboard.
- Saves projects in PostgreSQL.

## Architecture

```
browser (React + Tone.js) ──▶ nginx (static app + /api) ──▶ Spring Boot API
                                                             │ theory/  stateless endpoints
                                                             │ project/ persistence (JPA)
                                                             │ music/   pure domain engine
                                                             ▼
                                                        PostgreSQL 17 (Flyway)
```

The backend is a modular monolith. The `music` package has no dependency on Spring, HTTP,
the database or audio. One `docker compose up` command starts the database, the API and the
frontend.

## Engineering decisions

**One source of musical truth.** Chords, keys, spelling and analysis exist only in the
Java domain, and the frontend asks the API instead of duplicating theory in TypeScript. The
cost is a short request per edit, handled with per-chord loading states that ignore stale
responses.

**Structured chords, not strings.** A chord is a root, a quality and an inversion. Text is
parsed and formatted in a single place. Notes are spelled letter by letter, so a Db minor
chord is Db–Fb–Ab.

**Voice leading with dynamic programming.** Voices are matched in pitch order, and a
dynamic program handles chords with different numbers of notes. A Viterbi-style search then
picks voicings for the whole progression by minimising the total cost, which a test checks
against a greedy chord-by-chord choice. The cost function is simple, documented and
hand-tuned: movement, extra cost for leaps, voice overlaps and parallel fifths.

**Explainable heuristics.** Suggestion scores are weighted sums of measured features. The
breakdown is returned with each result, and the interface presents scores as ranking aids,
not measures of musical quality. When no candidate is convincing, the engine says so instead
of filling the list.

**No silent data loss.** Chord order is an explicit column in the primary key. Updates carry
the version that was loaded, so an outdated save returns a conflict instead of overwriting
newer changes. All input is validated against the music model before anything is written,
in a single transaction.

**Improvisation guide as explicit rules.** For each chord, the key's scale is adjusted to
the chord's own notes (E7 in A minor turns G into G#). Notes a semitone above a chord tone,
the altered tensions of dominant chords and the blue notes are shown as tensions. These are
conventions from jazz and pop teaching, so each note comes with its reason rather than a
verdict.

**Audio as a singleton.** Tone.js is loaded on the first click (browsers block audio
before a user gesture), a single engine exists per page, and progressions are scheduled on
the transport so tempo changes apply during playback.

## Testing and CI

- 191 backend unit tests for the domain (chords, intervals, keys, Roman numerals, voice
  leading, suggestions, improvisation guide), services and controllers.
- 12 integration tests against a real PostgreSQL database using Testcontainers: ordered
  persistence, validation errors, conflicts, atomic updates and constraints.
- 42 frontend tests with Vitest and React Testing Library, covering the editor, keyboard
  highlights, reordering, form validation, API errors and the improvisation page.
- GitHub Actions runs lint, type checking, all tests and the Docker image builds on every push.

## Limitations

- Single-user and meant to run locally: there is no authentication.
- The theory scope is major and natural minor keys and 15 chord types, with no extended or
  altered chords.
- The sound is a synthesized electric-piano-like voice, not a sampled piano.

## Screenshots

![Improvisation mode with chord tones, safe notes and tension notes on the keyboard](../../assets/projects/harmony-lab/improvisation.png)

![Alternative progressions compared with the current version](../../assets/projects/harmony-lab/workspace-alternatives.png)

![Voice leading explorer with ranked voicings and a motion diagram](../../assets/projects/harmony-lab/voice-leading.png)

![Chord explorer with interval structure, inversions and diatonic chords of the key](../../assets/projects/harmony-lab/chord-explorer.png)

![Progression analyzer separating facts from heuristic observations](../../assets/projects/harmony-lab/analyzer.png)

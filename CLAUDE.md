# CLAUDE.md

This file is read by Claude Code at the start of every session. It tells you
(Claude) what this project is, where things live, and how to extend it
without breaking anything.

## What this is

AP Computer Science Principles exam-prep quiz app. Single-mode quiz that
mixes 6 different interactive question types. Built for a high-school student
preparing for the AP CSP exam. Aesthetic is Fortnite-inspired (deep navy/purple
background, electric blue + hot pink + lime accents, angled clip-path
buttons, glassmorphism panels).

Stack: **Vite + React 18, vanilla CSS** (no Tailwind, no TypeScript).

## Architecture map

```
src/
  data/
    questions.json     ← THE SOURCE OF TRUTH for all questions.
                         Heavily commented. Read its _README and
                         _typeGuide before touching it.
    topics.js          ← Topic display config (name, color, short label)
  questions/
    QuestionRenderer.jsx   ← Routes by question.type
    MultipleChoiceQ.jsx    ← One file per question type
    BooleanQ.jsx
    BinaryQ.jsx
    BugHuntQ.jsx
    TraceQ.jsx
    BuildLoopQ.jsx
  screens/
    HomeScreen.jsx     ← Length picker (5/10/20/40)
    QuizScreen.jsx     ← The quiz loop, calls QuestionRenderer
    ResultScreen.jsx   ← Score ring, per-topic bars, missed review
  lib.js               ← shuffle(), pickQuestions(), evaluateAnswer(), LETTERS
  App.jsx              ← Top-level routing between the three screens
  main.jsx             ← React entry
  styles.css           ← All styling. CSS variables in :root for theming.
scripts/
  validate-questions.mjs  ← npm run validate-questions
```

## Common tasks

### Adding new questions (the 90% case)

1. Open `src/data/questions.json`.
2. Read the `_typeGuide` section in that file — it contains the full schema
   and an example for every question type. **The schema is authoritative.**
3. Append new objects to the `questions` array. Optionally add a
   `{ "_section": "..." }` divider before a new group; runtime ignores them.
4. Run `npm run validate-questions` and fix any errors before committing.

Topic distribution philosophy: weight toward the student's weak areas
(currently procedures, iteration, data, efficiency, debugging). The
`_topicWeighting_doc` field in questions.json captures the current target.

### Adding a brand-new question type

This is more invasive. Touch all of:

1. `src/data/questions.json` → add a new entry under `_typeGuide` with
   `_when_to_use`, `_schema`, `_authoring_tips`, `_example`.
2. `src/questions/<NewType>Q.jsx` → create the component. Mirror the
   prop signature of the existing ones:
   `{ q, locked, picked, onPick OR onSubmit }`. Use `qz-fadein` on the root.
3. `src/questions/QuestionRenderer.jsx` → import and add a case.
4. `src/lib.js` → extend `evaluateAnswer()` so a submission is scored.
5. `src/screens/ResultScreen.jsx` → extend `describeMissed()` so the
   missed-review card shows useful "Your answer / Correct" text.
6. `scripts/validate-questions.mjs` → add a case to the switch with the
   schema rules.
7. `src/styles.css` → add styles, prefixed with `qz-` and following the
   existing token system (var(--blue), var(--ink), etc.).

### Restyling

Don't replace the design system. Tweak `:root` CSS variables in
`src/styles.css` first — colors, fonts, clip-path shapes are all there.
The clip-path uses `polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%)`
to give buttons their angled Fortnite cut. Match this if adding buttons.

Fonts in use: Russo One (display), Chakra Petch (UI), JetBrains Mono (code).
All loaded from Google Fonts via `@import` at the top of styles.css.

## Commands

```bash
npm install               # first time
npm run dev               # local dev server with hot reload (port 5173)
npm run build             # production build to dist/
npm run preview           # preview the production build
npm run validate-questions  # check questions.json schema compliance
```

## Conventions

- **JavaScript, not TypeScript.** Don't introduce TS — keep the contributor
  bar low (a high-schooler is going to be reading this).
- **CSS classes are prefixed `qz-`.** All of them. Don't use Tailwind.
- **JSON keys starting with `_` are documentation.** Runtime ignores them.
  Use `_doc`, `_note`, `_section`, etc. liberally — the JSON is meant to be
  self-teaching.
- **Question types are closed unless explicitly extended.** If a feature
  request can be served by an existing type with new questions, do that
  first; don't reach for a new type.
- **No external state libraries.** React's useState is sufficient.
- **No router library.** The single-page screen state in App.jsx is enough.
- **Mobile must work.** The student studies on his phone. Test at 360px wide.

## What NOT to do

- Don't break the existing question schemas. Existing questions use them.
- Don't rename topic keys. The TOPICS object in `src/data/topics.js` and
  the `_meta.topics` keys in questions.json must stay aligned.
- Don't switch to fetching questions.json at runtime — `import` is fine and
  Vite handles it. Runtime fetch adds complexity for no win.
- Don't add gamification (XP, streaks, levels). The product decision was
  explicitly to strip these and let dopamine come from the content.
- Don't reproduce copyrighted material in questions (real exam questions,
  textbook excerpts verbatim, etc.). Always paraphrase.

## When in doubt

Read `src/data/questions.json` from top. The `_README`, `_meta`, and
`_typeGuide` sections together explain almost everything you need to know
about extending the bank.

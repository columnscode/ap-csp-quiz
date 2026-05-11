# AP CSP Study Drop

A Fortnite-styled quiz app for AP Computer Science Principles exam prep.
Single-mode quiz with mixed interactive question types: multiple choice,
code traces, binary bit-flip, bug hunts, boolean rapid-fire, and code-block
reordering.

## Setup

You need [Node.js](https://nodejs.org/) 18 or newer.

```bash
npm install        # install dependencies (first time only)
npm run dev        # start the dev server, opens http://localhost:5173
```

That's it. Edits hot-reload immediately.

To build a static version you can host or serve from a phone over the LAN:

```bash
npm run build      # output goes to dist/
npm run preview    # preview the built output locally
```

### Windows note

PowerShell users: the commands above work as-is in PowerShell or
Command Prompt. If you're using WSL, run from a WSL shell.

## Working with Claude Code

This project is set up to work well with [Claude Code](https://docs.claude.com/en/docs/claude-code).
The `CLAUDE.md` file in the repo root tells Claude about the project so it
can extend the question bank or features without breaking conventions.

```bash
# install Claude Code if you haven't
npm install -g @anthropic-ai/claude-code

# from the project root
claude
```

Useful prompts to give Claude Code:

> "Add 15 more multiple_choice questions about iteration, focusing on
> nested loops. Validate when done."

> "Add a build_loop question for the binary search pattern."

> "Add 5 more trace questions targeting the data topic. Read the existing
> trace questions first to match the style."

> "I want a new question type called `match_pairs` that shows a pair of
> columns and the student drags lines between them. Plan the changes
> across questions.json, components, the renderer, lib.js, the result
> screen, and the validator. Show me the plan before you start."

After any question-bank change, always:

```bash
npm run validate-questions
```

## File map at a glance

| Where | What |
|---|---|
| `src/data/questions.json` | The question bank. Heavily commented — read `_README` and `_typeGuide`. |
| `src/data/topics.js` | Topic display config (name, color). |
| `src/questions/` | One file per question-type renderer. |
| `src/screens/` | Home / Quiz / Result screens. |
| `src/styles.css` | All theming. CSS variables at top. |
| `scripts/validate-questions.mjs` | `npm run validate-questions`. |
| `CLAUDE.md` | Instructions Claude Code reads on startup. |

## Adding questions yourself (no Claude Code)

Open `src/data/questions.json`, scroll to the `_typeGuide` section to see
the schema and an example for each type, then add new objects to the
`questions` array. Run `npm run validate-questions` to check. Save and the
dev server will hot-reload.

## Question types

| Type | What it tests | Best for |
|---|---|---|
| `multiple_choice` | Conceptual recall, short code reading | Default for any topic |
| `trace` | Step-by-step execution understanding | Loops, swaps, accumulators |
| `binary` | Place values + bit patterns | Binary topic only |
| `bug_hunt` | Identifying and naming bugs | Debugging topic |
| `boolean` | Truth-table evaluation under operator precedence | Boolean topic |
| `build_loop` | Recognizing common code patterns | Iteration, procedures |
| `match_pairs` | 1:1 mappings (term ↔ definition, algorithm ↔ Big-O) | Concept consolidation |
| `fill_in_blank` | Precise syntax recall | Operators, function calls, accumulator patterns |
| `click_to_locate_bug` | Quick bug-spotting | Debugging when category isn't the point |
| `order_steps` | Sequencing concepts | Sorting Big-O, ordering algorithm steps |

## Distribution

The bank currently weights toward the student's identified weak areas:
procedures, iteration, data abstraction, efficiency, debugging. Stronger
topics (media, internet, security, impact) carry less. Adjust as the
student's weaknesses shift.

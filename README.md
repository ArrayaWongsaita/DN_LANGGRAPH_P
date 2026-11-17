# LangGraph Practice Course (TypeScript)

A hands-on course for people who have **never built an LLM app**. Each lesson is tiny (one concept, 1-3 gaps to fill) so you finish it, feel the win, and move on. Lesson text is in Thai.

**Status:** Level 1 draft (lessons 01-19) is ready for review; the real-LLM `run.ts` files have not all been run live yet. **Level 0** (raw `fetch`, lessons 0-01..0-06) is drafted in order; its real-LLM `run.ts` files have not all been run live yet. **Level 2** (2-01..2-27: memory, tools/agents, human-in-the-loop, streaming, reliability) is drafted; the rest is planned in `docs/superpowers/plans/2026-11-17-langgraph-course-level-2.md`. **Level 3** (3-01..3-35: advanced graphs, long-term memory, workflow patterns, multi-agent, durability, middleware, functional API, capstone) is drafted; plan in `docs/superpowers/plans/2026-11-17-langgraph-course-level-3.md`; none of its lessons has been run against a real LLM yet. `legacy/` holds an earlier build kept only for reuse.

**Reading order:** want to see what an LLM call really is? Start at Level 0 (`0-01`). Want to go straight to LangChain/LangGraph? Start at Level 1 (`01`; lesson 02 covers `.env` setup).

## Quick start

Requirements: Node.js 22.12+ (developed on Node 26).

```bash
pnpm install
cp .env.example .env      # then put your GROQ_API_KEY in .env
pnpm test:lesson 01    # Level 1, lesson 01 (red at first, that is normal)
pnpm test:lesson 0-01  # Level 0, lesson 01 (raw fetch)
pnpm test:lesson 2-01  # Level 2, lesson 01 (chat memory)
pnpm test:lesson 3-01  # Level 3, lesson 01 (input/output schemas)
```

Lesson checkers use a fake model, so they need **no key**. Only `pnpm lesson NN` (real LLM calls) does.

## How a lesson works

You write the code; the test file is only the checker.

| File | What it is |
|---|---|
| `README.md` | teaches the concept (Thai) |
| `<topic>.ts` | almost-complete code with gaps marked `// 👉 ข้อ N` (stubbed with `todo(N)`) |
| `<topic>.test.ts` | the checker: red until your gaps are filled, then green. Do not edit |
| `run.ts` | (some lessons) run against the real LLM: `pnpm lesson NN` |
| `solution/` | the finished version, peek only when stuck |

```bash
pnpm test:lesson 08    # check one lesson (a bare number means Level 1)
pnpm lesson 08         # run it against the real LLM
pnpm test:lesson 0-01  # Level 0 lessons use a 0- prefix
```

## Switching LLM provider or model

`src/env.ts` reads and validates `.env` once with zod (`import { env } from "@src/env"`; a wrong value gives one Thai message listing every problem). Every lesson gets its model from `src/llm.ts` (`getLLM()` returns a LangChain `BaseChatModel`, built from that validated env). Change provider or model in `.env` only:

| Variable | Meaning |
|---|---|
| `LLM_PROVIDER` | `groq` (default) or `ollama`. Add another with one table row in `src/llm.ts` |
| `LLM_MODEL` | model name; empty = the provider's default |
| `GROQ_API_KEY` | key for the `groq` provider (each learner uses their own; at least 10 characters; only the selected provider's key is required) |
| `OLLAMA_API_KEY`, `OLLAMA_BASE_URL` | for the `ollama` provider (base URL has **no** `/api` suffix) |

After changing provider or model, run `pnpm check:llm`. It makes 4 live calls and reports whether basic calls, streaming, tool calling and structured output work. Findings for tested models are in `docs/notes/provider-findings.md`.

## Troubleshooting

- **401**: wrong or missing key for the provider in `LLM_PROVIDER` (no quotes or extra spaces in `.env`).
- **404 / model_not_found**: the model name does not exist or your account has no access; change `LLM_MODEL`.
- **429**: rate limit; wait and retry.
- **`fetch failed`**: network problem.

## For maintainers

```bash
pnpm test                  # src + scripts tests (green on a fresh checkout)
pnpm check:solutions   # every solution/ must pass its checker
pnpm check:starters    # every starter must FAIL its checker (no lesson is solved already)
pnpm lint:lessons      # structure rules; pnpm lint:lessons:strict also requires contiguous numbering
pnpm typecheck
```

New lessons start from `scripts/lesson-template/`.

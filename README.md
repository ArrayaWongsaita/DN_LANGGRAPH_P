# LangGraph Practice Course (TypeScript)

A hands-on course for people who have **never built an LLM app**. Each lesson is tiny (one concept, 1-3 gaps to fill) so you finish it, feel the win, and move on. Lesson text is in Thai.

**Status:** Level 1 (lessons 01-20, single-file format) is ready for review; every solution was run against the real model. **Level 0** (raw `fetch`, lessons 0-01..0-06, single-file format like Level 1) is ready for review; every solution was run against a real model. **Level 2** (2-01..2-27: memory, tools/agents, human-in-the-loop, streaming, reliability, single-file format like Level 1) is ready for review; every solution was run against a real model; the rest is planned in `docs/superpowers/plans/2026-11-17-langgraph-course-level-2.md`. **Level 3** (3-01..3-35: advanced graphs, long-term memory, workflow patterns, multi-agent, durability, middleware, functional API, capstone) is ready for review (single-file format like Levels 1 and 2); plan in `docs/superpowers/plans/2026-11-17-langgraph-course-level-3.md`; every solution was run against a real model. **Level 4** (4-01..4-26: modern durability, testing and evals, official multi-agent patterns, safety and context engineering, RAG, MCP, Postgres, capstone) is drafted and passes the solution/starter/lint/typecheck checks; design in `docs/superpowers/plans/2026-11-17-langgraph-course-level-4-design.md`. Checkers use fakes (no key, no database); 4-22 spawns a local MCP stdio server; 4-24 `pnpm lesson 4-24` needs `DATABASE_URL` for a real Postgres. Doc cross-check: `docs/notes/docs-review-2026-11-17.md`; coverage vs official docs: `docs/notes/coverage-audit-2026-11-17.md`. **Level 5** (5-01..5-25: real retrieval with pgvector and embeddings, event streaming, `langgraph dev` serving, checkpoint housekeeping/encryption, Functional API depth, SQL agent, MCP over HTTP, more middleware, context engineering, integration testing, Pregel runtime, capstone knowledge assistant, custom stream channels and framework-agnostic frontend stream state) is drafted and passes the solution/starter/lint/typecheck checks; design in `docs/superpowers/plans/2026-11-17-langgraph-course-level-5-design.md`. Checkers need no key, database or network; `run.ts` files use the Docker Postgres, the embedding key and the model from `.env`. `legacy/` holds an earlier build kept only for reuse.

## Levels at a glance

| Level | Lessons | Focus | Lesson ids |
|---|---|---|---|
| 0 | 6 | what an LLM call really is (raw `fetch`) | `0-01`..`0-06` |
| 1 | 20 | LangChain + LangGraph basics, mini assistant | `1-01`..`1-20` |
| 2 | 27 | memory, tools/agents, human-in-the-loop, streaming, reliability | `2-01`..`2-27` |
| 3 | 35 | advanced graphs, long-term memory, workflow and multi-agent patterns, middleware, capstone | `3-01`..`3-35` |
| 4 | 26 | production: durability, testing/evals, official multi-agent patterns, safety, RAG, MCP, Postgres, capstone | `4-01`..`4-26` |
| 5 | 25 | retrieval and serving: pgvector, streaming events, `langgraph dev`, SQL agent, MCP over HTTP, Pregel runtime, capstone | `5-01`..`5-25` |

**Reading order:** want to see what an LLM call really is? Start at Level 0 (`0-01`). Want to go straight to LangChain/LangGraph? Start at Level 1 (`1-01`; lesson `1-02` covers `.env` setup). Levels build on each other: finish 1 → 2 → 3 → 4 → 5 in order.

## Quick start

Requirements: Node.js 22.12+ (developed on Node 26).

```bash
pnpm install
cp .env.example .env      # then put your GROQ_API_KEY in .env
pnpm lesson 1-01         # Level 1, lesson 01 (single file: fill the gaps, then run it)
pnpm lesson 0-01       # Level 0, lesson 01 (raw fetch; single file)
pnpm lesson 2-01       # Level 2, lesson 01 (chat memory; single file, like Level 1)
pnpm lesson 3-01       # Level 3, lesson 01 (input/output schemas; single file)
pnpm test:lesson 4-01  # Level 4, lesson 01 (node timeout)
pnpm test:lesson 5-01  # Level 5, lesson 01 (embedding contract)
```

Levels 0-3 lessons are single files that call the real LLM (`pnpm lesson 0-NN` .. `pnpm lesson 3-NN`), so you need a key (lessons that do not use an LLM, such as 2-08 or most of Level 3's graph mechanics, run offline). Levels 4 and 5 lessons have checkers (`pnpm test:lesson`) that use a fake model and need **no key**; only their `pnpm lesson NN` runs do.

## How a lesson works

You write the code; the lesson tells you whether it works. There are two formats.

**Levels 0, 1, 2 and 3 (single file).** Open the one `.ts` file in the lesson, fill the `// 👉 ข้อ N` gaps (stubbed with `todo(N)`), and run it. It prints the result and `✅` / `❌` checks. The checks sit at the bottom of the file under a banner. The model comes from `lessons/level-1-basics/02-llm-config/llm.ts` (you choose the provider there) and the validated `.env` values from lesson 01.

| File | What it is |
|---|---|
| `README.md` | teaches the concept (Thai) |
| `<topic>.ts` | the file you edit and run, with gaps marked `// 👉 ข้อ N` |
| `solution/<topic>.ts` | the finished version, peek only when stuck |

```bash
pnpm lesson 1-03       # run Level 1 lesson 03 (always <level>-<lesson>)
pnpm lesson 2-03       # run Level 2 lesson 03
```

**Levels 4 and 5 (checker).**

| File | What it is |
|---|---|
| `README.md` | teaches the concept (Thai) |
| `<topic>.ts` | almost-complete code with gaps marked `// 👉 ข้อ N` (stubbed with `todo(N)`) |
| `<topic>.test.ts` | the checker: red until your gaps are filled, then green. Do not edit |
| `run.ts` | (some lessons) run against the real LLM: `pnpm lesson NN` |
| `solution/` | the finished version, peek only when stuck |

```bash
pnpm test:lesson 4-01  # check one lesson (ids are always <level>-<lesson>)
pnpm lesson 2-01       # run it against the real LLM
```

## Switching LLM provider or model

Levels 1-3 pick the provider in `lessons/level-1-basics/02-llm-config/llm.ts` (uncomment one block). The rest of this section describes `src/llm.ts`, which Levels 4 and 5 use.

`src/env.ts` reads and validates `.env` once with zod (`import { env } from "@src/env"`; a wrong value gives one Thai message listing every problem). Every lesson gets its model from `src/llm.ts` (`getLLM()` returns a LangChain `BaseChatModel`, built from that validated env). Change provider or model in `.env` only:

| Variable | Meaning |
|---|---|
| `LLM_PROVIDER` | `groq` (default), `google`, `deepseek` or `opencode`. Add another with one table row in `src/llm.ts` |
| `LLM_MODEL` | model name; empty = the provider's default |
| `GROQ_API_KEY` | key for the `groq` provider (each learner uses their own; at least 10 characters; only the selected provider's key is required) |
| `DEEPSEEK_API_KEY` | key for the `deepseek` provider (DeepSeek API through its OpenAI-compatible endpoint, default model `deepseek-flash`) |
| `OPENCODE_GO_KEY` | key for the `opencode` provider (OpenCode Go, default model `deepseek-v4.1-flash`) |
| `GOOGLE_API_KEY` | key for the `google` provider (Gemini, default model `gemini-flash-lite-latest`) and for embeddings in Level 5. The free tier is limited to about 15 requests per minute, so run lessons one at a time |

Note: Level 0 lessons (raw `fetch`, read the provider through `describeProvider()`) send only `Authorization` and `Content-Type`, so they work with `groq`, `google` (Google's OpenAI-compatible endpoint) and `deepseek`; the `opencode` provider additionally needs an `x-opencode-session` header that only `getLLM()` adds (Levels 1-3).

After changing provider or model, run `pnpm check:llm`. It makes 4 live calls and reports whether basic calls, streaming, tool calling and structured output work. Findings for tested models are in `docs/notes/provider-findings.md`.

TypeScript syntax that may look odd (`!`, `as`, `??`): see `docs/typescript-notes.md`.

## Database for real-Postgres lessons (Docker)

Lessons that need a real database (4-24 and Level 5) use the Postgres + pgvector container in `docker-compose.yml`:

```bash
docker compose up -d --wait   # start (port 5434)
docker compose down           # stop, data kept
docker compose down -v        # stop and delete data
```

`.env.example` already has the matching `DATABASE_URL`. The credentials are for local study only. Lesson checkers never need the database.

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

# LangGraph Practice Course (TypeScript)

A hands-on course for people who have **never built an LLM app**. Each lesson is tiny (one concept, 1-3 gaps to fill) so you finish it, feel the win, and move on. Lesson text is in Thai.

**Status:** pilot. Three lessons exist (01, 08, 14) so the format can be reviewed. The rest of Level 1 and Levels 2-3 are planned (see `docs/superpowers/specs/`). `legacy/` holds an earlier build kept only for reuse.

## Quick start

Requirements: Node.js 22.12+ (developed on Node 26).

```bash
pnpm install
cp .env.example .env      # then put your GROQ_API_KEY in .env
pnpm test:lesson 01    # start with lesson 01 (red at first, that is normal)
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
pnpm test:lesson 08    # check one lesson
pnpm lesson 08         # run it against the real LLM
```

## Switching LLM provider or model

Every lesson gets its model from `src/llm.ts` (`getLLM()` returns a LangChain `BaseChatModel`). Change provider or model in `.env` only:

| Variable | Meaning |
|---|---|
| `LLM_PROVIDER` | `groq` (default) or `ollama`. Add another with one table row in `src/llm.ts` |
| `LLM_MODEL` | model name; empty = the provider's default |
| `GROQ_API_KEY` | key for the `groq` provider (each learner uses their own) |
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
pnpm lint:lessons      # structure rules; add :strict to require contiguous numbering
pnpm typecheck
```

New lessons start from `scripts/lesson-template/`.

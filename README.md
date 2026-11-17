# LangGraph Practice Course (TypeScript)

A hands-on course for people who have **never built an LLM app**. Each lesson is tiny (one concept, 2-5 exercises) so you finish it, feel the win, and move on. Lesson text is in Thai.

**Status:** Level 1 (lessons 01-26) is available. Levels 2 and 3 are planned (see `docs/superpowers/specs/`).

## Quick start

Requirements: Node.js 22+ (developed on Node 26).

```bash
npm install
cp .env.example .env      # then put your OLLAMA_API_KEY in .env
npm test                  # your exercises (shown as "todo" until you write them)
```

Get an API key at https://ollama.com/settings/keys. Lessons that only use the fake model (`fakeLLM`) work **without** a key.

## How a lesson works

Each lesson lives in `lessons/level-N-*/NN-slug/`:

| File | What it is |
|---|---|
| `README.md` | what you learn (Thai) |
| `<topic>.ts` | the worked example code |
| `<topic>.test.ts` | your exercises: turn each `test.todo` into a real `test` |
| `run.ts` | (some lessons) run against the real LLM with `npm run lesson NN` |
| `solution/` | the finished version, peek only when stuck |

```bash
npm test -- lessons/level-1-basics/03-first-llm-call   # one lesson
npm run lesson 03                                      # run a lesson with the real LLM
```

## One place to change the LLM provider

Every lesson gets its model from `src/llm.ts` (`getLLM()` returns a LangChain `BaseChatModel`). To switch from Ollama Cloud to another provider, edit that one file; no lesson changes. Tests use `src/fakeLLM.ts` so they are deterministic and need no network.

Environment variables (`.env`):

| Variable | Meaning |
|---|---|
| `OLLAMA_API_KEY` | required for real LLM calls |
| `OLLAMA_MODEL` | model name (default `gpt-oss:120b`; cloud models can be retired, change here if needed) |
| `OLLAMA_BASE_URL` | default `https://ollama.com` (**no `/api` suffix**) |

## Troubleshooting

- **401**: wrong or missing `OLLAMA_API_KEY` (no quotes or extra spaces in `.env`).
- **404**: `OLLAMA_BASE_URL` ends with `/api`, or the model name does not exist.
- **429**: rate limit; wait and retry.
- Lesson 06 explains how to read these errors.

## For maintainers

```bash
npm run check:solutions   # every solution/ must pass
npm run lint:lessons      # structure rules (README, solution/, todo-only exercises, numbering)
npm run typecheck
```

Tested with: `@langchain/langgraph` 1.7.5, `@langchain/core` 1.4.1, `@langchain/ollama` 1.3.0, `zod` 4.6.7, `vitest` 4.1.12, TypeScript 5.9.3, Node 26.

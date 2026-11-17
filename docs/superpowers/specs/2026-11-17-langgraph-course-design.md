# LangGraph Practice Course (TypeScript) — Design

Date: 2026-11-17
Status: draft, awaiting approval

## Intent and why

A hands-on, exercise-based course repo that teaches LangGraph (JS/TS) to people who have **never built an LLM app**. It follows the format of the author's earlier course `ArrayaWongsaita/DN_JEST_SUPERTEST` (`lessons/NN-topic/`, a tiny example file plus a test file of `test.todo` exercises with Thai hints), improved.

The single most important outcome: **learners finish each lesson feeling "I did it" and dare to open the next one.** Every decision below is judged against that. Lessons are therefore as small as possible: one concept, 2-3 exercises, minutes not hours.

## Goals

- Full path from zero: set up -> call an LLM -> LangGraph core -> memory -> tools/agents -> capstone.
- ~85 lessons in 3 levels (Basics / Practical / Advanced), one concept each, ordered so each lesson only needs what earlier ones taught. Each level ends at a usable skill so learners can stop and come back.
- Coverage of current official LangGraph JS features (see Curriculum), with the Graph API as the primary teaching path.
- Learners get a clear pass/fail signal ("tests go green") without needing an API key for most lessons.
- Provider-agnostic: all lessons obtain their model from **one file**, `src/llm.ts`. Changing provider later means editing only that file.
- Lesson text, comments and hints are in **Thai** (like the original). Code identifiers and repo docs (README, this spec) are English.

## Non-goals

- Not a LangChain reference. No LangGraph Platform/Agent Server/Studio, LangSmith Fleet/Engine, Deep Agents, RAG deep-dive or evals.
- Not a Python course. TypeScript only.
- No UI/web frontend.

## Anti-goals (failure even if it "works")

- Tests that flake because LLM output varies; a learner failing a test they wrote correctly.
- A lesson that requires knowledge from a later lesson, or needs several new concepts at once.
- Lessons that leak the provider (any lesson importing `@langchain/ollama` directly).
- Setup friction that stops a beginner before lesson 1 finishes.

## Constraints

- Language/runtime: TypeScript, Node (dev machine has Node 26). Test runner: **vitest** (already installed locally; jest-like API, native TS/ESM). Use `globals: true` so tests read like the original (`test`, `expect` with no import) — builder's call to confirm.
- Already in `node_modules`: `@langchain/core` 1.4.1, `@langchain/langgraph` 1.7.5, `@langchain/langgraph-checkpoint`, `zod`, `vitest`, `typescript`. **Not installed:** `@langchain/ollama`. There is no `package.json` yet; create one pinned to the installed versions.
- **API currency:** the current docs recommend `createAgent` from the `langchain` package (not installed locally; add it) as the high-level agent. Installed `@langchain/langgraph` 1.7.5 exports `StateSchema`, `MessagesValue`, `MessagesAnnotation`, `MemorySaver`, `InMemoryStore`, `RetryPolicy`, `CachePolicy`, `entrypoint`, `Send`, `interrupt` (checked). Builder must pick ONE state-definition style as the main one (`StateSchema` vs `Annotation`) per current docs and use it consistently. Official docs have no "testing graphs" page, so the fake-LLM approach must be validated by the builder.
- Default provider: **Ollama Cloud** via `@langchain/ollama` `ChatOllama`, `baseUrl: "https://ollama.com"` (bare host, **no `/api`** suffix — it causes 404), key from `OLLAMA_API_KEY` (created at ollama.com/settings/keys). Model name from env `OLLAMA_MODEL` with a sensible default.
- **Model capabilities (important):** the Ollama Cloud docs state cloud models "currently do not support structured outputs" and that capabilities (e.g. tool calling) vary by model; free-tier/rate limits are not documented on the cloud page. The builder must choose a default model that supports tool calling, test every real-LLM lesson against it, keep real-call lessons few and cheap, and design the structured-output lesson around what actually works. Cloud models can be retired (see Ollama's model-lifecycle page), so the model name must stay configurable and the README must say how to change it.
- **Version drift:** LangChain/LangGraph APIs change. Pin exact versions in `package.json` and record "tested with" versions in the README.
- **Unverified:** whether `ChatOllama` accepts a `headers` option for `Authorization: Bearer <key>`. Builder must test this against the real API. Fallback if not: use the `ollama` package client (`new Ollama({ host, headers })`), or another auth route that still returns a `BaseChatModel`.
- Secrets: `OLLAMA_API_KEY` goes in `.env` (git-ignored) with a committed `.env.example`.

## Approaches considered

**A. LLM-first ladder (chosen).** Start by calling an LLM, then introduce LangGraph when the learner has felt why a graph helps. Matches "start from connecting an LLM"; beginners see real output early.

**B. Graph-first with a fake LLM, real LLM later (rejected).** Fast, no key needed, but defers the real LLM, which contradicts the author's wish and leaves absolute beginners learning abstractions with nothing concrete. The fake-LLM idea is kept, but only as a test technique.

**Verification style (chosen: two layers).** Alternatives were (1) test only output *shape* with real API calls, (3) no tests, run-and-compare. Chosen: graph/structure logic is tested with a **fake chat model** returning fixed answers, so tests are deterministic, fast, free and need no key. Behaviour that truly needs a real model is run by hand via `npm run lesson:<id>` and, where tested at all, only for shape (non-empty string, expected keys).

## Design

### Repo layout

```
langgraph-course/
  package.json  tsconfig.json  vitest.config.ts  .env.example  .gitignore  README.md
  src/
    llm.ts          # the ONLY file that knows the provider; exports getLLM(): BaseChatModel
    fakeLLM.ts      # helper to make a fake chat model with scripted replies (for tests)
  lessons/
    00-setup/ ... NN-topic/
      README.md          # Thai: what you will learn, 1 concept, expected result
      <topic>.ts         # tiny worked example / code under test
      <topic>.test.ts    # Thai comments, 2-3 exercises as test.todo with hints
      run.ts             # only for lessons that call a real LLM
      solution/          # same files, completed; its tests pass
```

### `src/llm.ts` contract

- Exports `getLLM(options?)` returning a LangChain `BaseChatModel` (not `ChatOllama`), so lessons code against the abstraction.
- Reads provider config from env; fails with a clear Thai error if `OLLAMA_API_KEY` is missing ("ยังไม่ได้ตั้ง OLLAMA_API_KEY ดู lesson 00").
- Header comment explains how to swap provider (replace the body, keep the return type).
- Test-only lessons import `fakeLLM` instead and never touch `getLLM`.

### Lesson format (per lesson)

- One concept; 2-3 exercises (`test.todo`), each with Thai hint ("แนวทาง") and a worked example at the top of the file, as in the original.
- Exercise ordering inside a lesson goes easy -> slightly harder; the first exercise should be almost copy-able from the example (quick win).
- Each lesson's `solution/` is verified green by CI-style script `npm run check:solutions`.
- Learner-facing commands: `npm test -- lessons/NN` (their exercises), `npm run lesson:NN` (run live, where applicable).

### Curriculum (draft, ~70 lessons in 3 levels; builder finalizes exact list)

Coverage was checked against the official LangGraph JS docs (overview, Graph API, streaming, interrupts, memory, persistence, time travel, subgraphs, functional API, multi-agent, `createAgent`). Each level is a natural stopping point: a learner who finishes a level has a working, useful skill and a reason to continue. `lessons/` is grouped as `level-1-basics/`, `level-2-practical/`, `level-3-advanced/`, with `NN-topic` inside (numbering continuous across the repo).

**Level 1 — Basics (~21): from zero to a first working graph**
- **Part 0 Setup and prerequisites (6):** install + run first test; set `OLLAMA_API_KEY` (and `.env`); first real LLM call via `getLLM()`; primer on `async/await` + Promise (every LLM call is async); primer on zod schemas; how to read errors and troubleshoot (missing key, 404 from wrong `baseUrl`, rate limit).
- **Part 1 Talking to an LLM (9):** `invoke`; system prompt; message types and order; prompt templates; few-shot examples; streaming tokens; structured output with zod (see model-capability constraint: Ollama Cloud may not support native structured output; builder picks a method that works, e.g. tool-calling based or JSON-prompt + zod parse); temperature/params; reading token usage; handling an API error (retry/timeout).
- **Level-1 mini project (1):** a small command-line "assistant" that chains what was learned (LLM call + a first graph).
- **Part 2 LangGraph core (10):** State; a node; edges + START/END; first node that calls the LLM; nodes in sequence; conditional edge; loop with a stop condition; reducers; compile + invoke; stream `values`/`updates`.

**Level 2 — Practical (~21): chatbots and agents that remember and act**
- **Part 3 Memory in a thread (7):** messages in state; checkpointer (`MemorySaver`); `thread_id`; read/update state; trim messages; summarize old messages; persistent checkpointer (`SqliteSaver` from `@langchain/langgraph-checkpoint-sqlite`, so memory survives a restart; `MemorySaver` is RAM-only).
- **Part 3b Testing your own graph (1):** how to test an LLM app deterministically with the fake model (teaches the technique the course itself uses).
- **Level-2 mini project (1):** a chatbot with memory and a tool, persisted across restarts.
- **Part 4 Tools and agents (8):** define a tool; bind tools; `ToolNode`; the ReAct loop built by hand; recursion limit / step limit; tool error handling; structured final answer; `createAgent` as the shortcut used in real projects.
- **Part 5 Human-in-the-loop (4):** `interrupt` + `Command({resume})`; approve/reject; review and edit state; `interrupt` inside a tool + the rules of interrupts (no bare try/catch, stable order, JSON-serializable, idempotent side effects).
- **Part 6 More streaming (3):** `messages` (LLM tokens, filter by tag/node); `custom` via `writer`; multiple modes at once (`tools`, `debug`).

**Level 3 — Advanced (~29): patterns, long-term memory, multi-agent**
- **Part 7 Graph API in depth (8):** input/output schemas + private state; `Command` (`update` + `goto`); `Send` fan-out; `Send` map-reduce; runtime context; retry policy; cache policy; recursion limit in practice.
- **Part 8 Long-term memory and replay (5):** `Store` `put/get`; namespaces; `search`; checkpoint history; time travel / replay / fork.
- **Part 9 Workflow patterns (5):** prompt chaining; routing; parallelization; orchestrator-worker; evaluator-optimizer. (Official page for these was not found during research; builder must confirm against current docs or teach them as plain compositions of Parts 2 and 7.)
- **Part 10 Subgraphs and multi-agent (6):** subgraph called inside a node; subgraph added as a node; subgraph checkpointer modes; handoff via `Command`; supervisor; swarm.
- **Part 10b Durable execution (1):** durability modes (`exit`/`async`/`sync`) and resuming a run after a crash; idempotency of side effects.
- **Part 10c `createAgent` middleware (4):** model/tool call limits (stop runaway loops and cost); summarization middleware; human-in-the-loop middleware; retry + model fallback. (Middleware is the docs' main customization primitive for `createAgent`.) Optional extra if the builder verifies it works with Ollama Cloud: MCP tools.
- **Part 11 Extras and capstone (5):** Functional API (`entrypoint`/`task`) and when to prefer it (docs advise Graph API for new agents); visualize a graph; optional LangSmith tracing; capstone project (2 lessons).

Out of scope on purpose: LangGraph Platform / Agent Server / Studio, LangSmith Fleet and Engine, Deep Agents, RAG deep-dive, evals.

### Testing strategy

- Parts 2-5: logic tested with `fakeLLM` (scripted replies, including scripted tool calls for agent lessons). No network.
- Parts 0-1: real-call lessons run via `run.ts`; any test asserts shape only and is skipped (not failed) when no key is present.
- Every `solution/` must pass; every lesson exercise file must run as `todo`/pending on a fresh checkout (no red tests out of the box).

## Decisions made by the designer (not yet confirmed by the author)

- Vitest instead of Jest; `globals: true`.
- English repo docs, Thai lesson content.
- `solution/` folder per lesson; `OLLAMA_MODEL` env with a default model.
- Part/lesson counts above are a starting point (~85 total after the second coverage review). **Author decision: keep all ~85 lessons in scope; no trimming.** The author is fine with the content spanning many lessons. Build order in the plan should still go Level 1 -> 2 -> 3, finishing and verifying each level (solutions green, real-LLM lessons run against the chosen model) before starting the next, so earlier levels are usable while later ones are written..
- `createAgent` is taught last in Part 4, after building the ReAct loop by hand, so learners understand what it hides.
- Functional API and LangSmith tracing are included briefly at the end (author agreed).

## Left to the builder

- Verify the Ollama Cloud auth route (see Constraints) and pick the default model that works on the free tier.
- Confirm current LangGraph 1.x API names (state definition, `interrupt`, checkpointers) against the installed 1.7.5 before writing each lesson; do not rely on memory.
- Choose the fake chat model implementation (e.g. from `@langchain/core` testing utilities, or a small custom class in `src/fakeLLM.ts`), including support for scripted tool calls.
- Finalize lesson list, exercise wording, and the capstone.
- README quick-start and troubleshooting (key not set, 404 from wrong `baseUrl`).

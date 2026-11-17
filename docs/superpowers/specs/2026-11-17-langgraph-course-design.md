# LangGraph Practice Course (TypeScript) — Design

Date: 2026-11-17
Status: draft, awaiting approval

## Intent and why

A hands-on, exercise-based course repo that teaches LangGraph (JS/TS) to people who have **never built an LLM app**. It borrows the *shape* of the author's earlier course `ArrayaWongsaita/DN_JEST_SUPERTEST` (numbered tiny lessons, Thai hints, solutions) but **not its content model**: that course taught Jest, so learners wrote tests. Here the subject is LangGraph, so **learners write LangGraph code; tests are only the checker** that tells them they got it right. (An earlier build of this repo got this backwards; see "Existing work".)

The single most important outcome: **learners finish each lesson feeling "I did it" and dare to open the next one.** Every decision below is judged against that. Lessons are therefore as small as possible: one concept, 2-3 exercises, minutes not hours.

## Goals

- Full path from zero: set up -> call an LLM -> LangGraph core -> memory -> tools/agents -> capstone.
- ~81 lessons in 3 levels (Basics / Practical / Advanced), one concept each, ordered so each lesson only needs what earlier ones taught. Each level ends at a usable skill so learners can stop and come back.
- **Teach the real tools.** Every lesson teaches an API a learner will actually use in LangChain/LangGraph. Before writing a lesson the builder checks the current official docs and the installed packages for a built-in; if one exists, the lesson teaches that built-in.
- **Provider is a config, not code:** switching LLM provider or model means editing `.env` (and, for a brand-new provider, one table row), never a lesson.
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
- A lesson where the learner's main activity is writing tests instead of LangGraph/LLM code.
- Lessons that leak the provider (any lesson importing a provider package such as `@langchain/groq` directly, or naming a provider in lesson text).
- Lessons that make learners hand-write helpers for things LangChain/LangGraph already provide (e.g. a home-made retry or JSON parser instead of `.withRetry()` / `.withStructuredOutput()`): the learner would leave not knowing the real tools.
- Setup friction that stops a beginner before lesson 1 finishes.

## Constraints

- Language/runtime: TypeScript, Node (dev machine has Node 26). Test runner: **vitest** (already installed locally; jest-like API, native TS/ESM). Use `globals: true` so tests read like the original (`test`, `expect` with no import) — builder's call to confirm.
- Already in `node_modules`: `@langchain/core` 1.4.1, `@langchain/langgraph` 1.7.5, `@langchain/langgraph-checkpoint`, `zod`, `vitest`, `typescript`. A `package.json` now exists with these pinned. Provider packages (default: `@langchain/groq`) are added as dependencies; the provider table in `src/llm.ts` covers the default plus a couple of examples.
- **API currency:** the current docs recommend `createAgent` from the `langchain` package (not installed locally; add it) as the high-level agent. Installed `@langchain/langgraph` 1.7.5 exports `StateSchema`, `MessagesValue`, `MessagesAnnotation`, `MemorySaver`, `InMemoryStore`, `RetryPolicy`, `CachePolicy`, `entrypoint`, `Send`, `interrupt` (checked). Builder must pick ONE state-definition style as the main one (`StateSchema` vs `Annotation`) per current docs and use it consistently. Official docs have no "testing graphs" page, so the fake-LLM approach must be validated by the builder.
- Default provider: **Groq** via `@langchain/groq` (`ChatGroq`), key from `GROQ_API_KEY` (created in the Groq console). Verified from docs: tool calling, structured output, streaming and token usage are supported; the docs' example model is `openai/gpt-oss-120b`. All models Groq lists support tool use; `llama-3.3-70b-versatile` and `llama-3.1-8b-instant` also support parallel tool calls while the `openai/gpt-oss-*` models do not.
- **Rate limits (risk):** Groq's rate-limit page lists only Developer-plan limits (e.g. `openai/gpt-oss-120b`: 30 RPM, 1K requests/day, **8K tokens/min**, 200K tokens/day); free-tier limits are not on that page and must be read from the author's Groq console. A 429 carries a `retry-after` header. Each learner must use their own key (a shared key in a classroom will hit limits). Keep real-LLM calls few and short; checkers use `fakeLLM`.
- Config: `LLM_PROVIDER` (default `groq`), `LLM_MODEL` (default chosen by the builder after the spike), plus the provider's own key variable (`GROQ_API_KEY`, ...). Provider differences (tool calling, parallel tools, structured output) are *not* hidden; the conformance script reports them.
- **Unverified (builder must test with a real key before writing lessons):** the default model works with tool calling and with `.withStructuredOutput(zodSchema)`; which model to default to given the limits above; behaviour of 429/401 errors (shape consumed by `src/errorInfo.ts`).
- Secrets: provider keys go in `.env` (git-ignored) with a committed `.env.example`.
- **Version drift:** LangChain/LangGraph APIs change. Pin exact versions in `package.json` and record "tested with" versions in the README.

## Approaches considered

**A. LLM-first ladder (chosen).** Start by calling an LLM, then introduce LangGraph when the learner has felt why a graph helps. Matches "start from connecting an LLM"; beginners see real output early.

**B. Graph-first with a fake LLM, real LLM later (rejected).** Fast, no key needed, but defers the real LLM, which contradicts the author's wish and leaves absolute beginners learning abstractions with nothing concrete. The fake-LLM idea is kept, but only as a test technique.

**Provider switching (chosen: C).** (A) a hand-written `switch` in `src/llm.ts` edited per provider; (B) LangChain's `initChatModel("provider:model")` from the `langchain` package (docs do not confirm Groq support, adds a dependency, less readable for learners); (C) **config-driven table in `src/llm.ts`** (`LLM_PROVIDER` + `LLM_MODEL` in `.env`, each table row returns a `BaseChatModel`, adding a provider = one row) **plus a conformance script** `npm run check:llm` that runs the configured provider through: basic call, streaming, tool calling, structured output, and reports which lesson areas may break. C gives B's "change one env var" without relying on unconfirmed support, and the conformance script exists because the author expects providers/models to change often.

**Lesson format (chosen: B as the main format, C early, A at the end of each level).**
- **A. Fill a whole function from an empty stub.** Learner writes the entire graph/node. Real writing, but a big step for people new to LLM apps; risks the lost confidence the course exists to prevent.
- **B. A working example with 1-3 small gaps to fill (chosen as main).** The lesson file is an almost-complete graph with marked gaps (e.g. "connect START to `ask`"); a ready-made test checks the fill. Small steps, the whole picture is visible first. Difficulty ramps by increasing the number/size of gaps through a level.
- **C. Run and observe.** No fill-in; learner runs a live example and changes parameters. Used for the first LLM calls (and streaming) where seeing output *is* the lesson; not enough alone because there is no "done" signal.
- Each level ends with an A-style mini project (bigger writing from a skeleton).

**Verification style (chosen: two layers).** Alternatives were (1) test only output *shape* with real API calls, (3) no tests, run-and-compare. Chosen: graph/structure logic is tested with a **fake chat model** returning fixed answers, so tests are deterministic, fast, free and need no key. Behaviour that truly needs a real model is run by hand via `npm run lesson:<id>` and, where tested at all, only for shape (non-empty string, expected keys).

## Design

### Repo layout

```
langgraph-course/
  package.json  tsconfig.json  vitest.config.ts  .env.example  .gitignore  README.md
  src/
    llm.ts          # the ONLY file that knows the provider; exports getLLM(): BaseChatModel
    fakeLLM.ts      # helper to make a fake chat model with scripted replies (for checkers)
    todo.ts         # todo(n): throws a Thai "ยังไม่ได้ทำข้อ n" for gaps in expression position
  lessons/
    00-setup/ ... NN-topic/
      README.md          # Thai: what you will learn, 1 concept, expected result
      <topic>.ts         # the lesson code: working scaffold with marked gaps (`👉 ข้อ N`) the learner fills
      <topic>.test.ts    # ready-made checker (learner does NOT edit it); fails (red) until the gaps are filled
      run.ts             # run the lesson live (real LLM when the lesson uses one)
      solution/<topic>.ts# the finished code; checker passes against it
```

### `src/llm.ts` contract

- Exports `getLLM(options?: { temperature?: number; model?: string }): BaseChatModel` (never a concrete provider class), so lessons code against the abstraction.
- Internally a small provider table `{ groq: ..., ollama: ..., openai: ... }` (default `groq`; others are examples, dependencies only when used); provider chosen by `LLM_PROVIDER`, model by `LLM_MODEL`.
- Missing/blank key or unknown provider -> a clear Thai error naming the env var to set (provider-neutral wording: it names the variable of the *configured* provider).
- Header comment explains how to add a provider (one table row) and how to change model.
- `scripts/check-llm.ts` (`npm run check:llm`) is the conformance script described under Approaches.
- `src/errorInfo.ts` reads status/code from the several error shapes providers produce (`status`, `status_code`, `response.status`, `cause.code`); Thai error explanations are provider-neutral.
- Checker-only code uses `src/fakeLLM.ts`, never `getLLM`.

### Lesson format (per lesson)

- **README.md teaches** (Thai): the one concept in plain words, a small diagram where it helps (e.g. START -> node -> END), a walkthrough of the example code, then the task list. A learner should be able to understand the concept from the README before touching code.
- **`<topic>.ts`** is a working-looking scaffold with 1-3 gaps. Each gap has a Thai hint (`แนวทาง:`) and is stubbed so the file compiles and the checker fails with a readable message (`todo(1)` -> "ยังไม่ได้ทำข้อ 1"; missing graph wiring fails as the graph library reports it, and the README explains how to read that).
- **`<topic>.test.ts`** is the checker: complete, deterministic (uses `fakeLLM`), written so a failure message points to the gap. The first gap is almost copy-able from the example (quick win); later ones are slightly harder.
- **`run.ts`** runs the lesson live (real LLM where applicable) for the "see it work" payoff.
- **Closing section in every README** (builds the confidence the course exists for): "คุณทำได้แล้ว" (what the learner can now do), 2-3 things to remember, and what the next lesson adds.
- **Ramp:** gap count/size grows through a level; the last lesson of each level is an A-style mini project (larger writing from a skeleton).
- **Red by design:** a lesson's checker is red until its gaps are filled. The default `npm test` therefore runs only repo-infrastructure tests (`src/`, `scripts/`); learners run one lesson with `npm run test:lesson NN`, and live with `npm run lesson NN`.
- **Maintainer checks:** `npm run check:solutions` (checker passes against every `solution/`), `npm run check:starters` (checker FAILS against every starter, so no lesson is accidentally already solved, and every starter typechecks), `npm run lint:lessons` (structure rules).

### Curriculum (draft, ~70 lessons in 3 levels; builder finalizes exact list)

Coverage was checked against the official LangGraph JS docs (overview, Graph API, streaming, interrupts, memory, persistence, time travel, subgraphs, functional API, multi-agent, `createAgent`). Each level is a natural stopping point: a learner who finishes a level has a working, useful skill and a reason to continue. `lessons/` is grouped as `level-1-basics/`, `level-2-practical/`, `level-3-advanced/`, with `NN-topic` inside (numbering continuous across the repo).

**Level 0 — Raw HTTP (~6, additive, added after the Level 1 draft): what an LLM call really is**
Purpose: show that an LLM call is an HTTP request, feel the pain a framework removes, and motivate LangChain and LangGraph. Deliberate, labelled exception to the "teach the real tools" principle ("ทำเองก่อน เพื่อเห็นว่า framework ช่วยอะไร"); each lesson stays shorter than Level 1 lesson 03. Level 1 is untouched except for comparison boxes ("เทียบกับตอน fetch") in lessons 03-08 and the root README's reading order. Lessons take `fetchFn: typeof fetch` so checkers pass a fake and never touch the network.
- **0-01** set up `.env`, explain the red->green loop briefly, first `fetch` POST to the chat endpoint, read `choices[0].message.content`.
- **0-02** read errors: `res.ok`, 401/404/429 -> Thai messages.
- **0-03** messages array and history by hand (the model is stateless).
- **0-04** ask for JSON, `JSON.parse`, validate with zod; meet the real problems (JSON inside a code fence, wrong types).
- **0-05 (optional)** streaming: read SSE `data:` lines. Hardest of the group, may be skipped.
- **0-06** the assistant as plain `if`/`while` (classify, then choose a path), then add a loop until the code tangles; Level 1 lesson 19 rebuilds the same assistant as a graph for comparison.
Numbering: lessons are numbered per level. Lesson ids are `<level>-<NN>` (`0-03`, `1-03`); a bare `NN` still means Level 1 so existing commands and README references keep working (`pnpm test:lesson 0-03`, `pnpm lesson 0-01`). Duplicate-number and contiguity rules apply within a level. Provider-neutral lesson text: the provider table in `src/llm.ts` gains a `chatUrl` (OpenAI-compatible chat completions endpoint), so `.env` switching still works.

**Level 1 — Basics (~19): from zero to a first working graph**
- **Part 0 Setup (3):** run your first lesson (learn the red->green loop on a tiny gap; includes "how to read a failing checker"); set up `.env` and the provider key; first real LLM call via `getLLM()`. TypeScript prerequisites (`async/await`, zod basics) and troubleshooting (401 / 404 / 429 / `fetch failed`) are short **call-out boxes inside the lessons that first need them**, not lessons of their own.
- **Part 1 Talking to an LLM (5):** `invoke` and the message object (content, message types, `.text`); system prompt + conversation history as messages; prompt templates; streaming tokens; structured output with `.withStructuredOutput(zodSchema)` (fallback if the verified provider/model cannot do it: `JsonOutputParser` / `parseJsonMarkdown`). Note for builders: some models (e.g. reasoning models) return `content` as several blocks, so lessons read text with `.text`.
- **Part 2 LangGraph core (10):** State; a node; edges + START/END; first node that calls the LLM; nodes in sequence; conditional edge; loop with a stop condition; reducers; compile + invoke; stream `values`/`updates`.
- **Level-1 mini project (1):** a small command-line "assistant" that chains what was learned (LLM call + a first graph); an A-style lesson written from a skeleton.

**Level 2 — Practical (~27): chatbots and agents that remember and act**
- **Part 3 Memory in a thread (7):** messages in state; checkpointer (`MemorySaver`); `thread_id`; read/update state; trim messages; summarize old messages; persistent checkpointer (`SqliteSaver` from `@langchain/langgraph-checkpoint-sqlite`, so memory survives a restart; `MemorySaver` is RAM-only). A short call-out box (not a lesson) shows how the course's checkers test a graph with `fakeLLM`.
- **Level-2 mini project (1):** a chatbot with memory and a tool, persisted across restarts.
- **Part 4 Tools and agents (9):** define a tool; bind tools; `ToolNode`; the ReAct loop built by hand; recursion limit / step limit; tool error handling; structured final answer; dynamic model/tool selection; `createAgent` as the shortcut used in real projects.
- **Part 5 Human-in-the-loop (4):** `interrupt` + `Command({resume})`; approve/reject; review and edit state; `interrupt` inside a tool + the rules of interrupts (no bare try/catch, stable order, JSON-serializable, idempotent side effects).
- **Part 6 More streaming (3):** `messages` (LLM tokens, filter by tag/node); `custom` via `writer`; multiple modes at once (`tools`, `debug`).
- **Part 6b Reliable and efficient LLM calls (3):** few-shot examples; parameters (temperature) and reading token usage; `.withRetry()` and `.withFallbacks()` (also teaches switching models).

**Level 3 — Advanced (~35): patterns, long-term memory, multi-agent**
- **Part 7 Graph API in depth (9):** input/output schemas + private state; `Command` (`update` + `goto`); `Send` fan-out; `Send` map-reduce; runtime context; retry policy; cache policy; `defer` (run a node only after all branches finish); recursion limit in practice.
- **Part 8 Long-term memory and replay (5):** `Store` `put/get`; namespaces; `search`; checkpoint history; time travel / replay / fork.
- **Part 9 Workflow patterns (5):** prompt chaining; routing; parallelization; orchestrator-worker; evaluator-optimizer. (Official page for these was not found during research; builder must confirm against current docs or teach them as plain compositions of Parts 2 and 7.)
- **Part 10 Subgraphs and multi-agent (6):** subgraph called inside a node; subgraph added as a node; subgraph checkpointer modes; handoff via `Command`; supervisor; swarm.
- **Part 10b Durable execution (1):** durability modes (`exit`/`async`/`sync`) and resuming a run after a crash; idempotency of side effects.
- **Part 10c `createAgent` middleware (4):** model/tool call limits (stop runaway loops and cost); summarization middleware; human-in-the-loop middleware; retry + model fallback. (Middleware is the docs' main customization primitive for `createAgent`.) Optional extra if the builder verifies it works with the default provider: MCP tools.
- **Part 11 Extras and capstone (5):** Functional API (`entrypoint`/`task`) and when to prefer it (docs advise Graph API for new agents); visualize a graph; optional LangSmith tracing; capstone project (2 lessons).

Out of scope on purpose: LangGraph Platform / Agent Server / Studio, LangSmith Fleet and Engine, Deep Agents, RAG deep-dive, evals.

### Testing strategy

- `fakeLLM` must support what lessons call on it: `invoke`, `stream`, `bindTools` / scripted tool calls (Level 2) and `.withStructuredOutput(...)` (Part 1). `FakeListChatModel` in `@langchain/core` declares `bindTools` and `withStructuredOutput`; the builder verifies they actually return scripted tool calls / structured data and extends `src/fakeLLM.ts` if not, as part of the foundation, before writing lessons that depend on them.
- Parts 2-5: logic tested with `fakeLLM` (scripted replies, including scripted tool calls for agent lessons). No network.
- Parts 0-1: real-call lessons run via `run.ts`; any test asserts shape only and is skipped (not failed) when no key is present.
- Every `solution/` must pass its checker; every starter must fail its checker (see Lesson format). The default `npm test` stays green on a fresh checkout because it excludes lesson checkers.

## Decisions made by the designer (not yet confirmed by the author)

- Vitest instead of Jest; `globals: true`.
- English repo docs, Thai lesson content.
- `solution/` folder per lesson; `LLM_PROVIDER` / `LLM_MODEL` env with a default chosen after the spike.
- Provider changed from Ollama Cloud to **Groq** (author's decision), with config-driven switching (option C).
- Part/lesson counts above are a starting point (~81 total after the second coverage review). **Author decision: keep all ~81 lessons in scope; no trimming.** The author is fine with the content spanning many lessons. **Pilot first:** because the lesson format was misread once, the plan builds three *pilot lessons* (01 run your first lesson, structured output, conditional edge) and stops for the author to run them and approve the feel before any other lesson is built. Build order in the plan should then go Level 1 -> 2 -> 3, finishing and verifying each level (solutions green, real-LLM lessons run against the chosen model) before starting the next, so earlier levels are usable while later ones are written..
- `createAgent` is taught last in Part 4, after building the ReAct loop by hand, so learners understand what it hides.
- Functional API and LangSmith tracing are included briefly at the end (author agreed).

- Lesson checkers are red until the learner fills the gaps (author agreed to the format; the "red only for the lesson you are on" consequence is the designer's call).

## Existing work (from the first build)

Lessons 01-26 in `lessons/level-1-basics/` were built in the wrong (learner-writes-tests) format. Reusable as-is: `src/llm.ts`, `src/fakeLLM.ts`, `src/errorInfo.ts`, `scripts/` tooling (to be adapted), every `solution/*.ts`, and every `solution/*.test.ts` (these become the checkers). To be rewritten: each lesson's `README.md` (must teach), the starter `<topic>.ts` (gaps), removal of the `test.todo` files, and the lint rules (old rule requires todo-only exercises). Real-LLM verification with the author's API key is still outstanding. **Provider migration:** `src/llm.ts`, `src/llm.test.ts`, `scripts/check-llm.ts`, `.env.example`, `src/errorInfo.ts` wording, lesson 06 texts and README currently target Ollama Cloud and must move to the provider table / neutral wording. **Content migration:** the first build's Part 0-1 lessons hand-write helpers (`withRetry`, JSON parsing, `buildConversation`, `buildFewShot`); under the "teach the real tools" rule these are replaced, not converted. Part 2 lessons (graph building) are kept.

## Left to the builder

- **First task, before any lesson work: a spike against the real default provider** (needs the author's `GROQ_API_KEY`): confirm basic call, streaming, tool calling, `.withStructuredOutput(zod)`, error shapes for 401/429, and pick the default model within the author's actual limits. Its results decide how Part 1's structured-output lesson and Level 2's tool lessons are taught.
- Confirm current LangGraph 1.x API names (state definition, `interrupt`, checkpointers) against the installed 1.7.5 before writing each lesson; do not rely on memory.
- Choose the fake chat model implementation (e.g. from `@langchain/core` testing utilities, or a small custom class in `src/fakeLLM.ts`), including support for scripted tool calls.
- Finalize lesson list, exercise wording, and the capstone.
- README quick-start and troubleshooting (key not set, 404 from wrong `baseUrl`).
- Write each lesson README as real teaching content, checked against the current official docs (not memory); decide per lesson how many gaps and where, following the ramp.
- Decide how to present the "how to read a failing checker" guidance once (a short section in Lesson 01 and the root README), then reuse it.

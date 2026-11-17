# LangGraph Course — Foundation + Pilot Lessons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the repo to a config-driven provider (Groq default), rebuild the lesson tooling for the "fill the gaps, checker goes green" format, verify Groq with a live spike, and build three pilot lessons, then **stop for the author to run them and approve the feel**.

**Architecture:** `src/llm.ts` holds a small provider table chosen by `LLM_PROVIDER`/`LLM_MODEL`; a conformance script reports what the configured provider supports. Each lesson folder has a README (teaches), a starter `<topic>.ts` with `todo(n)` gaps, a ready-made checker `<topic>.test.ts` (uses `fakeLLM`), optional `run.ts`, and `solution/`. Maintainer scripts prove every checker passes on its solution and fails on its starter.

**Tech Stack:** TypeScript, Node 26, vitest 4.1.12, `@langchain/core` 1.4.1, `@langchain/langgraph` 1.7.5, zod 4.6.7 (installed); to install: `@langchain/groq` (pin the version npm resolves, exact).

**Spec:** `docs/superpowers/specs/2026-11-17-langgraph-course-design.md`

**Scope note:** This plan ends at the **pilot gate** (Task 7). The remaining Level 1 lessons, Level 2 and Level 3 get their own plans after the author approves the pilot and the spike results are known. Tool-call support in `fakeLLM` (needed from Level 2) is deliberately deferred to the Level 2 plan.

## Global Constraints

- Lesson text (README, comments, hints, checker titles) in **Thai**; code identifiers, repo docs, commit messages in **English**. Lesson text never names a provider; it says "LLM" and points to `.env`.
- Learners write LangGraph/LLM code; tests are only the checker. A lesson must teach a real LangChain/LangGraph API; check the installed package/docs for a built-in before writing it.
- Lesson folder = `README.md` + `<topic>.ts` (starter, gaps `// 👉 ข้อ N` with `แนวทาง:` hint, stubbed with `todo(N)`) + `<topic>.test.ts` (checker, complete, deterministic, uses `fakeLLM`, never `getLLM`) + optional `run.ts` + `solution/<topic>.ts`. README ends with: "คุณทำได้แล้ว" (what you can now do), 2-3 things to remember, what the next lesson adds.
- No lesson imports a provider package or another lesson.
- Default `npm test` runs only `src/` and `scripts/` tests and must be green on a fresh checkout. A lesson checker is red until its gaps are filled.
- Provider selection only via `.env`: `LLM_PROVIDER` (default `groq`), `LLM_MODEL`, and the provider's key variable (`GROQ_API_KEY`). Groq docs example model: `openai/gpt-oss-120b`; default model decided by the spike. Each learner uses their own key.
- Pin exact dependency versions; `.env` is git-ignored; `.env.example` committed.
- Tests never call the network. Live calls happen only in `run.ts` and `scripts/check-llm.ts`, and only with the author's go-ahead.

## Review Focus

- `LLM_PROVIDER` set to an unknown name -> Thai error listing the valid names (not a TypeError). Pinned in Task 1.
- Blank key for the *configured* provider -> message names that provider's variable (`GROQ_API_KEY` for groq, `OLLAMA_API_KEY` for ollama). Pinned in Task 1.
- Infra tests must not be influenced by the author's real `.env` (it contains real keys and legacy `OLLAMA_*` values). Pinned in Task 1 (all provider variables stubbed to `""` per test).
- A starter that already passes its checker (lesson accidentally solved) or a solution that fails it. Pinned in Task 3 (`check:starters`, `check:solutions`) with fixtures.
- A lesson folder whose `solution/` lacks a starter file, or whose starter has no `todo(` gap. Pinned in Task 3 (lint).
- Groq error shapes for 401/429 (status field, retry-after) reaching `src/errorInfo.ts`. Pinned in Task 2 by recording real shapes and adding a test case for each.

---

## File Structure

```
src/llm.ts  src/llm.test.ts  src/todo.ts  src/todo.test.ts  src/errorInfo.ts (existing)
scripts/check-llm.ts  scripts/check-llm-report.ts(+.test.ts)
scripts/check-lessons.ts(+.test.ts)  scripts/lint-lessons.ts(+.test.ts)
scripts/test-lesson.ts  scripts/run-lesson.ts(+.test.ts)  scripts/friendly-errors.ts
scripts/fixtures/lessons/...            # tiny fake lessons used by script tests
legacy/level-1-basics/...               # the first build, moved here, kept for reuse
lessons/level-1-basics/01-first-lesson/  08-structured-output/  14-conditional-edge/
docs/notes/provider-findings.md (rewritten)  docs/notes/api-findings.md (kept)
```

### Task 1: Provider table in `src/llm.ts`

**Files:**
- Modify: `src/llm.ts`, `src/llm.test.ts`, `.env.example`, `package.json`, `scripts/friendly-errors.ts`
- Run: `npm install --save-exact @langchain/groq`

**Interfaces:**
- Produces: `type ProviderName = "groq" | "ollama"`; `getLLM(options?: { temperature?: number; model?: string }): BaseChatModel`; `describeProvider(): { provider: ProviderName; model: string; keyVar: string }`.
- Behaviour: provider from `LLM_PROVIDER` (default `groq`); model = `options.model` > `LLM_MODEL` > provider default (groq: `openai/gpt-oss-120b`, replaced after Task 2); key variables `GROQ_API_KEY` / `OLLAMA_API_KEY`; the ollama row keeps `OLLAMA_BASE_URL` handling (trailing slash stripped, `/api` suffix rejected) and Bearer header. Header comment (Thai) shows how to add a provider (one table row, with a commented OpenAI example).

- [ ] **Step 1:** Rewrite `src/llm.test.ts` with a `beforeEach` that stubs `LLM_PROVIDER`, `LLM_MODEL`, `GROQ_API_KEY`, `OLLAMA_API_KEY`, `OLLAMA_BASE_URL` to `""` (and `afterEach` unstub). Tests: default provider is groq and a blank key throws `/GROQ_API_KEY/`; `LLM_PROVIDER=ollama` with blank key throws `/OLLAMA_API_KEY/`; unknown `LLM_PROVIDER=nope` throws a message containing `groq` and `ollama`; groq with key returns `instanceof BaseChatModel`; `describeProvider()` reflects `LLM_MODEL`; `options.model` overrides `LLM_MODEL`; ollama row rejects `OLLAMA_BASE_URL=https://ollama.com/api` and accepts a trailing slash; `{ temperature: 0 }` accepted.
- [ ] **Step 2:** Run `npx vitest run src/llm.test.ts` -> Expected: FAIL (groq provider / describeProvider missing).
- [ ] **Step 3:** Implement the table and both functions in `src/llm.ts` (sync, static imports of `@langchain/groq` and `@langchain/ollama`); update `.env.example` to `LLM_PROVIDER=groq`, `LLM_MODEL=`, `GROQ_API_KEY=` (keep the ollama variables commented as an example); make `scripts/friendly-errors.ts` hint text say "ตรวจ API key ใน .env (ตัวแปร <keyVar ของ provider ปัจจุบัน>)" using `describeProvider()` wrapped in try/catch.
- [ ] **Step 4:** Run `npx vitest run src && npm run typecheck` -> Expected: PASS, exit 0.
- [ ] **Step 5:** Commit `feat: config-driven provider table, groq default`.

### Task 2: Conformance script and live Groq spike

**Files:**
- Create: `scripts/check-llm-report.ts`, `scripts/check-llm-report.test.ts`
- Modify: `scripts/check-llm.ts`, `src/errorInfo.test.ts`, `src/errorInfo.ts` (only if shapes differ), `docs/notes/provider-findings.md` (rewrite), `src/llm.ts` (default model)

**Interfaces:**
- Produces: `type CheckResult = { name: "basic" | "streaming" | "tools" | "structured"; ok: boolean; detail: string }`; `formatReport(provider: string, model: string, results: CheckResult[]): string` (one line per check with ✓/✗ plus a Thai line per failed check naming the lesson area likely affected: tools -> Level 2 agents, structured -> Part 1 structured output, streaming -> streaming lessons).
- `scripts/check-llm.ts` runs the four live checks against `getLLM()` (basic: reply non-empty; streaming: more than one chunk; tools: `bindTools` with a one-argument `add`-style tool returns a non-empty `tool_calls`; structured: `.withStructuredOutput(zod)` returns the expected keys), prints `formatReport`, exits 1 if `basic` fails. Package script `check:llm`.

- [ ] **Step 1:** Write failing `check-llm-report.test.ts`: all-ok report has four ✓ lines and no failure hints; a failed `tools` result produces a ✗ line and a Thai hint mentioning agents; provider and model appear in the first line.
- [ ] **Step 2:** Run `npx vitest run scripts/check-llm-report.test.ts` -> Expected: FAIL (module missing).
- [ ] **Step 3:** Implement `formatReport`, rewrite `scripts/check-llm.ts` with the four checks, add `check:llm` to `package.json`. Run `npx vitest run scripts` -> Expected: PASS.
- [ ] **Step 4 (needs the author's go-ahead: live calls with their `GROQ_API_KEY`):** Ask the author, then run `npm run check:llm` for `openai/gpt-oss-120b` and for `llama-3.3-70b-versatile` (`LLM_MODEL=...`). Provoke a 401 once with `GROQ_API_KEY=invalid npm run check:llm`. Capture the thrown error's own keys and `status`-like fields.
- [ ] **Step 5:** Rewrite `docs/notes/provider-findings.md`: per model, which of the four checks pass; observed rate-limit headers/limits; the real 401 error shape. Choose the default model (must pass basic, streaming, tools; prefer structured) and set it in `src/llm.ts` and `.env.example` comment. If the 401 shape is not covered by `errorInfo`, add a failing case to `src/errorInfo.test.ts` first, then fix `errorInfo.ts`.
- [ ] **Step 6:** Run `npx vitest run src scripts` -> Expected: PASS. Commit `feat: provider conformance check and groq findings`.

### Task 3: Lesson tooling for the fill-the-gaps format

**Files:**
- Create: `src/todo.ts`, `src/todo.test.ts`, `scripts/check-lessons.ts`, `scripts/check-lessons.test.ts`, `scripts/test-lesson.ts`, `scripts/fixtures/lessons/level-0-fixture/{01-good,02-starter-passes,03-solution-fails}/...`
- Modify: `scripts/lint-lessons.ts` (+test), `scripts/run-lesson.ts` (+test), `scripts/lesson-template/*`, `vitest.config.ts`, `tsconfig.json`, `package.json`, `.gitignore` (`.tmp-check`)
- Move: `git mv lessons legacy` (first build kept for reuse); exclude `legacy/` from vitest, tsconfig and lint; add `legacy/README.md` one-liner.

**Interfaces:**
- `todo(n: number): never` throws `Error("ยังไม่ได้ทำข้อ <n>")`.
- `lintLessons(root: string, opts?: { strict?: boolean }): string[]` rules: folder `NN-slug` (`^\d{2}-[a-z0-9-]+$`); has `README.md`, a `*.test.ts`, `solution/` containing every non-test starter `.ts` and no extra checker; each starter `.ts` (non-test, non-`run.ts`) contains `todo(`; checker files contain no `todo(` text and use no `getLLM`; duplicate numbers always reported, contiguity (no gaps) only when `strict`.
- `checkLessons(root: string, mode: "solutions" | "starters"): { ok: boolean; problems: string[] }`. `solutions`: for each lesson copy it to `.tmp-check/<level>/<lesson>/` (same depth as `lessons/`), overlay `solution/*.ts` over the starters, run vitest there; every lesson must pass. `starters`: run vitest on the lesson as-is; every lesson must have at least one failing test. CLI `scripts/check-lessons.ts --mode solutions|starters [--root dir]`, exit 1 on problems. Package scripts: `check:solutions`, `check:starters`, `test:lesson` (`tsx scripts/test-lesson.ts NN` runs vitest for the lesson folder with that number), `test` = `vitest run src scripts`, `lint:lessons` = non-strict, `lint:lessons:strict`.
- `run-lesson.ts` takes root from env `LESSONS_ROOT` (default `lessons`); its test uses a fixture lesson whose `run.ts` calls `getLLM()` with blank keys and expects the Thai message naming `GROQ_API_KEY` and no stack trace (`\n\s+at `).

- [ ] **Step 1:** Write failing tests: `src/todo.test.ts` (throws, message contains the number); `scripts/lint-lessons.test.ts` cases for each rule above (starter without `todo(`, solution missing a starter file, checker containing `getLLM`, non-contiguous numbering ok unless strict); `scripts/check-lessons.test.ts` using the fixtures: `01-good` passes both modes, `02-starter-passes` makes `starters` mode report it, `03-solution-fails` makes `solutions` mode report it.
- [ ] **Step 2:** Run `npx vitest run src/todo.test.ts scripts` -> Expected: FAIL.
- [ ] **Step 3:** Implement `todo`, the lint rules, `checkLessons` (spawn `process.execPath` with the vitest bin, never `npx`, for Windows), `test-lesson.ts`, `run-lesson.ts` root override, update the template (starter with `todo(1)` gap, checker, solution, README skeleton with the closing section), update configs and `package.json` scripts, run the `git mv` and excludes.
- [ ] **Step 4:** Run `npm test && npm run typecheck && npm run lint:lessons` -> Expected: PASS (no lessons exist yet; lint of an empty `lessons/` is OK).
- [ ] **Step 5:** Commit `feat: fill-the-gaps lesson tooling; move first build to legacy`.

### Task 4: Pilot lesson 01 — run your first lesson

**Files:** Create `lessons/level-1-basics/01-first-lesson/{README.md,greet.ts,greet.test.ts,solution/greet.ts}`

**Interfaces:** Produces `greet(name: string): string` (starter body is `return todo(1)`; solution returns `สวัสดี ${name}`).

README (Thai) teaches: what this course is, how a lesson folder is laid out, the red -> green loop, `npm run test:lesson 01`, **how to read a failing checker** (the line with `ยังไม่ได้ทำข้อ 1`, expected vs received), the `solution/` rule (peek only when stuck), and the closing section.

- [ ] **Step 1:** Write the checker `greet.test.ts`: `greet("มาลี")` equals `"สวัสดี มาลี"`; titles in Thai that describe behaviour.
- [ ] **Step 2:** Run `npm run test:lesson 01` -> Expected: FAIL with message containing `ยังไม่ได้ทำข้อ 1`.
- [ ] **Step 3:** Write the starter `greet.ts` (gap `// 👉 ข้อ 1`, `แนวทาง:` hint), `solution/greet.ts`, README.
- [ ] **Step 4:** Run `npm run check:solutions && npm run check:starters && npm run lint:lessons` -> Expected: PASS (solution green, starter red, lint clean).
- [ ] **Step 5:** Commit `feat(lessons): pilot 01 first lesson`.

### Task 5: Pilot lesson 08 — structured output

**Files:** Create `lessons/level-1-basics/08-structured-output/{README.md,extractPerson.ts,extractPerson.test.ts,run.ts,solution/extractPerson.ts}`

**Interfaces:** Consumes `fakeLLM`, `getLLM`, `todo`. Produces `personSchema` (zod `{ name: string, age: number }`, given in the starter) and `extractPerson(llm: BaseChatModel, text: string): Promise<{ name: string; age: number }>`. Gaps: (1) create the structured model with `llm.withStructuredOutput(personSchema)`; (2) invoke it with a prompt containing `text` and return the result. If the spike (Task 2) shows the default model cannot do `.withStructuredOutput`, the lesson uses the fallback named in the spec (`JsonOutputParser`) and the README says why.

README teaches: what structured output is, why free text is hard to use in programs, zod as the shape description (with the short zod call-out box), what `.withStructuredOutput` returns (a Runnable), the closing section.

- [ ] **Step 1:** Write the checker: with `fakeLLM(['{"name":"มาลี","age":25}'])` the result equals `{ name: "มาลี", age: 25 }`; the prompt passed to the model contains the input text (spy on the underlying `invoke` of the structured runnable's model or on a recording fake, whichever the installed fake supports; record the choice in the checker comment); a reply whose `age` is a string rejects.
- [ ] **Step 2:** Run `npm run test:lesson 08` -> Expected: FAIL with `ยังไม่ได้ทำข้อ 1`.
- [ ] **Step 3:** Write starter, solution, README; `run.ts` calls `extractPerson(getLLM({ temperature: 0 }), "คุณสมชาย อายุ 42 ปี อยู่เชียงใหม่")` and prints the result.
- [ ] **Step 4:** Run `npm run check:solutions && npm run check:starters && npm run lint:lessons` -> Expected: PASS. With the author's go-ahead run `npm run lesson 08` against the real provider; record the output in `docs/notes/provider-findings.md`.
- [ ] **Step 5:** Commit `feat(lessons): pilot 08 structured output`.

### Task 6: Pilot lesson 14 — conditional edge

**Files:** Create `lessons/level-1-basics/14-conditional-edge/{README.md,route.ts,route.test.ts,run.ts,solution/route.ts}`

**Interfaces:** Follows `docs/notes/api-findings.md` (`StateSchema` + zod, `addConditionalEdges(from, router, [targets])`). Produces `routeByLength(state: { question: string }): "short" | "long"` (given in the starter, threshold 20 characters) and `buildRouteGraph()` returning the compiled graph with state `{ question, path }`. Gaps: (1) `addConditionalEdges(START, routeByLength, ["short", "long"])`; (2) edges from `"short"` and `"long"` to `END`. Node names must not equal state field names (README states this).

README teaches: what an edge is, why we sometimes need to choose a path, the router function idea (with a small START -> short/long -> END diagram), reading "node is not reachable" errors, the closing section.

- [ ] **Step 1:** Write the checker: `buildRouteGraph().invoke({ question: "สั้น" })` gives `path: "short"`; a 21-character question gives `"long"`; a 20-character question gives `"short"` (boundary).
- [ ] **Step 2:** Run `npm run test:lesson 14` -> Expected: FAIL (graph not compilable / unreachable node).
- [ ] **Step 3:** Write starter, solution, README; `run.ts` prints the `path` for three sample questions (no LLM needed).
- [ ] **Step 4:** Run `npm run check:solutions && npm run check:starters && npm run lint:lessons` and `npm run lesson 14` -> Expected: PASS, and `run.ts` prints three paths.
- [ ] **Step 5:** Commit `feat(lessons): pilot 14 conditional edge`.

### Task 7: Pilot gate (stop for the author)

**Files:** Modify `README.md` (root: new lesson flow, `test:lesson`, `check:llm`, provider switching section, legacy note), `.env.example` comments.

- [ ] **Step 1:** Update the root README (English) for the new flow: `npm run test:lesson NN`, `npm run lesson NN`, `npm run check:llm`, switching provider/model via `.env`, and a short note that `legacy/` holds the first build.
- [ ] **Step 2 (fresh-clone gate):** clone into a temp dir, `npm ci`, then `npm test`, `npm run check:solutions`, `npm run check:starters`, `npm run lint:lessons`, `npm run typecheck`. Expected: all pass.
- [ ] **Step 3:** Commit `docs: pilot gate readme`.
- [ ] **Step 4 (STOP):** Tell the author: run `npm run test:lesson 01`, `08`, `14`, fill the gaps, run `npm run lesson 08` and `14`, and say whether the format, README teaching depth and difficulty feel right. **No other lesson is built before the author's approval.** Report the spike findings (which models pass which checks, the default model chosen) and any deviations as rulings.

## Self-review notes

- Spec coverage: provider table + `.env` switching (Task 1), conformance script (Task 2), spike-first (Task 2), fill-the-gaps tooling with check:starters (Task 3), pilot-first gate (Task 7), real-tools principle (Tasks 5-6 teach `.withStructuredOutput` / `addConditionalEdges`), closing section (Global Constraints, each README). Deferred on purpose: `fakeLLM` tool calls (Level 2 plan), the other 16 Level 1 lessons, Levels 2-3.
- Types used across tasks: `getLLM`, `describeProvider`, `todo`, `lintLessons`, `checkLessons`, `formatReport` are each defined once.

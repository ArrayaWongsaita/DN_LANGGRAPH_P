# LangGraph Course — Foundation + Level 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the course repo foundation (tooling, `src/llm.ts`, fake LLM) and all of Level 1 (26 lessons: setup, talking to an LLM, LangGraph core, mini project), verified end to end.

**Architecture:** One repo, `lessons/level-N-*/NN-slug/` folders. Each lesson = Thai README + example `.ts` + exercise `.test.ts` (`test.todo` + Thai hints) + `solution/` (green). All lessons get their model from `src/llm.ts`; tests use `src/fakeLLM.ts` so they need no network or key. Real-LLM behaviour is run by hand with `run.ts`.

**Tech Stack:** TypeScript, Node 26, vitest 4.1.12 (`globals: true`), `@langchain/core` 1.4.1, `@langchain/langgraph` 1.7.5, zod 4.6.7, typescript 5.9.3 (all already in `node_modules`), plus to install: `@langchain/ollama`, `tsx`.

**Spec:** `docs/superpowers/specs/2026-11-17-langgraph-course-design.md`

**Scope note:** The spec covers ~85 lessons in 3 levels. This plan covers Foundation + **Level 1 only**. Level 2 and Level 3 get their own plans, written after this plan's Task 9 passes, because they depend on findings from Tasks 3 and 5 (which model supports tools, which structured-output method works, state-definition style, Ollama Cloud quota).

## Global Constraints

- Lesson text (README, comments, hints, exercise titles) in **Thai**; code identifiers, repo docs, commit messages in **English**.
- Every lesson: one concept, 2-3 exercises as `test.todo`, first exercise nearly copy-able from the example, hints in the form `แนวทาง: ...`, worked example at the top of the test file.
- Every lesson has `solution/` with the same file names, tests passing.
- No lesson imports `@langchain/ollama`; only `src/llm.ts` does.
- Default provider Ollama Cloud: `baseUrl: "https://ollama.com"` (bare host, **no `/api`**), key `OLLAMA_API_KEY`, model `OLLAMA_MODEL` env with default chosen in Task 3. `.env` git-ignored, `.env.example` committed.
- Pin exact versions in `package.json`; README records "tested with" versions.
- Fresh checkout: `npm test` has **zero failing tests** (exercises are `todo`).
- Tests never call the network.

## Review Focus

- `OLLAMA_API_KEY` missing, empty, or whitespace-only -> `getLLM()` throws a Thai message naming `OLLAMA_API_KEY` (not a stack trace from the HTTP layer). Pinned in Task 3.
- `OLLAMA_BASE_URL` set with trailing slash or `/api` -> trailing slash stripped; `/api` suffix rejected with a Thai explanation (causes 404). Pinned in Task 3.
- Model reply whose `content` is an array of content blocks rather than a string -> `replyText` still returns text. Pinned in lesson 07.
- 401 / 404 / 429 / network failure map to distinct Thai explanations, and retry never retries a 401. Pinned in lessons 06 and 15.
- A fresh clone shows exercises as todo, not red, and every solution is green. Pinned in Task 2 (`check:exercises`, `check:solutions`).

---

## File Structure

```
package.json  tsconfig.json  vitest.config.ts  vitest.solutions.config.ts
.gitignore  .env.example  README.md
src/llm.ts  src/llm.test.ts  src/fakeLLM.ts  src/fakeLLM.test.ts
scripts/run-lesson.ts  scripts/lint-lessons.test.ts  scripts/lesson-template/
docs/notes/provider-findings.md  docs/notes/api-findings.md
lessons/level-1-basics/NN-slug/{README.md,<topic>.ts,<topic>.test.ts,run.ts?,solution/}
```

### Task 1: Scaffold and tooling baseline

**Files:**
- Create: `package.json`, `tsconfig.json`, `vitest.config.ts`, `vitest.solutions.config.ts`, `.gitignore`, `.env.example`, `src/smoke.test.ts`
- Run: `git init` (directory is not yet a repo)

**Interfaces:**
- Produces npm scripts: `test` (learner exercises, excludes `**/solution/**`), `check:solutions` (only `lessons/**/solution/**` and `src/**` tests), `check:exercises` (alias of `test` that fails on any failing test), `lesson` (`tsx scripts/run-lesson.ts <NN>`), `typecheck` (`tsc --noEmit`).

- [ ] **Step 1:** Write failing `src/smoke.test.ts`: `test("vitest globals work", () => { expect(1 + 1).toBe(2) })` (no imports of `test`/`expect`).
- [ ] **Step 2:** Run `npx vitest run` -> FAIL (no config / globals undefined).
- [ ] **Step 3:** Create `package.json` pinning the versions listed in Tech Stack, `"type": "module"`, scripts above; `vitest.config.ts` with `globals: true`, `include: ["src/**/*.test.ts","scripts/**/*.test.ts","lessons/**/*.test.ts"]`, `exclude` containing `**/solution/**` and `node_modules`; `vitest.solutions.config.ts` including `lessons/**/solution/**/*.test.ts` and `src/**/*.test.ts`; `tsconfig.json` strict, `types: ["vitest/globals","node"]`, `moduleResolution: "bundler"`; `.gitignore` (`node_modules`, `.env`); `.env.example` with `OLLAMA_API_KEY=`, `OLLAMA_MODEL=`, `OLLAMA_BASE_URL=https://ollama.com`. Install `@langchain/ollama` and `tsx` (`npm install`), keeping existing versions.
- [ ] **Step 4:** Run `npx vitest run` -> PASS; `npm run typecheck` -> exit 0.
- [ ] **Step 5:** `git init && git add -A && git commit -m "chore: scaffold course repo"`.

### Task 2: Lesson tooling and template

**Files:**
- Create: `scripts/run-lesson.ts`, `scripts/lint-lessons.test.ts`, `scripts/lesson-template/{README.md,topic.ts,topic.test.ts,solution/topic.ts,solution/topic.test.ts}`

**Interfaces:**
- Produces `lintLessons(root: string): string[]` (exported from `scripts/lint-lessons.ts`) returning human-readable problems; empty = OK. Rules: each `lessons/level-*/NN-slug/` has `README.md`, at least one `*.test.ts`, a `solution/` with the same `*.test.ts` names, exercise test files contain no active `test(`/`it(` call (only `test.todo` and the commented worked example), folder names match `^\d{2}-[a-z0-9-]+$`, numbers unique and contiguous across levels.
- Produces `scripts/run-lesson.ts <NN>`: finds the lesson folder by number and runs its `run.ts` (error in Thai if none).

- [ ] **Step 1:** Write failing `scripts/lint-lessons.test.ts` using a temp dir fixture: valid lesson -> `[]`; missing `solution/` -> one message mentioning the folder; exercise file with active `test("x", ...)` -> flagged; duplicate number -> flagged; bad folder name -> flagged.
- [ ] **Step 2:** Run `npx vitest run scripts` -> FAIL.
- [ ] **Step 3:** Implement `lintLessons` in `scripts/lint-lessons.ts` and the CLI `scripts/run-lesson.ts`; add npm scripts `lint:lessons` (runs `lintLessons("lessons")`, exit 1 on problems). Write the lesson template (Thai) showing the required structure: header banner with concept + worked example in a comment, three `test.todo` with `แนวทาง:` hints and a `// 👉 เขียน test ของข้อ N ตรงนี้` marker.
- [ ] **Step 4:** Run `npx vitest run scripts` -> PASS.
- [ ] **Step 5:** Commit `feat: lesson tooling and template`.

### Task 3: `src/llm.ts` and Ollama Cloud findings

**Files:**
- Create: `src/llm.ts`, `src/llm.test.ts`, `scripts/check-llm.ts`, `docs/notes/provider-findings.md`

**Interfaces:**
- Produces `getLLM(options?: { temperature?: number; model?: string }): BaseChatModel` (from `@langchain/core/language_models/chat_models`). Reads `OLLAMA_API_KEY`, `OLLAMA_MODEL`, `OLLAMA_BASE_URL`; calls `process.loadEnvFile()` once inside try/catch so `.env` is picked up. Header comment explains (Thai) how to swap provider: replace the body, keep the return type.

- [ ] **Step 1:** Write failing `src/llm.test.ts` (use `vi.stubEnv`): (a) key `""`, `"   "` or unset -> `getLLM()` throws error whose message matches `/OLLAMA_API_KEY/`; (b) key set -> result `instanceof BaseChatModel`; (c) `OLLAMA_BASE_URL="https://ollama.com/"` -> accepted (trailing slash stripped); (d) `"https://ollama.com/api"` -> throws message matching `/\/api/`; (e) `{ temperature: 0 }` accepted.
- [ ] **Step 2:** Run `npx vitest run src/llm.test.ts` -> FAIL.
- [ ] **Step 3:** Implement `getLLM` using `ChatOllama` from `@langchain/ollama`. **Verify against the real API** (needs the author's key; ask the author to run `! OLLAMA_API_KEY=... npx tsx scripts/check-llm.ts` if no key is available): does `ChatOllama` accept a `headers` option with `Authorization: Bearer <key>`? If not, fall back to constructing the client from the `ollama` package and passing it to `ChatOllama` (or another route that still returns a `BaseChatModel`). `scripts/check-llm.ts` invokes the model with "ตอบว่า OK" and prints the reply.
- [ ] **Step 4:** Record in `docs/notes/provider-findings.md`: working auth route; chosen default `OLLAMA_MODEL` (must support tool calling; test one tool-call round trip); whether native structured output works; observed rate-limit behaviour; date tested. Run `npx vitest run src/llm.test.ts` -> PASS.
- [ ] **Step 5:** Commit `feat: provider setup in src/llm.ts`.

### Task 4: `src/fakeLLM.ts`

**Files:**
- Create: `src/fakeLLM.ts`, `src/fakeLLM.test.ts`

**Interfaces:**
- Produces `fakeLLM(replies: string[]): BaseChatModel` — returns replies in order on each `invoke`/`stream` call, cycling when exhausted (document this). Streaming yields more than one chunk for replies longer than one character. Built on `FakeListChatModel` (present in `@langchain/core/utils/testing`); wrap or subclass only if needed to meet the tests.

- [ ] **Step 1:** Write failing tests: two invokes with `["a","b"]` -> contents `"a"`, `"b"`; third invoke -> `"a"` (cycles); `stream("hello")` chunks concatenate to the reply and `chunks.length > 1`; works as a node dependency inside a minimal `StateGraph` invoke (one node calling `llm.invoke`).
- [ ] **Step 2:** Run `npx vitest run src/fakeLLM.test.ts` -> FAIL.
- [ ] **Step 3:** Implement per the interface.
- [ ] **Step 4:** Run -> PASS. Add to `docs/notes/provider-findings.md` a line confirming fake-model testing works with the installed versions.
- [ ] **Step 5:** Commit `feat: fake LLM for deterministic tests`.

### Task 5: LangGraph API findings (style decisions)

**Files:**
- Create: `docs/notes/api-findings.md`

- [ ] **Step 1:** Read the current official docs (docs.langchain.com/oss/javascript/langgraph: graph-api, quickstart) and the installed 1.7.5 typings. Write a throwaway script in the scratchpad (not the repo) that builds and invokes a 2-node graph with each candidate state style.
- [ ] **Step 2:** In `docs/notes/api-findings.md` record the **one** state-definition style all lessons will use (`StateSchema` vs `Annotation.Root`), the exact import lines, how to declare a reducer, `START`/`END` imports, and the invoke/stream call shapes. Include a compiled, working 2-node example.
- [ ] **Step 3:** Commit `docs: LangGraph API findings`. Tasks 8-9 must follow this file.

### Task 6: Part 0 — Setup and prerequisites (lessons 01-06)

**Files:** `lessons/level-1-basics/01-first-test/` ... `06-read-errors/`, each per the lesson template (README, example, exercise test, solution/; `run.ts` where noted).

**Interfaces:** Consumes `getLLM`, `fakeLLM`. Each lesson row defines the example file's exported signature and the exercises (all as `test.todo` with Thai hints; solution implements them).

Per-lesson procedure (applies to every lesson task below): (1) write `solution/<topic>.test.ts` with the exercises as real tests and the example file's expected behaviour; (2) run it, see it FAIL against a stub; (3) implement `<topic>.ts` (copy to `solution/`); (4) run `npx vitest run --config vitest.solutions.config.ts lessons/<path>` -> PASS; (5) write the learner-facing `<topic>.test.ts` (worked example in comment, exercises as `test.todo`, hints); (6) write Thai `README.md` (what you learn, one concept, expected result); (7) `npm run lint:lessons` -> no problems; commit `feat(lessons): NN-slug`.

| # | slug | example file: signature | exercises |
|---|---|---|---|
| 01 | first-test | `add.ts`: `add(a: number, b: number): number` | `add(1,2)=3`; `add(-1,1)=0`; `add(0,0)=0` |
| 02 | env-and-api-key | `readKey.ts`: `readKey(env: Record<string,string\|undefined>): string` | returns the key; throws Thai message naming `OLLAMA_API_KEY` when missing; trims whitespace. `run.ts` prints a masked key (`abcd…`) |
| 03 | first-llm-call | `askOnce.ts`: `askOnce(llm: BaseChatModel, question: string): Promise<string>` | with `fakeLLM(["สวัสดี"])` returns `"สวัสดี"`; returns a `string`; second call returns the second scripted reply. `run.ts` calls real `getLLM()` |
| 04 | async-await | `greeting.ts`: `delay(ms): Promise<void>`, `fetchGreeting(name): Promise<string>` | `await` returns value; `Promise.all` of two calls; rejected promise caught with `try/catch` (`rejects`) |
| 05 | zod-basics | `userSchema.ts`: `userSchema` = `{name: string, age: number>=0}`, `type User` | `parse` valid; `safeParse` invalid -> `success:false`; error message for negative age |
| 06 | read-errors | `explainError.ts`: `explainError(e: unknown): string` | 401 -> Thai text mentioning key; 404 -> mentions `baseUrl` without `/api`; 429 -> rate limit; `ENOTFOUND`/`ECONNREFUSED` -> network |

- [ ] **Step 1-N:** For each row in order, run the per-lesson procedure.
- [ ] **Final:** `npm run check:solutions` PASS; `npm test` zero failures; `npm run lint:lessons` clean.

### Task 7: Part 1 — Talking to an LLM (lessons 07-15)

**Files:** `lessons/level-1-basics/07-invoke-and-response/` ... `15-error-handling-retry/` (per template; `run.ts` for 07, 08, 12, 13, 14).

**Interfaces:** Consumes `getLLM`, `fakeLLM`, `explainError` (re-implemented locally only if a lesson needs it; do not cross-import between lessons). Structured-output lesson 13 uses the method recorded in `provider-findings.md`.

| # | slug | example file: signature | exercises |
|---|---|---|---|
| 07 | invoke-and-response | `replyText.ts`: `replyText(llm, prompt: string): Promise<string>` | returns scripted reply; two calls give two replies; when `content` is an array of blocks (`[{type:"text",text:"hi"}]`) still returns `"hi"` |
| 08 | system-prompt | `persona.ts`: `askWithPersona(llm, persona: string, question: string): Promise<string>` | (spy on `llm.invoke`) first message is `SystemMessage` containing persona; last is `HumanMessage` with question; returns reply text |
| 09 | message-order | `conversation.ts`: `buildConversation(turns: {role:"user"\|"assistant"; text:string}[]): BaseMessage[]` | maps roles to `HumanMessage`/`AIMessage`; preserves order; empty array -> `[]` |
| 10 | prompt-templates | `translatePrompt.ts`: `translatePrompt: ChatPromptTemplate` (vars `language`, `text`) | fills variables; missing variable rejects; `translatePrompt.pipe(fakeLLM)` returns reply |
| 11 | few-shot | `fewShot.ts`: `buildFewShot(examples: {input:string;output:string}[], input: string): BaseMessage[]` | message count = 2×examples+1; alternating human/ai; last is the new input |
| 12 | streaming | `streamText.ts`: `collectStream(llm, prompt, onChunk?: (c:string)=>void): Promise<string[]>` | chunks join to the full reply; more than one chunk; `onChunk` called once per chunk |
| 13 | structured-output | `extractPerson.ts`: `extractPerson(llm, text: string): Promise<Person>` (zod `Person`) | valid reply -> `Person`; non-JSON reply -> throws Thai error; JSON violating schema -> throws Thai error |
| 14 | params-and-usage | `usage.ts`: `getTokenUsage(msg: AIMessage): {input:number; output:number; total:number}` | reads `usage_metadata`; missing -> zeros; `total = input+output` |
| 15 | error-handling-retry | `retry.ts`: `withRetry<T>(fn: () => Promise<T>, opts: {retries:number; delayMs:number}): Promise<T>` | succeeds after 2 failures; throws last error after retries exhausted; does **not** retry an error with `status === 401` (called once) |

- [ ] **Step 1-N:** For each row in order, run the per-lesson procedure.
- [ ] **Final:** `npm run check:solutions` PASS; manual: author runs `npm run lesson 07`, `08`, `12`, `13`, `14` against the real model and confirms sensible output; record any model quirks in `provider-findings.md`.

### Task 8: Part 2 — LangGraph core (lessons 16-25)

**Files:** `lessons/level-1-basics/16-state-schema/` ... `25-stream-values-updates/`.

**Interfaces:** Follow `docs/notes/api-findings.md` for state style and imports. Consumes `fakeLLM`. Each lesson exports a `build<Topic>Graph(...)` returning a compiled graph where applicable, so exercises call `.invoke`.

| # | slug | example: signature | exercises |
|---|---|---|---|
| 16 | state-schema | `state.ts`: `ChatState` with `question: string`, `answer: string` | defaults are empty strings; schema holds given values; extra key rejected/ignored per findings |
| 17 | first-node | `greetNode.ts`: `greetNode(state): {answer: string}` + `buildGreetGraph()` | node returns a partial update; does not mutate input; graph START->node->END returns merged state |
| 18 | edges-start-end | `twoSteps.ts`: `buildTwoStepGraph(log: string[])` | nodes run in edge order (log); final state from last node; compile fails when START has no edge |
| 19 | llm-node | `answerNode.ts`: `makeAnswerNode(llm)` + `buildAnswerGraph(llm)` | `answer` equals fake reply; `question` unchanged; real model via `run.ts` |
| 20 | sequence | `draftRefine.ts`: `buildDraftRefineGraph(llm)` | with `fakeLLM(["draft","final"])` ends with `"final"`; `draft` kept in state; llm called twice |
| 21 | conditional-edge | `route.ts`: `routeByLength(state): "short"\|"long"` + graph | route values at boundary (length 20 vs 21); graph runs the chosen branch; other branch not run |
| 22 | loop-stop-condition | `refineLoop.ts`: `buildRefineLoop(llm, maxRounds: number)` | stops when reply is `"OK"`; stops at `maxRounds`; `rounds` counter correct |
| 23 | reducers | `reducers.ts`: state with `log: string[]` (append reducer) and `score: number` (sum reducer) | append keeps both entries; parallel nodes' writes combine; field without reducer is overwritten |
| 24 | compile-and-invoke | `invokeDemo.ts`: `buildInvokeDemo()` | missing optional input uses defaults; two invokes are independent; result has all state keys |
| 25 | stream-values-updates | `streamDemo.ts`: `collectUpdates(graph, input): Promise<{node:string; update:object}[]>` | update order equals node order; last `values` chunk equals `invoke` result; count equals number of nodes |

- [ ] **Step 1-N:** For each row in order, run the per-lesson procedure.
- [ ] **Final:** `npm run check:solutions` PASS; `npm run typecheck` exit 0.

### Task 9: Level-1 mini project, README, level verification

**Files:**
- Create: `lessons/level-1-basics/26-mini-assistant/` (README, `assistant.ts`, `assistant.test.ts`, `run.ts`, `solution/`), `README.md` (root, English quick-start)

**Interfaces:**
- Produces `buildAssistantGraph(llm: BaseChatModel)`: START -> `classify` (short/long question) -> `answer` (system prompt + question) -> `format` -> END. `run.ts` is a readline loop over `getLLM()`.

- [ ] **Step 1:** Exercises (todo): classification routes correctly; answer includes persona via system message; format node adds a trailing line. Follow the per-lesson procedure (Task 6).
- [ ] **Step 2:** Root `README.md`: prerequisites (Node version), `npm install`, create `.env` from `.env.example`, how to get `OLLAMA_API_KEY` (ollama.com/settings/keys), how to run a lesson's tests and `npm run lesson NN`, how to swap provider (edit `src/llm.ts`), changing `OLLAMA_MODEL`, troubleshooting (401, 404/`/api`, 429), "tested with" versions.
- [ ] **Step 3 (level gate):** From a fresh clone (`git clone` into a temp dir, `npm ci`): `npm test` -> zero failures; `npm run check:solutions` -> all PASS; `npm run lint:lessons` -> clean; `npm run typecheck` -> exit 0. Author runs the real-LLM lessons (03, 07, 08, 12, 13, 14, 19, 26) once; record outcome and quota observations in `docs/notes/provider-findings.md`.
- [ ] **Step 4:** Commit `feat: level 1 complete`. Then write the Level 2 plan using the recorded findings.

## Self-review notes

- Spec coverage: layout, `llm.ts` contract, fake model, two-layer testing, lesson format, Thai/English split, pinned versions, Part 0-2 and Level-1 mini project are all mapped to tasks. Levels 2-3 are deferred to separate plans (stated in Scope note).
- Types used across tasks (`getLLM`, `fakeLLM`, `lintLessons`, `explainError`) have one definition each.

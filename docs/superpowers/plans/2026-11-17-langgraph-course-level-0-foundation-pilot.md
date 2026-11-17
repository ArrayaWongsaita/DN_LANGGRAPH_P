# LangGraph Course — Level 0 (Raw HTTP) Foundation + Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-level lesson ids (`0-03` vs `1-03`), a provider `chatUrl`, a `fakeFetch` test helper and a live fetch spike, then build pilot lesson 0-01 and **stop for the author to approve the feel** before the rest of Level 0.

**Architecture:** Level 0 lives in `lessons/level-0-fetch/`, additive to Level 1. Lessons are numbered per level; a bare `NN` still means Level 1. Level 0 functions take `fetchFn: typeof fetch` so checkers pass `fakeFetch(...)` and never touch the network. `run.ts` passes the real `fetch` and the URL/key from `src/llm.ts`.

**Tech Stack:** TypeScript, Node 26, pnpm, vitest 4.1.12, zod 4.6.7 (installed). No new dependencies (`fetch` is built in).

**Spec:** `docs/superpowers/specs/2026-11-17-langgraph-course-design.md` (section "Level 0 — Raw HTTP")

**Scope note:** This plan ends at the **pilot gate** (Task 6). Lessons 0-02..0-06 and the comparison boxes in Level 1 lessons 03-08 get their own plan after approval and after the spike results are known.

## Global Constraints

- Lesson text in **Thai**; code, repo docs, commit messages in **English**. Lesson text never names a provider; it says "LLM" / "ผู้ให้บริการ" and points to `.env`.
- Level 0 is a labelled exception to "teach the real tools": README says up front "ทำเองก่อน เพื่อเห็นว่า framework ช่วยอะไร". Keep each lesson shorter than Level 1 lesson 03.
- Lesson folder format is unchanged: `README.md` + starter `<topic>.ts` (gaps `// 👉 ข้อ N`, stubbed `todo(N)`) + checker `<topic>.test.ts` (never calls the network or `getLLM`) + optional `run.ts` + `solution/<topic>.ts`. README ends with "คุณทำได้แล้ว", 2-3 things to remember, what comes next.
- Commands use pnpm. Lesson ids: `pnpm test:lesson 0-01` (Level 0), `pnpm test:lesson 03` (Level 1, unchanged). Error messages and READMEs say `pnpm`.
- Level 1 lessons, their numbers and their READMEs' "บทที่ N" references stay as they are.
- `pnpm test` stays green on a fresh checkout; lesson checkers are red until gaps are filled. Tests never use the network; live calls only in `run.ts` and the spike, only with the author's go-ahead.
- No new dependencies. `.env` is git-ignored.

## Review Focus

- Same lesson number in two levels (`01` in level 0 and 1) must NOT be reported as a duplicate; the same number twice inside one level must. Pinned in Task 1.
- Bare `NN` resolves to Level 1; `0-NN` to Level 0; an unknown level or lesson prints a Thai usage message, not a stack trace. Pinned in Task 1.
- `check:solutions` / `check:starters` must cover Level 0 lessons too (they iterate all level folders) and work when level 0 has a lesson. Pinned in Task 1 with a Level 0 fixture.
- A provider whose chat endpoint is not OpenAI-compatible: `describeProvider().chatUrl` must still be defined for every provider in the table (ollama via its `/v1` compatibility path). Pinned in Task 2.
- A learner running Level 0 with a blank or invalid key must see the Thai message from lesson 0-02's subject, not a crash. In 0-01, `run.ts` prints a Thai hint when the key is missing before calling fetch. Pinned in Task 5 (run.ts guarded by `checkKey`-style test via `scripts/run-lesson.test.ts` fixture).
- `fakeFetch` must fail loudly when a lesson makes more requests than scripted. Pinned in Task 3.

---

## File Structure

```
src/llm.ts (chatUrl)  src/fakeFetch.ts  src/fakeFetch.test.ts
scripts/find-lesson.ts(+test)  scripts/lint-lessons.ts(+test)  scripts/test-lesson.ts  scripts/run-lesson.ts(+test)
scripts/fixtures/lessons/level-0-fixture/...   scripts/fixtures/run-lesson/...
lessons/level-0-fetch/01-first-fetch/{README.md,callLLM.ts,callLLM.test.ts,run.ts,solution/callLLM.ts}
docs/notes/fetch-findings.md
```

### Task 1: Per-level lesson ids

**Files:**
- Modify: `scripts/find-lesson.ts`, `scripts/find-lesson.test.ts`, `scripts/lint-lessons.ts`, `scripts/lint-lessons.test.ts`, `scripts/test-lesson.ts`, `scripts/run-lesson.ts`, `scripts/run-lesson.test.ts`, `scripts/check-lessons.test.ts`
- Create: `scripts/fixtures/lessons/level-0-fixture/01-zero-good/...` (same shape as `01-good`, so the same number `01` exists in two levels)

**Interfaces:**
- Produces: `parseLessonId(id: string): { level: number; num: string } | undefined` accepting `"3"`, `"03"` (level 1), `"0-03"`, `"1-03"`; `findLesson(root: string, id: string): string | undefined` using it (level = folder `level-<n>-*`). `lintLessons(root, opts)` keeps its signature but checks duplicates and (strict) contiguity per level folder.
- Consumes: existing `lintLessons`, `checkLessons`, `findLesson` (bare number kept working).

- [ ] **Step 1:** Add failing tests. `find-lesson.test.ts`: `parseLessonId("0-03")` -> `{level:0,num:"03"}`; `"03"` and `"3"` -> level 1; `"x"` and `"0-"` -> undefined; `findLesson` with a fixture root containing `level-0-fixture/01-zero-good` and `level-0-fixture/...` resolves `"0-01"` to the level-0 folder and `"01"` to the level-1 folder. `lint-lessons.test.ts`: the same number in `level-0-x` and `level-1-x` is NOT a duplicate; twice in one level is; strict contiguity checked per level (level 0 with 01,03 reports missing 02, level 1 untouched). `check-lessons.test.ts`: still reports exactly the two known problem lessons (the new level-0 fixture is healthy).
- [ ] **Step 2:** Run `pnpm vitest run scripts` -> Expected: FAIL (`parseLessonId` missing, duplicate rule is global).
- [ ] **Step 3:** Implement `parseLessonId`, update `findLesson`, make lint's duplicate/contiguity bookkeeping per level, update `test-lesson.ts` / `run-lesson.ts` usage messages (`pnpm test:lesson <เลขบท>` or `0-<เลขบท>`) and unknown-id handling (Thai message, exit 1).
- [ ] **Step 4:** Run `pnpm test && pnpm typecheck && pnpm lint:lessons:strict && pnpm check:solutions && pnpm check:starters` -> Expected: all PASS (Level 1 lessons unaffected).
- [ ] **Step 5:** Commit `feat: per-level lesson ids`.

### Task 2: Provider `chatUrl`

**Files:** Modify `src/llm.ts`, `src/llm.test.ts`, `.env.example` (comment only), `scripts/check-llm.ts` (print `chatUrl` in the report header line is NOT required; leave unchanged).

**Interfaces:**
- Produces: `describeProvider(options?): { provider: ProviderName; model: string; keyVar: string; chatUrl: string }`. groq: `https://api.groq.com/openai/v1/chat/completions`. ollama: `<OLLAMA_BASE_URL or https://ollama.com>/v1/chat/completions` (same trailing-slash and `/api` rules as the existing ollama row). Header comment in `src/llm.ts` updated: a new provider row also supplies `chatUrl`.

- [ ] **Step 1:** Add failing tests in `src/llm.test.ts` (env stubbed as in existing tests): default `chatUrl` is the groq URL; `LLM_PROVIDER=ollama` gives `https://ollama.com/v1/chat/completions`; `OLLAMA_BASE_URL=https://example.test/` gives `https://example.test/v1/chat/completions`; `OLLAMA_BASE_URL=https://ollama.com/api` throws the existing `/api` error.
- [ ] **Step 2:** Run `pnpm vitest run src/llm.test.ts` -> Expected: FAIL.
- [ ] **Step 3:** Add `chatUrl: () => string` to the `Provider` interface and both rows; return it from `describeProvider`.
- [ ] **Step 4:** Run `pnpm test && pnpm typecheck` -> Expected: PASS.
- [ ] **Step 5:** Commit `feat: provider chatUrl for raw fetch lessons`.

### Task 3: `fakeFetch` test helper

**Files:** Create `src/fakeFetch.ts`, `src/fakeFetch.test.ts`.

**Interfaces:**
- Produces: `fakeFetch(replies: { status?: number; body: unknown; headers?: Record<string, string> }[]): FakeFetch` where `type FakeFetch = typeof fetch & { calls: { url: string; init: RequestInit | undefined }[] }`. Each call returns the next scripted reply as a real `Response` (`status` default 200; object bodies JSON-encoded with `content-type: application/json`, string bodies sent as text). Replies do NOT cycle: calling more times than scripted rejects with `Error("fakeFetch: ไม่มี reply เหลือแล้ว (เรียกครั้งที่ N)")`.

- [ ] **Step 1:** Failing tests: first call returns the first reply (`await res.json()` equals body, `res.ok` true); a `status: 401` reply gives `res.ok === false` and `res.status === 401`; `calls` records url and the parsed `init.body`; a call beyond the scripted replies rejects with the message above; a string body is returned as text with `res.text()`.
- [ ] **Step 2:** Run `pnpm vitest run src/fakeFetch.test.ts` -> Expected: FAIL (module missing).
- [ ] **Step 3:** Implement `fakeFetch` with `new Response(...)`.
- [ ] **Step 4:** Run `pnpm test && pnpm typecheck` -> Expected: PASS.
- [ ] **Step 5:** Commit `feat: fakeFetch test helper`.

### Task 4: Live fetch spike (needs the author's go-ahead: real calls with their `GROQ_API_KEY`)

**Files:** Create `docs/notes/fetch-findings.md`; no production code.

- [ ] **Step 1:** Ask the author for the go-ahead, saying what will be called (about 6 requests, no key printed).
- [ ] **Step 2:** Using a throwaway script outside the repo's tracked files, call the `chatUrl` with `fetch`: (a) basic non-streaming request, record the response JSON shape and where the text lives (`choices[0].message`, and whether a reasoning field or `content: null` appears for the default model); (b) request with a bad key (record status, body shape); (c) request with a nonexistent model (record status, body shape); (d) `stream: true` (record the SSE framing: `data: {...}` lines, `data: [DONE]`, where the delta text lives, whether chunks can arrive split across reads); (e) a prompt asking for JSON only, three times, to see whether the model wraps it in a code fence; (f) response headers worth teaching (`retry-after` only if a 429 occurs naturally; do not provoke one).
- [ ] **Step 3:** Write `docs/notes/fetch-findings.md` with the exact request body that works, the minimal headers (`Authorization`, `Content-Type`), the response shape, the error body shapes, the SSE framing and the JSON-in-fence observation. Decide, and note in the file, whether lesson 0-04 can reproduce the fence problem deterministically (it will in the checker via a scripted reply regardless).
- [ ] **Step 4:** Commit `docs: fetch spike findings`.

### Task 5: Pilot lesson 0-01 — first `fetch`

**Files:** Create `lessons/level-0-fetch/01-first-fetch/{README.md,callLLM.ts,callLLM.test.ts,run.ts,solution/callLLM.ts}`

**Interfaces:**
- Consumes: `fakeFetch` (Task 3), `describeProvider` (Task 2, in `run.ts` only), `todo`.
- Produces: `callLLM(args: { fetchFn: typeof fetch; url: string; apiKey: string; model: string; question: string }): Promise<string>`. Gaps: (1) build the request: `fetchFn(url, { method: "POST", headers: { Authorization: "Bearer <apiKey>", "Content-Type": "application/json" }, body: JSON.stringify({ model, messages: [{ role: "user", content: question }] }) })`; (2) `await res.json()` and return the text from the path the spike recorded (`choices[0].message.content`). Exact field names come from `fetch-findings.md` (Task 4); if the spike shows differences, the plan yields to the findings and the ledger records a ruling.

README teaches (Thai): an LLM call is an HTTP POST; the pieces of the request (URL, headers, JSON body); the shape of the response and where the text is; the red->green loop in one short section (pointing to Level 1 lesson 01 for the long version); async/await call-out reused; closing section; and a "ทำเองก่อนเพื่อเห็นว่า framework ช่วยอะไร" note. `.env` setup steps (copy `.env.example`, put the key) appear here since Level 0 is where learners may start.

- [ ] **Step 1:** Write the checker `callLLM.test.ts` using `fakeFetch([{ body: <recorded response shape with text "สวัสดี"> }])`: returns `"สวัสดี"`; the recorded call has method POST, `Authorization` header `Bearer test-key`, `Content-Type` JSON, and a body whose `messages[0]` is `{ role: "user", content: <question> }` and whose `model` matches; a second test checks it uses the passed `url`.
- [ ] **Step 2:** Run `pnpm test:lesson 0-01` -> Expected: FAIL (module missing), then after the starter exists FAIL with `ยังไม่ได้ทำข้อ 1`.
- [ ] **Step 3:** Write starter, solution, README, and `run.ts` (loads `.env` via `describeProvider()`, stops with a Thai hint naming the key variable when the key is empty, otherwise calls `callLLM` with real `fetch` and prints the answer).
- [ ] **Step 4:** Run `pnpm check:solutions && pnpm check:starters && pnpm lint:lessons:strict && pnpm typecheck && pnpm test` -> Expected: all PASS. With the author's go-ahead run `pnpm lesson 0-01` once against the real provider and record the output in `docs/notes/fetch-findings.md`.
- [ ] **Step 5:** Commit `feat(lessons): pilot 0-01 first fetch`.

### Task 6: Pilot gate (stop for the author)

**Files:** Modify root `README.md` (reading order: Level 0 first for people who want to see raw HTTP, Level 1 for those who want to go straight to LangChain; lesson id syntax `0-01`).

- [ ] **Step 1:** Update README (English): reading order, `pnpm test:lesson 0-01`, note that bare numbers mean Level 1.
- [ ] **Step 2 (fresh-clone gate):** clone into a temp dir, `pnpm install`, then `pnpm test`, `pnpm check:solutions`, `pnpm check:starters`, `pnpm lint:lessons:strict`, `pnpm typecheck`. Expected: all pass.
- [ ] **Step 3:** Commit `docs: level 0 pilot readme`.
- [ ] **Step 4 (STOP):** Tell the author to run `pnpm test:lesson 0-01` and `pnpm lesson 0-01`, and report: the spike findings (response shape, errors, SSE, fences), anything in the findings that changes lessons 0-02..0-06, and rulings. **No other Level 0 lesson and no Level 1 comparison box is built before approval.**

## Self-review notes

- Spec coverage: per-level ids (Task 1), `chatUrl` and provider neutrality (Task 2), `fetchFn` injection / no-network checkers (Tasks 3, 5), spike-first (Task 4), pilot-then-stop (Tasks 5-6). Deferred on purpose: 0-02..0-06, Level 1 comparison boxes (needs the lessons to compare against), SSE decision (0-05 stays optional until the spike shows how hard it is).
- Types used across tasks: `parseLessonId`, `findLesson`, `describeProvider().chatUrl`, `fakeFetch`/`FakeFetch`, `callLLM` are each defined once.

# Course design principles

How the content of this LangGraph TypeScript course is designed. Read this before adding or changing a lesson. It records the approach already used in Levels 0–5 (all single-file lessons); the structural rules are enforced by `pnpm lint:lessons:strict`, the rest is convention.

## 1. Audience and goal

- The learner may have **never built an LLM app**. Assume no LangChain, LangGraph or agent background.
- The learner **writes the code**. The checks at the bottom of the script only tell them whether it works ("fill the gaps until every line is ✅").
- A lesson should end with a small win. Progress comes from many small lessons, not a few big ones.

## 2. One concept per lesson

- Each lesson teaches **one idea** and has **1–3 gaps** to fill. If a lesson needs more, split it.
- Name the idea in the title and in the first lines of "แนวคิด" (concept). A learner should be able to say in one sentence what they learned.
- New lessons build on earlier ones. Say which earlier lesson they continue ("continues 3-10..3-12") and avoid using an idea that has not been taught yet.
- When an earlier lesson hit a gotcha, later lessons may explain it (for example 5-22, the Pregel runtime, explains the node-name versus state-key rule), but never depend on the learner having read it.

## 3. Language

- **Lesson text is Thai** (README, comments marking gaps, hints).
- **Code, identifiers, commit messages and repository docs are English.**
- Lesson text **never names an LLM or embedding provider**. It says "the model set in `.env`" and "the embedding provider set in `.env`". Switching provider must not require editing a lesson.
- Level 1 lesson 02 (`02-llm-config/llm.ts`) shows the provider classes on purpose: the learner enables one block, and every later lesson (Levels 1–5) does `import { llm }` from it (lesson 01 exports the validated `env` for 02). Embeddings go through `getEmbeddings()` in `src/embeddings.ts`. Level 0 reads the provider through `describeProvider()` and uses raw `fetch`.

## 4. Lesson anatomy

Every level (0–5) uses the **single-file format**, described next. Older lessons once used a checker format (starter, `*.test.ts`, `run.ts`); it was retired because beginners found it too much to hold in their head. The linter still accepts a lesson that has a checker, but no lesson uses one now.

### The single-file format

A lesson folder `NN-slug/` (lowercase, digits, hyphens) has:

| File | Role |
|---|---|
| `README.md` | Thai text, same template |
| `<topic>.ts` | one flat script, read top to bottom: gaps marked `// 👉 ข้อ N` and stubbed with `todo(N)`, then the code that runs it and prints `✅`/`❌` through `check()` from `@src/check` |
| `solution/<topic>.ts` | the same file with the gaps filled |

Rules for this format:
- **No wrapper function** around the flow. Write the steps inline (`const reply = await llm.invoke(...)`); keep a function only when the function is the concept (a node, a router, a reducer).
- **Checks go at the bottom.** Every `check()` call lives in a final section under a banner (`// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้`), so the main code reads top to bottom without checking noise. Keep what a check needs (for example the `models` array in 04, or `results` in 20) as plain variables in the main code.
- **No checker file and no `run.ts`.** The script itself is the check: it prints the result and `check()` lines. It exits with code 1 when a check fails or a gap is still `todo`.
- Annotate a gap that is a whole value (`const reply: AIMessage = todo(1);`) so later lines keep their types; a bare `todo(1)` has type `never`.
- Because the script calls the real model (or real graph, database or server), lessons that call an LLM need a key. Lessons that do not run offline: Level 1: 10, 11, 12, 15, 17, 18, 19; Level 2: 2-08, 2-10, 2-12, 2-13, 2-18, 2-19, 2-23, 2-24; Level 3: 3-01..3-14, 3-20..3-23, 3-26, 3-31..3-33; Level 4: most lessons use scripted fake models (`fakeToolLLM`, `KeywordEmbeddings`) and need no key; Level 5: 5-04, 5-05, 5-07, 5-08, 5-12, 5-13 (part 1), 5-15..5-18, 5-22, 5-24, 5-25 need no LLM. Where a lesson needs a failure or a loop that a real model will not produce reliably (2-12 endless agent, 2-27 failing primary, 3-30 flaky primary model), the file uses a small scripted stand-in and keeps the real model for the rest.
- Lessons that need a service say so at the top of the file: Postgres (4-24, 5-02, 5-03, 5-10, 5-11, 5-13, 5-14, 5-23) stops with a message when `DATABASE_URL` is missing; embeddings (5-01..5-03, 5-23) need the embedding key; serving lessons (5-15..5-17) start `langgraph dev` themselves through `@src/devServer` and stop it in `finally`; 5-09 and 5-18 open a local HTTP server inside the script.
- When the offline part of a lesson is the point (SQL text, SSE text, ranking, reducers), the checks verify behaviour through fakes (fake fetch, fake client, in-memory knowledge base); the real service runs in an earlier section of the same file.
- CI cannot run these (some need a key or Docker), so `check:solutions` and `check:starters` skip lessons without a `*.test.ts`; `typecheck` and `lint:lessons` still cover the solutions. Every solution is run (real model, real database, real server where used) before it is committed.
- Level 0 uses the same format but reads its provider through `describeProvider()` from `src/llm.ts` and calls it with raw `fetch` (works with groq, google and deepseek; its failure lesson 0-02 causes real 401/404/network errors on purpose).
- Levels 2 and 3 use the same format; their `llm` comes from `lessons/level-1-basics/02-llm-config/llm.ts` (solutions import `../../../level-1-basics/02-llm-config/solution/llm`). Checks assert structure (message counts, state, tool results) rather than exact model wording. Groq's free tier can hit its tokens-per-minute limit on multi-turn lessons (2-06, 2-17); wait a minute or switch provider in 1-02.
- Lessons depend on earlier ones: 02 imports `env` from 01, later lessons import `llm` from 02. Solutions import the earlier lesson's `solution/` file.

Lesson ids always carry the level: `<level>-<lesson>` (`0-01`, `1-08`, `2-05`, `5-12`). A bare number is rejected.

## 5. Writing the starter

- Give the learner the **whole shape** and remove only the part that carries the concept. Surrounding code should be complete and readable.
- Each gap has a Thai comment that says what to do and, where useful, the approach in one line (for example `// แนวทาง: await llm.invoke([new HumanMessage(question)])`).
- `todo(N)` numbers gaps in the order the learner should fill them. Failing with "ยังไม่ได้ทำข้อ N" is the intended first state, so the message must be friendly and point to the README.
- Starters import project helpers through the `@src/*` alias (`@src/todo`, `@src/check`, `@src/fakeToolLLM`, `@src/devServer`). The model comes from lesson 1-02 (`@@LLM` in the generator, a relative path to `level-1-basics/02-llm-config/llm` in files).

## 6. Writing the checks

- The checks live at the bottom of the file under the banner. Each is `check("what it proves", boolean, "hint")`; the hint helps a learner who sees ❌.
- Test **behaviour, not the wording of the solution**. When SQL, SSE text or another string is checked, verify the structure and parameter order, not incidental whitespace.
- A check has to be able to fail. After writing a lesson, run the starter (it must stop at `todo`) and think of a wrong implementation (a mutant) that would still pass; if there is one, tighten the check.
- Keep the offline part deterministic: use the fakes in `src/` (`fakeToolLLM`, `KeywordEmbeddings`, in-memory stores) and pure-function seams. Real services are fine in the script, but a lesson must say which ones it needs and fail with a clear message (not a stack trace) when they are missing.

## 7. Seeing it for real

- A lesson should **call the code the learner just wrote** against the real thing (model, database, server) and print the raw result, so the fake-backed checks and the real result can be compared.
- Real Postgres uses the course container only (`langgraph-course-postgres`, `127.0.0.1:5434`). Never touch other database instances; clean up tables the lesson created in `finally`.
- Every solution is run against the real service before it is committed.

## 8. Before writing: verify against the installed version

- Level 4 and 5 lessons start with an **API spike** against the versions in `package.json`. Do not write lesson text from memory of the docs; run the code, record the real shapes and failure modes, then teach those.
- Findings go to `docs/notes/` (for example `api-findings.md`, `provider-findings.md`). Link them from the design doc when they shape a decision.
- Prefer the official docs index as the scope reference, and keep `docs/notes/coverage-audit-*.md` current so gaps are visible.

## 9. Planning a level

1. Audit coverage against the official docs and list gaps by value to the learner.
2. Write a short design doc in `docs/superpowers/plans/` with the lesson list, decisions, risks and order of work.
3. Build in parts. After each part: run every new solution (`pnpm tsx lessons/<level>/<NN-slug>/solution/<file>.ts`), then `pnpm lint:lessons:strict`, `pnpm typecheck`, `pnpm test`. One commit per part.
4. Do a mutant review of the part's checks.
5. Update the README status line and the "Levels at a glance" table.

Lesson ids follow build order, because the linter requires contiguous numbering; if the order changes, renumber and record the change as an amendment in the design doc.

## 10. Order inside a level

Move from concept to practice to integration:

1. **Foundations of the topic** (one idea each, as small as possible).
2. **Depth and production concerns** (failures, limits, housekeeping, security).
3. **A capstone** that combines several earlier lessons and is the main integration piece of the level.

Things that cannot be run without an account or a product (hosted Studio, deployments, UI framework hooks) are **described, not run**. The course does not require a LangSmith account, and it does not send trace data out.

## 11. Production habits taught on purpose

These recur across levels, so teach them by example rather than lecture:

- Fakes for the offline checks, real services in a clearly marked section of the script.
- Idempotent writes (hash, then upsert) and safe retries.
- Least privilege: read-only SQL, single statement, allowlisted tables, row caps, timeouts.
- Guardrails and permission checks around tools.
- Cite sources in answers that use retrieval.

## 12. Checklist for a new lesson

- [ ] One concept, 1–3 gaps, Thai text, no provider name in the lesson text
- [ ] README follows the template and names the previous and next lesson
- [ ] Starter has `todo(N)` gaps with Thai hints; solution has the same file names
- [ ] The checks sit under the bottom banner, stop at `todo` for the starter, are all ✅ for the solution, and survive a mutant review
- [ ] Any real service the lesson needs is named at the top of the file and was used when running the solution
- [ ] `pnpm lint:lessons:strict`, `pnpm typecheck`, `pnpm test` pass
- [ ] README level table and status line updated when a lesson is added

# Course design principles

How the content of this LangGraph TypeScript course is designed. Read this before adding or changing a lesson. It records the approach already used in Levels 0–5; the structural rules are enforced by `pnpm lint:lessons:strict`, the rest is convention.

## 1. Audience and goal

- The learner may have **never built an LLM app**. Assume no LangChain, LangGraph or agent background.
- The learner **writes the code**. The checker only tells them whether it works ("fill the gaps until the checker is green").
- A lesson should end with a small win. Progress comes from many small lessons, not a few big ones.

## 2. One concept per lesson

- Each lesson teaches **one idea** and has **1–3 gaps** to fill. If a lesson needs more, split it.
- Name the idea in the title and in the first lines of "แนวคิด" (concept). A learner should be able to say in one sentence what they learned.
- New lessons build on earlier ones. Say which earlier lesson they continue ("continues 3-10..3-12") and avoid using an idea that has not been taught yet.
- When an earlier lesson hit a gotcha, later lessons may explain it (for example 5-22, the Pregel runtime, explains the node-name versus state-key rule), but never depend on the learner having read it.

## 3. Language

- **Lesson text is Thai** (README, comments marking gaps, hints).
- **Code, identifiers, commit messages and repository docs are English.**
- Outside Level 1, lesson text **never names an LLM or embedding provider**. It says "the model set in `.env`" and "the embedding provider set in `.env`", and code goes through `getLLM()` and `getEmbeddings()`. Switching provider must not require editing a lesson.
- Level 1 is the exception: lesson 02 (`02-llm-config/llm.ts`) shows the provider classes on purpose, the learner enables one block, and every later Level 1 lesson does `import { llm }` from it (lesson 01 exports the validated `env` for 02). The rest of the course still uses `getLLM()`.

## 4. Lesson anatomy

There are two formats. **Level 1 uses the single-file format** (below, "Level 1: single file"). Levels 0 and 2-5 use the checker format described next.

Every lesson folder `NN-slug/` (lowercase, digits, hyphens) has:

| File | Role |
|---|---|
| `README.md` | Thai text following `scripts/lesson-template/README.md`: แนวคิด → ดูตัวอย่าง → โจทย์ → คุณทำได้แล้ว → ข้อควรจำ → บทถัดไป |
| `<topic>.ts` | the starter: almost complete code, gaps marked `// 👉 ข้อ N` and stubbed with `todo(N)` |
| `<topic>.test.ts` | the checker; red until the gaps are filled; the learner never edits it |
| `solution/<topic>.ts` | the finished version, same file names as the starters |
| `run.ts` | optional; runs the learner's code against a real service with `pnpm lesson NN` |

Rules the linter enforces: a README exists, there is at least one `*.test.ts` (or, for a single-file lesson, exactly one starter `.ts`), every starter has a `todo(` gap, every starter has a counterpart in `solution/`, `solution/` holds no checker, checkers never use `getLLM` or contain `todo(`, and numbering inside a level is contiguous.

### Level 1: single file

Beginners found the checker layout (starter, checker, `run.ts`, wrapper functions) too much to hold in their head. Level 1 lessons are:

| File | Role |
|---|---|
| `README.md` | Thai text, same template |
| `<topic>.ts` | one flat script, read top to bottom: gaps marked `// 👉 ข้อ N` and stubbed with `todo(N)`, then the code that runs it and prints `✅`/`❌` through `check()` from `@src/check` |
| `solution/<topic>.ts` | the same file with the gaps filled |

Rules for this format:
- **No wrapper function** around the flow. Write the steps inline (`const reply = await llm.invoke(...)`); keep a function only when the function is the concept (a node, a router, a reducer).
- **No checker file and no `run.ts`.** The script itself is the check: it prints the result and `check()` lines. It exits with code 1 when a check fails or a gap is still `todo`.
- Annotate a gap that is a whole value (`const reply: AIMessage = todo(1);`) so later lines keep their types; a bare `todo(1)` has type `never`.
- Because the script calls the real model (or real graph), lessons that call an LLM need a key. Lessons that do not (10, 11, 12, 15, 17, 18, 19) run offline.
- CI cannot run these (no key), so `check:solutions` and `check:starters` skip lessons without a `*.test.ts`; `typecheck` and `lint:lessons` still cover the solutions. Every solution is run against the real model before it is committed.
- Lessons depend on earlier ones: 02 imports `env` from 01, later lessons import `llm` from 02. Solutions import the earlier lesson's `solution/` file.

Lesson ids: Level 1 uses a bare number (`08`), the other levels use a prefix (`0-01`, `2-05`, `5-12`).

## 5. Writing the starter

- Give the learner the **whole shape** and remove only the part that carries the concept. Surrounding code should be complete and readable.
- Each gap has a Thai comment that says what to do and, where useful, the approach in one line (for example `// แนวทาง: await llm.invoke([new HumanMessage(question)])`).
- `todo(N)` numbers gaps in the order the learner should fill them. Failing with "ยังไม่ได้ทำข้อ N" is the intended first state, so the message must be friendly and point to the README.
- Starters import project helpers through the `@src/*` alias (`@src/todo`, `@src/llm`, `@src/fakeLLM`).

## 6. Writing the checker

- A checker must be **deterministic and offline**: no real LLM, no database, no network, no API key. Use the fakes in `src/` (`fakeLLM`, `fakeToolLLM`, `fakeFetch`, `KeywordEmbeddings`, in-memory stores) and pure-function seams.
- Test **behaviour, not the wording of the solution**. When SQL, SSE text or another string is checked, verify the structure and parameter order, not incidental whitespace.
- A checker has to be able to fail. Every starter must fail its own checker (`pnpm check:starters`) and every solution must pass (`pnpm check:solutions`). After writing a lesson, think of a wrong implementation (a mutant) that would still pass the checker; if there is one, tighten the checker.
- When a lesson is about something only a real service can show (a vector database, a server process), make the **checkable part pure** (build the SQL, format the event, merge the ranks) and keep the real service in `run.ts`.

## 7. `run.ts`: seeing it for real

- `run.ts` exists so the learner sees the concept work against the real thing. It should **call the function the learner just wrote**, then print the raw result, so the two can be compared (1-03 and 1-05 do this; 1-04 was fixed to do it).
- It may need a key, Docker or a server. That is acceptable only here, never in a checker.
- Every new `run.ts` is run against the real service before it is committed.
- Real Postgres uses the course container only (`langgraph-course-postgres`, `127.0.0.1:5434`). Never touch other database instances.

## 8. Before writing: verify against the installed version

- Level 4 and 5 lessons start with an **API spike** against the versions in `package.json`. Do not write lesson text from memory of the docs; run the code, record the real shapes and failure modes, then teach those.
- Findings go to `docs/notes/` (for example `api-findings.md`, `provider-findings.md`). Link them from the design doc when they shape a decision.
- Prefer the official docs index as the scope reference, and keep `docs/notes/coverage-audit-*.md` current so gaps are visible.

## 9. Planning a level

1. Audit coverage against the official docs and list gaps by value to the learner.
2. Write a short design doc in `docs/superpowers/plans/` with the lesson list, decisions, risks and order of work.
3. Build in parts. After each part: `pnpm check:solutions`, `pnpm check:starters`, `pnpm lint:lessons:strict`, `pnpm typecheck`, `pnpm test`. One commit per part.
4. Do a mutant review of the part's checkers.
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

- Fakes for tests, real services only in `run.ts`.
- Idempotent writes (hash, then upsert) and safe retries.
- Least privilege: read-only SQL, single statement, allowlisted tables, row caps, timeouts.
- Guardrails and permission checks around tools.
- Cite sources in answers that use retrieval.

## 12. Checklist for a new lesson

- [ ] One concept, 1–3 gaps, Thai text, no provider name in the lesson text
- [ ] README follows the template and names the previous and next lesson
- [ ] Starter has `todo(N)` gaps with Thai hints; solution has the same file names
- [ ] Checker is offline and deterministic, fails on the starter, passes on the solution, and survives a mutant review
- [ ] `run.ts` (if any) calls the learner's function and has been run against the real service
- [ ] `pnpm check:solutions`, `pnpm check:starters`, `pnpm lint:lessons:strict`, `pnpm typecheck`, `pnpm test` all pass
- [ ] README level table and status line updated when a lesson is added

# Course design principles

Read this before adding or revising a lesson in the LangGraph TypeScript course. Every level uses single-file exercises. `pnpm lint:lessons:strict` checks the file structure. [Lesson 2-05](../lessons/level-2-practical/05-trim-messages/README.md) is the reference for the example-first format used across Levels 0–2.

## 1. Audience and goal

- The learner may have **never built an LLM app**. Assume no LangChain, LangGraph or agent background.
- The learner **writes the code**. The checks at the bottom of the script only tell them whether it works ("fill the gaps until every line is ✅").
- A lesson should end with a small win. Progress comes from many small lessons, not a few big ones.

## 2. One concept per lesson

- Teach **one observable idea** per lesson. Start with **one gap** that implements the idea. Use up to three where a workflow or capstone needs related steps.
- Name the idea in the title and open with a concrete problem. A learner should be able to predict what will change when they run the example.
- New lessons build on earlier ones. Say which earlier lesson they continue ("continues 3-10..3-12") and avoid using an idea that has not been taught yet.
- When an earlier lesson hit a gotcha, later lessons may explain it (for example 5-22, the Pregel runtime, explains the node-name versus state-key rule), but never depend on the learner having read it.

## 3. Language

- **Lesson text is Thai** (README, comments marking gaps, hints).
- **Code, identifiers, commit messages and repository docs are English.**
- Refer to "the model set in `.env`" and "the embedding provider set in `.env`" in examples. Name providers when explaining configuration or compatibility. Switching among supported providers should require only a configuration change.
- Learners choose `LLM_PROVIDER` and optionally `LLM_MODEL` in `.env`. Lesson 1-02 exports the chat model through `getLLM()`. Later lessons can import that model or use the shared factory to demonstrate an option. Embeddings go through `getEmbeddings()` in `src/embeddings.ts`. Level 0 reads the provider through `describeProvider()` and uses raw `fetch`.

## 4. Lesson anatomy

Every level (0–5) uses the **single-file format**, described next. Older lessons once used a checker format (starter, `*.test.ts`, `run.ts`); it was retired because beginners found it too much to hold in their head. The linter still accepts a lesson that has a checker, but no lesson uses one now.

### The single-file format

A lesson folder `NN-slug/` (lowercase, digits, hyphens) has:

| File | Role |
|---|---|
| `README.md` | Thai walkthrough with a runnable exercise, observed output, and values to try |
| `<topic>.ts` | one flat script, read top to bottom: gaps marked `// 👉 ข้อ N` and stubbed with `todo(N)`, then the code that runs it and prints `✅`/`❌` through `check()` from `@src/check` |
| `solution/<topic>.ts` | the same file with the gaps filled |

Rules for this format:
- **No wrapper function** around the flow. Write the steps inline (`const reply = await llm.invoke(...)`); keep a function only when the function is the concept (a node, a router, a reducer).
- **Checks go at the bottom.** Every `check()` call lives in a final section under a banner (`// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้`), so the main code reads top to bottom without checking noise. Keep what a check needs (for example the `models` array in 04, or `results` in 20) as plain variables in the main code.
- **No checker file and no `run.ts`.** The script itself is the check: it prints the result and `check()` lines. It exits with code 1 when a check fails or a gap is still `todo`.
- Annotate a gap that is a whole value (`const reply: AIMessage = todo(1);`) so later lines keep their types; a bare `todo(1)` has type `never`.
- Keep the main exercise local when the concept is local. Use fixed `AIMessage` objects for reducers, a scripted model for a predictable tool loop or stream, and the actual graph or checkpointer the lesson teaches. Use a live model when the concept depends on provider behavior or the lesson is an integration exercise. Tell the learner what requires a key beside the run command.
- Lessons that need a service say so at the top of the file: Postgres (4-24, 5-02, 5-03, 5-10, 5-11, 5-13, 5-14, 5-23) stops with a message when `DATABASE_URL` is missing; embeddings (5-01..5-03, 5-23) need the embedding key; serving lessons (5-15..5-17) start `langgraph dev` themselves through `@src/devServer` and stop it in `finally`; 5-09 and 5-18 open a local HTTP server inside the script.
- Run each changed solution directly. The `check:solutions` and `check:starters` scripts skip single-file lessons. `pnpm typecheck` and `pnpm lint:lessons:strict` still cover them.
- For raw HTTP lessons, keep `fetch` in the request flow. Use local `Response` values or a local stream for exercises about status codes, response shapes and stream parsing. Label the command that calls the live endpoint and identify the provider configuration it uses.
- For exercises that import the model from 1-02, the starter imports the learner's `llm.ts` and the solution imports its counterpart in `solution/`. Live checks use message types, state, tool results, or schema fields. Keep scripted examples in local modules so the offline path can run before provider setup.

**Playground.** `pnpm play <id>` runs `<lesson>/playground.ts`. The generator copies the imports used by the solution and adds Thai experiments from `scripts/playground-ideas.ts`. It rewrites relative imports to `@lessons/...` and drops the check import. For Level 1 and 2 solutions that import the 1-02 model, the generated playground points to the learner's own 1-02 configuration. The runner generates the playground when missing, and `--reset` regenerates it. Config lessons 1-01 and 1-02 do not have a playground. `pnpm playground:build` regenerates all playgrounds.

Lesson ids always carry the level: `<level>-<lesson>` (`0-01`, `1-08`, `2-05`, `5-12`). A bare number is rejected.

### Writing the README

1. **Open with the task.** Use one concrete scenario and name the earlier lesson that gives the learner the needed context.
2. **Start with the smallest example.** Link the starter, identify the numbered gap, show the exact `pnpm lesson <id>` command, and state the prerequisites. Include the lines that explain the core operation. For a fragment, tell the reader which variables come from the script.
3. **Show what running it produces.** Use a short terminal transcript, a JSON result, a before/after array, or an event timeline. Explain the visible change. Mark variable model output, generated IDs and timings as examples.
4. **Explain the inputs.** List the relevant parameters or fields with their types, accepted values, defaults, and interactions when they matter. Use the JavaScript API from the versions pinned in the project.
5. **Change one thing and compare results.** Reuse the same input and show at least two outcomes. Include boundaries when they reveal how the feature works, such as an empty history, a rejected approval, or a failed retry. Point learners to the playground for experiments that change the exercise's expected result.
6. **Link the solution and the next lesson.** Keep the main path focused. Put a larger integration example after the starter example when it helps learners apply the idea.

## 5. Writing the starter

- Give the learner the **whole shape** and remove only the part that carries the concept. Surrounding code should be complete and readable.
- Print the result before the checks. Use the inputs, output fields, and expected behavior shown in the README.
- Each gap has a Thai comment that says what to do and, where useful, the approach in one line (for example `// แนวทาง: await llm.invoke([new HumanMessage(question)])`).
- `todo(N)` numbers gaps in the order the learner should fill them. Failing with "ยังไม่ได้ทำข้อ N" is the intended first state, so the message must be friendly and point to the README.
- Starters import project helpers through the `@src/*` alias (`@src/todo`, `@src/check`, `@src/fakeToolLLM`, `@src/devServer`). The model comes from lesson 1-02 (`@@LLM` in the generator, a relative path to `level-1-basics/02-llm-config/llm` in files).

## 6. Writing the checks

- The checks live at the bottom of the file under the banner. Each is `check("what it proves", boolean, "hint")`; the hint helps a learner who sees ❌.
- Test **behaviour, not the wording of the solution**. When SQL, SSE text or another string is checked, verify the structure and parameter order, not incidental whitespace.
- A check has to be able to fail. After writing a lesson, run the starter (it must stop at `todo`) and think of a wrong implementation (a mutant) that would still pass; if there is one, tighten the check.
- Keep the offline part deterministic: use the fakes in `src/` (`fakeToolLLM`, `KeywordEmbeddings`, in-memory stores) and pure-function seams. Real services are fine in the script, but a lesson must say which ones it needs and fail with a clear message (not a stack trace) when they are missing.

## 7. Seeing it for real

- Run the actual API that the exercise teaches. A lesson about checkpointing runs the real graph and saver with predictable responses. A lesson about provider behavior runs the configured model and labels variable output. If there is a separate live example, label its command and prerequisites.
- Real Postgres uses the course container only (`langgraph-course-postgres`, `127.0.0.1:5434`). Never touch other database instances; clean up tables the lesson created in `finally`.
- Verify outputs against the installed packages. Exercise the offline path without keys and record which live paths still need a credentialed run.

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

- Deterministic inputs for offline checks and a clearly marked live path where the feature needs one.
- Idempotent writes (hash, then upsert) and safe retries.
- Least privilege: read-only SQL, single statement, allowlisted tables, row caps, timeouts.
- Guardrails and permission checks around tools.
- Cite sources in answers that use retrieval.

## 12. Checklist for a new lesson

- [ ] One concept, 1–3 gaps, Thai text, provider names used only for configuration and compatibility
- [ ] README has the smallest example, command, prerequisites, observed output, accepted options, and a comparison with a changed value
- [ ] Lesson links include the starter, solution and the next lesson where applicable
- [ ] Starter has `todo(N)` gaps with Thai hints; solution has the same file names
- [ ] The checks sit under the bottom banner, stop at `todo` for the starter, are all ✅ for the solution, and survive a mutant review
- [ ] Offline solutions run without keys and live examples list the service and what was verified
- [ ] `pnpm lint:lessons:strict`, `pnpm typecheck`, `pnpm test` pass
- [ ] README level table and status line updated when a lesson is added

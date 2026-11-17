# Level 2 (Practical) Implementation Plan

> Native/inline execution, same lesson format as Levels 0-1 (README, starter with `todo(N)` gaps, checker, `solution/`). Lessons are `2-NN`, folder `lessons/level-2-practical/NN-slug`.

**Spec:** `docs/superpowers/specs/2026-11-17-langgraph-course-design.md` (Level 2 section)

**Foundation done:** `src/fakeToolLLM.ts` (scripted replies and tool calls, records `calls`, throws when the script runs out). Verified against installed APIs: `MessagesValue`, `MemorySaver`, `thread_id`, `getState`/`updateState`, `RemoveMessage`, `trimMessages`, `SqliteSaver`, `createAgent`.

## Order (build and verify each part before the next)
- **Part 3 Memory (2-01..2-07):** messages state; checkpointer; thread_id; read/update state; trim; summarize; SqliteSaver.
- **Mini project (2-08):** chatbot with memory and a tool, persisted.
- **Part 4 Tools and agents (2-09..2-17):** tool; bindTools; ToolNode; hand-built ReAct loop; recursion limit; tool errors; structured final answer; dynamic model/tools; createAgent.
- **Part 5 Human-in-the-loop (2-18..2-21)**, **Part 6 Streaming (2-22..2-24)**, **Part 6b Reliability (2-25..2-27).**

Each part ends with `pnpm test`, `check:solutions`, `check:starters`, `lint:lessons:strict`, `typecheck`, a commit, and a live check of any `run.ts`.

# Level 3 (Advanced) Implementation Plan

> Native/inline execution, same lesson format as Levels 0-2. Lessons are `3-NN`, folder `lessons/level-3-advanced/NN-slug`. Each lesson is self-contained (no cross-lesson imports; the per-lesson check copies one lesson at a time).

**Spec:** `docs/superpowers/specs/2026-11-17-langgraph-course-design.md` (Level 3 section)

**Verified live against installed LangGraph 1.7.5 (spike):** `StateGraph({state,input,output,context})`, `Command({update,goto})` with `{ends}`, `Send`, `runtime.context`, node `retryPolicy`, `cachePolicy` + `InMemoryCache` (from `@langchain/langgraph-checkpoint`, added as a dependency), `{defer:true}`, `InMemoryStore` (`put/get/search`), `getStateHistory` + replay/fork, `entrypoint`/`task`, `getGraphAsync().drawMermaid()`.

## Order (verify and commit each part)
- **Part 7 Graph API in depth (3-01..3-09).**
- **Part 8 Long-term memory and replay (3-10..3-14).**
- **Part 9 Workflow patterns (3-15..3-19).**
- **Part 10 Subgraphs and multi-agent (3-20..3-25), 10b durable execution (3-26).**
- **Part 10c createAgent middleware (3-27..3-30).**
- **Part 11 Extras and capstone (3-31..3-35).**

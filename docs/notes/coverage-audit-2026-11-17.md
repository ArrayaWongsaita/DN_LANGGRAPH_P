# Coverage audit: course vs official docs (2026-11-17)

Source: the TypeScript docs index (`https://docs.langchain.com/_llms/agent-development-lifecycle/build/type-script.txt`), LangGraph and LangChain OSS sections. Each page is mapped to the lessons that teach it.

Method and limits: mapping is by lesson title and what I wrote in each lesson. I did not re-read every lesson body for this audit, so "partial" means "topic is touched, not all of the page". Pages not listed in the table below are covered by an adjacent row.

Legend: ✅ covered, 🟡 partial, ❌ not covered, ➖ out of scope (external service, UI, or product).

## LangGraph

| Docs page | Status | Lessons / note |
|---|---|---|
| Overview, Quickstart | ✅ | 1-09..1-19 |
| Thinking in the Graph API, Graph API overview, state, control flow, nodes | ✅ | 1-09..1-17, 3-01..3-09 |
| Send and Command | ✅ | 3-02, 3-03, 3-04 |
| Persistence | ✅ | 2-02..2-04, 3-13 |
| Time travel | ✅ | 3-14 |
| Fault tolerance | ✅ | 3-06, 3-26, 4-01..4-03 (verify the `durability` modes `exit/async/sync` are named in 3-26) |
| Checkpointers | 🟡 | Memory, SQLite (2-07), Postgres (4-24). Missing: Mongo, Redis, serializer, encryption |
| Stores (long-term memory) | 🟡 | 3-10..3-12. Semantic search over a store not covered |
| Memory (short-term) | ✅ | 2-05, 2-06, 3-28, 4-15 |
| Interrupts | ✅ | 2-18..2-21, 3-29, 4-04, 4-05 |
| Streaming | ✅ | 1-18, 2-22..2-24, 4-23 |
| Event streaming (v3 `streamEvents`) | ❌ | Not studied |
| Subgraphs | ✅ | 3-20..3-22 |
| Workflows and agents | ✅ | 3-15..3-19 |
| Functional API | 🟡 | One lesson (3-31); no entrypoint/task depth |
| Visualize your graph | ✅ | 3-32 |
| Application structure | ✅ | 4-25 |
| Run a local server (`langgraph dev`) | ❌ | Described in 4-25, no hands-on lesson |
| Test | ✅ | 4-06..4-08 |
| LangSmith Observability | 🟡 | 3-33 (tracing config); LangSmith itself is external |
| Agentic RAG (custom) | ✅ | 4-16..4-21 (fake embeddings; see RAG gap below) |
| Custom SQL agent | ❌ | No SQL agent lesson |
| LangGraph runtime (Pregel) | ❌ | Internals, optional |
| Backward compatibility | ❌ | Minor reference page |
| Frontend (stream hooks, custom stream channels) | ❌ | Whole React/UI section |
| Deployment, Studio, Agent Chat UI | ➖ | Product/UI; 4-25 mentions them |

## LangChain (agents layer)

| Docs page | Status | Lessons / note |
|---|---|---|
| Agents (`createAgent`) | ✅ | 2-16, 2-17 |
| Models | ✅ | 1-03, 2-15, 2-26, 2-27 |
| Messages | ✅ | 0-03, 1-04, 2-01 |
| Tools | ✅ | 2-08..2-13, 4-23 |
| Short-term memory | ✅ | 2-01..2-07 |
| Streaming | ✅ | see LangGraph |
| Structured output | ✅ | 1-08, 2-14 |
| Middleware overview, custom | ✅ | 3-28..3-30, 4-12..4-15 |
| Prebuilt middleware | 🟡 | Covered: summarization, HITL, retry/fallback, call limits, PII, context editing. Not covered: tool selector, to-do list, tool emulator, shell/file tools |
| Guardrails | ✅ | 4-12..4-14 |
| Runtime | ✅ | 3-05 |
| Context engineering | 🟡 | 4-15 only; dynamic prompts and model selection partly in 2-15 |
| Human-in-the-loop | ✅ | 2-18..2-21, 3-29 |
| Long-term memory | ✅ | 3-10..3-12 |
| MCP (tools) | ✅ | 4-22 (stdio, local) |
| MCP connections (HTTP), authentication | ❌ | |
| Multi-agent: subagents, handoffs, skills, router, custom workflow | ✅ | 4-09, 3-23, 4-10, 4-11, 3-15..3-19 |
| Test: unit | ✅ | 4-06, 4-07 |
| Test: integration | ❌ | Needs real model calls; only manual live runs so far |
| Agent evals | 🟡 | 4-08 (basic scorer and LLM judge) |
| Semantic search / knowledge base | 🟡 | 4-16..4-18 teach the idea with fake embeddings; no real embedding model or external vector store |
| SQL agent, voice agent, deep agent, data analysis agent | ❌ | Tutorials, not core concepts |
| Frontend, generative UI, integrations | ➖ | UI layer |
| Deployment, Studio, Agent Chat UI, LangSmith | ➖ | Product |

## Gaps worth a Level 5 (ordered by value to a learner)

1. Real embeddings and a real vector store (pgvector on the learner's local Postgres fits the existing 4-24 setup), plus hybrid search or reranking.
2. `streamEvents` v3 and the event-streaming model.
3. Run and call a server: `langgraph dev`, the JS SDK / `RemoteGraph`, thread and run APIs.
4. Checkpointer depth: other backends, serializer, encryption, pruning old checkpoints.
5. Functional API depth (entrypoint, task, `getPreviousState`, streaming) and the remaining prebuilt middleware.
6. A SQL agent tutorial (safe query execution fits the 4-14 permission ideas).
7. MCP over HTTP with authentication.
8. Frontend streaming (only if learners build UIs).

Not planned: Studio and deployment hands-on (need a LangSmith account and send trace data out, see 3-33), deep agents, voice.

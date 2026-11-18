# Level 5 design: real retrieval, streaming events, serving, depth 

Status: approved by the user on 2026-11-17 (decisions below). Nothing is built yet. Lesson ids `5-NN` under `lessons/level-5-*`. Same format as earlier levels (Thai README, starter with `todo(N)` gaps, checker with fakes, `solution/`, optional `run.ts`). Lesson text never names an LLM provider. Checkers never need a database, Docker, network or a key; real services appear only in `run.ts`.

Source for scope: `docs/notes/coverage-audit-2026-11-17.md`.

## Findings that shape the design (checked 2026-11-17)

- The opencode endpoint has no `/embeddings` (HTTP 404) and Groq offers no embeddings.
- **Embeddings come from Google AI Studio (free tier), approved by the user.** `GOOGLE_API_KEY` is already in `.env`. The key lists `gemini-embedding-001` and `gemini-embedding-2` with `embedContent`. Probe on Thai text with `outputDimensionality=768`: query "ลืมพาสเวิร์ดทำยังไง" scored 0.765 against "ลืมรหัสผ่านให้รีเซ็ตที่พอร์ทัล IT" and 0.61 / 0.58 against unrelated documents, so it matches by meaning, not by shared words. Plan: `gemini-embedding-001`, 768 dimensions, so tables use `vector(768)`. Package candidate: `@langchain/google-genai` (2.3.6); confirm in the Part 18 spike. Free-tier rate limits mean ingestion must batch and back off; lesson text calls it "the embedding provider set in `.env`" and never names the vendor, like `getLLM()`.
- `PostgresStore` (`@langchain/langgraph-checkpoint-postgres/store`, installed) supports vector similarity search.
- `docker-compose.yml` already runs Postgres 17 + pgvector 0.8.7 on `127.0.0.1:5434`. No extra service is needed for embeddings.
- **`langgraph dev` works without a LangSmith key** (spike in a scratch project: CLI `@langchain/langgraph-cli`, command `langgraphjs dev --no-browser`; `GET /ok` returned `{"ok":true}` and `POST /runs/wait` ran the graph). The docs list a LangSmith key as a prerequisite, but only the optional Studio UI (hosted at smith.langchain.com) needs an account. It logs a warning about `@langchain/langgraph-checkpoint` version resolution in a fresh project; check this in the real project during Part 20. So Part 20 stays.

## Decisions (approved 2026-11-17)

1. Embeddings: Google AI Studio free tier via `getEmbeddings()` in `src/`, configured from `.env`. Checkers keep using `KeywordEmbeddings`; real calls only in `run.ts`.
2. Serving part included (`langgraph dev` needs no account).
3. Scope: as complete as possible: 23 lessons (the 18 below plus 5 coverage lessons).

## Lessons

**Part 18: Real retrieval (pgvector)**
- 5-01 `getEmbeddings()` and the embedding contract (dimension, same model for index and query); checker with a fake `Embeddings`; `run.ts` against the Docker Ollama.
- 5-02 pgvector with plain SQL: create table with `vector(N)`, insert, nearest-neighbour search with `<=>`; checker builds and verifies the SQL text and parameter order with a fake client.
- 5-03 `PostgresStore` semantic search: long-term memory found by meaning (continues 3-10..3-12); checker uses the in-memory store with a fake embedding.
- 5-04 Hybrid search: keyword + vector results merged with reciprocal rank fusion (pure function, fully checkable).
- 5-05 Reranking: second-pass scoring of the top-k with a model, with a cutoff; fake model in the checker.
- 5-06 Idempotent ingestion: chunk → hash → upsert, metadata filter, re-running does not duplicate; checker with a fake store.

**Part 19: Event streaming**
- 5-07 `streamEvents` v3 event model (needs a spike to learn the real shapes).
- 5-08 Turn events into progress for a UI: which node started, which tool ran, token text.
- 5-09 Serve a stream over HTTP with Express (server-sent events): learners fill the pure part (format events as SSE text, write to a sink, stop when the client disconnects); the Express route wiring is given and used by `run.ts` with `curl`. Checker feeds recorded events and a fake sink, no port opened. Confirm the Express version and SSE details in the spike.

**Part 20: Serving**
- 5-10 `langgraph dev` and `langgraph.json` hands-on: run the local server and call its API (no LangSmith account needed; Studio is optional and only described).
- 5-11 Call a server with the JS SDK: threads, runs, streaming.
- 5-12 `RemoteGraph` as a subgraph of a local graph.

**Part 21: Depth**
- 5-13 Checkpoint housekeeping on Postgres: keep the last N checkpoints per thread, delete old threads.
- 5-14 Serializer and encryption of checkpoints.
- 5-15 Functional API in depth: `entrypoint`, `task`, previous state, streaming.

**Part 22: SQL agent**
- 5-16 A safe SQL tool: read-only, single statement, allowlisted tables, row cap, timeout; applies 4-14 ideas. Checker is pure string/AST-light validation.
- 5-17 SQL agent graph: inspect schema → write query → validate → run → answer, on a small demo schema in the Docker database.

**Part 23: Remaining coverage (from the audit)**
- 5-18 MCP over HTTP: connections and authentication (spike with a local HTTP MCP server).
- 5-19 More prebuilt middleware: tool selector, to-do list, tool emulator (shell/file tools described, not run).
- 5-20 Context engineering beyond clearing tools: dynamic system prompts and per-turn model choice from runtime context.
- 5-21 Integration testing: opt-in live tests that skip without a key, plus how they differ from fake-model tests.
- 5-22 The Pregel runtime: supersteps, channels and why node names must not equal state keys (explains the gotchas seen so far).

**Capstone**
- 5-23 Knowledge assistant: ingestion, hybrid search with rerank, citations (4-21), guardrails (4-13), Postgres checkpointer, served over HTTP.

## Constraints and risks

- Free-tier embedding limits (requests per minute, daily quota): batch calls, back off on 429, cache embeddings, keep every checker offline. Learners need their own Google AI Studio key for `run.ts` only.
- Nothing may touch Postgres instances other than the course container.
- Each part needs API spikes against the installed versions before lessons are written (as in Level 4). Known unknowns: `streamEvents` v3 shapes, `PostgresStore` index config, serializer/encryption API, HTTP MCP auth flow, `@langchain/google-genai` embeddings API.
- Every new `run.ts` is tested against the real service before commit; every lesson gets the standard checks (`check:solutions`, `check:starters`, `lint:lessons:strict`, `typecheck`), then a mutant review as done for Level 4.

## Order of work

Parts 18 → 19 → 21 → 22 → 20 → 23 → capstone. One commit per part. Part 20 stays late because it adds the CLI dependency and a server process.

## Amendment (2026-11-18): lesson numbers follow build order

The lint rule requires contiguous numbering, so ids are assigned in build order, not by the original part numbers. Final map: 5-01..5-06 retrieval (done), 5-07..5-09 event streaming (done), 5-10..5-12 depth (checkpoint housekeeping, serializer/encryption, Functional API depth), 5-13..5-14 SQL agent (safe SQL tool, SQL agent), 5-15..5-17 serving (`langgraph dev`, JS SDK, RemoteGraph), 5-18..5-22 remaining coverage (MCP over HTTP, prebuilt middleware, context engineering, integration testing, Pregel runtime), 5-23 capstone. Content is unchanged; only ids moved.

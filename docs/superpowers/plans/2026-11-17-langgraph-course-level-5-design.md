# Level 5 design: real retrieval, streaming events, serving, depth (draft for approval)

Status: draft. Nothing is built. Lesson ids `5-NN` under `lessons/level-5-*`. Same format as earlier levels (Thai README, starter with `todo(N)` gaps, checker with fakes, `solution/`, optional `run.ts`). Lesson text never names an LLM provider. Checkers never need a database, Docker, network or a key; real services appear only in `run.ts`.

Source for scope: `docs/notes/coverage-audit-2026-11-17.md`.

## Findings that shape the design (checked 2026-11-17)

- The opencode endpoint has no `/embeddings` (HTTP 404) and Groq offers no embeddings, so real embeddings need another source. Ollama has `OllamaEmbeddings` (`@langchain/ollama`, already installed).
- `PostgresStore` (`@langchain/langgraph-checkpoint-postgres/store`, already installed) supports vector similarity search, so semantic long-term memory needs no extra package.
- `docker-compose.yml` already runs Postgres 17 + pgvector 0.8.7 on `127.0.0.1:5434`. Learners have Docker.
- `@langchain/community` (1.1.29) exists but is not needed; we use plain SQL for pgvector so learners see what happens.

## Decisions to approve

1. **Embeddings source:** add an `ollama` service to `docker-compose.yml` that serves one multilingual embedding model (candidate `bge-m3`; confirm Thai quality and size in a spike, fall back to a smaller model). `getEmbeddings()` lives in `src/` next to `getLLM()` and is configured from `.env` (`EMBEDDING_MODEL`, `OLLAMA_EMBED_URL`). Checkers keep using `KeywordEmbeddings`. *Recommended.* Alternative: skip real embeddings (course stays fake-only), which leaves the biggest RAG gap open.
2. **Serving part (`langgraph dev`, SDK, `RemoteGraph`):** spike first. Include only if the local dev server runs without a LangSmith account and without sending trace data out. If not, replace it with a read-only explanation plus a hand-written HTTP/SSE server around the compiled graph. *Recommended.*
3. **Size:** 18 lessons in 6 parts, about the size of Level 3's later half. Part 22 (SQL agent) and Part 20 are the first to cut if we want it smaller.

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
- 5-09 Serve a stream over HTTP (server-sent events) with plain `node:http`; checker feeds recorded events.

**Part 20: Serving**
- 5-10 `langgraph dev` and `langgraph.json` hands-on (only if the spike allows; see decision 2).
- 5-11 Call a server with the JS SDK: threads, runs, streaming.
- 5-12 `RemoteGraph` as a subgraph of a local graph.

**Part 21: Depth**
- 5-13 Checkpoint housekeeping on Postgres: keep the last N checkpoints per thread, delete old threads.
- 5-14 Serializer and encryption of checkpoints.
- 5-15 Functional API in depth: `entrypoint`, `task`, previous state, streaming.

**Part 22: SQL agent**
- 5-16 A safe SQL tool: read-only, single statement, allowlisted tables, row cap, timeout; applies 4-14 ideas. Checker is pure string/AST-light validation.
- 5-17 SQL agent graph: inspect schema → write query → validate → run → answer, on a small demo schema in the Docker database.

**Capstone**
- 5-18 Knowledge assistant: ingestion, hybrid search with rerank, citations (4-21), guardrails (4-13), Postgres checkpointer, served over HTTP.

## Constraints and risks

- Docker image size and first-run model download (about 1 GB for `bge-m3`): document it, make the download a separate step, keep every checker offline.
- Nothing may touch Postgres instances other than the course container.
- Each part needs API spikes against the installed versions before lessons are written (as in Level 4). Known unknowns: `streamEvents` v3 shapes, `PostgresStore` index config, serializer/encryption API, whether `langgraph dev` needs an account.
- Every new `run.ts` is tested against the real service before commit; every lesson gets the standard checks (`check:solutions`, `check:starters`, `lint:lessons:strict`, `typecheck`), then a mutant review as done for Level 4.

## Order of work

Parts 18 → 19 → 21 → 22 → 20 (serving last because of the account question) → capstone. One commit per part.

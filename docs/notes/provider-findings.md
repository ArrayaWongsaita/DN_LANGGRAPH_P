# Provider findings (Ollama Cloud)

Status: **PROVISIONAL — not yet verified against the real API** (needs the author's `OLLAMA_API_KEY`).

## Verified without the network
- `@langchain/ollama` 1.3.0 `ChatOllama` typings accept `headers?: Headers | Record<string,string>` and `baseUrl`. `src/llm.ts` uses `headers: { Authorization: "Bearer <key>" }`.
- `getLLM()` unit tests (missing/blank key, `/api` suffix, trailing slash, temperature) pass offline.

## To verify with a real key (run: `OLLAMA_API_KEY=... npx tsx scripts/check-llm.ts`)
- [ ] The `headers` route authenticates (no 401) against `https://ollama.com`.
- [ ] Default model `gpt-oss:120b` exists on the author's plan; tool-calling works for it (one tool-call round trip).
- [ ] Native structured output: Ollama docs say cloud models do not support it. Lesson 13 therefore defaults to "ask for JSON in the prompt + parse with zod"; revisit if tool-calling based `withStructuredOutput` works.
- [ ] Rate limit / quota behaviour (not documented on the cloud page).

## Ruling (provisional)
Until verified, lessons are written and tested against `fakeLLM`; real-LLM `run.ts` files are written but unexecuted.
- fake-model testing confirmed working with @langchain/core 1.4.1 (FakeListChatModel cycles, streams multi-chunk, usable inside a StateGraph node).

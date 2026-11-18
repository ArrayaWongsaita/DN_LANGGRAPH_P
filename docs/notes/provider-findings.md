# Provider findings (Groq)

Verified live on 2026-11-17 with the author's own `GROQ_API_KEY` via `npm run check:llm` (`@langchain/groq` 1.3.1).

| Model | basic | streaming | tools | structured |
|---|---|---|---|---|
| `openai/gpt-oss-120b` | ✓ | ✓ (123 chunks) | ✓ (`add({"a":2,"b":3})`) | ✓ (`.withStructuredOutput(zod)` returned `{name, age}`) |
| `openai/gpt-oss-20b` | ✓ | ✓ (110 chunks) | ✓ (`add({"a":2,"b":3})`) | ✓ (`{name, age}`; kept the honorific "คุณสมชาย" where 120b dropped it) |
| `llama-3.3-70b-versatile` | ✗ 404 `model_not_found` | ✗ | ✗ | ✗ |

`llama-3.3-70b-versatile` is not available to this account ("does not exist or you do not have access"), so it could not be evaluated.

## Decision
Default model: `openai/gpt-oss-20b` (changed from 120b at the author's request on 2026-11-17; it passes all four checks, verified with one `pnpm check:llm` run, and is faster and lighter on quota). `openai/gpt-oss-120b` also passes all four checks and remains a fallback (`LLM_MODEL=openai/gpt-oss-120b`). Neither was run against every lesson's `run.ts` yet, and `docs/notes/fetch-findings.md` response shapes were recorded with 120b.

## Error shapes (real)
- Wrong key: `AuthenticationError`, own keys `status, headers, error`; `status === 401`; message `401 {"error":{"message":"Invalid API Key",...,"code":"invalid_api_key"}}`.
- Unknown model: `NotFoundError`, `status === 404`, message names the model.
- Both are already read correctly by `src/errorInfo.ts` (`errorStatus`), pinned in `src/errorInfo.test.ts`.
- 429 was **not** provoked (would need deliberate rate-limit abuse). Per Groq docs a 429 carries a `retry-after` header (seconds). Developer-plan limits for gpt-oss-120b: 30 RPM, 1K requests/day, 8K tokens/min, 200K tokens/day; the author's free-tier limits are unknown and should be read from the Groq console.

## Fake model
`fakeLLM` (`FakeListChatModel`) supports `.withStructuredOutput(zod)` (the scripted reply is parsed as the structured result) and `bindTools` (returns an AIMessage with empty `tool_calls`; scripted tool calls need an extension, deferred to the Level 2 plan).

## Live lesson run (2026-11-17, default model `openai/gpt-oss-20b`)
Every `run.ts` was run against the lesson's `solution/` with the real provider: Level 0 (0-01..0-06) and Level 1 (02-08, 11-19 where a run.ts exists). All exited 0 except the two interactive REPLs (0-06 and 1-19), which only handled the first line because stdin was piped (`readline was closed` at EOF); their question paths were exercised separately by calling `runAssistant` / `buildAssistantGraph` directly, and the greeting path went through both. Interactive terminal use of those two REPLs was not tested.
Findings that changed lessons:
- 1-15 loop: the first prompt had no text to improve, so the model asked for content and looped to the maximum. The node now improves a seed text ("แมวกินปลา") and the model answers `OK` after 2 rounds.
- 0-06 / 1-15: with "ถ้าดีแล้วตอบ OK" the model sometimes returned the improved text followed by `OK`, so the stop condition failed and `OK` leaked into the answer. Prompts now say to answer only the improved text, or `OK` alone. After the change, two live runs of 0-06 did not leak `OK`. 0-06's README records this as a lesson about unreliable LLM output.
- Reasoning chunks (`delta.reasoning`) were skipped correctly by the 0-05 SSE reader; partial-line buffering worked.

## Google Gemini (checked 2026-11-18, `@langchain/google-genai` 2.3.6)
`LLM_PROVIDER=google` uses `ChatGoogleGenerativeAI` with `GOOGLE_API_KEY` (the same key as embeddings). Default model `gemini-flash-lite-latest` (resolves to `gemini-3.5-flash-lite`). `pnpm check:llm` passed all four checks (basic, streaming, tool calling, structured output); `usage_metadata` is present and `.text` works. Level 0 raw `fetch` also works against `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` with `Authorization: Bearer <key>`.
- **Free-tier limits** (from 429 responses): `gemini-2.5-flash` allows 5 requests per minute; `gemini-flash-lite-latest` allows 15. Run lessons one at a time. `gemini-2.5-flash-lite` returned 404 for this key and `gemini-3.1-flash-lite` returned 503 after 10 calls (preview), so they are not used.
- **temperature**: set at construction. Per-call `llm.withConfig({ temperature })` only works for `ChatGroq`; `ChatOpenAI` and `ChatOllama` silently ignore it, and `llm.bind` does not exist on these models. With `temperature: 0`, Gemini and the OpenCode model still returned different answers across calls, so a checker must not assert identical output.
## DeepSeek API (checked live 2026-11-18)
`LLM_PROVIDER=deepseek` uses `ChatOpenAI` with `baseURL: https://api.deepseek.com`, `DEEPSEEK_API_KEY` and `modelKwargs: { thinking: { type: "disabled" } }` (no extra package). Default model `deepseek-flash` from the official docs page (`deepseek-v4-pro` is the other current model; `deepseek-v4-flash` is a retired name still accepted).
- `pnpm check:llm`: basic, streaming (91 chunks) and tool calling pass; **structured output fails** with the default `withStructuredOutput(schema)` (`400 This response_format type is unavailable now`, the endpoint rejects `json_schema`).
- With thinking left on (the default), tool calls that force `tool_choice` fail with `400 Thinking mode does not support this tool_choice`, which is why thinking is disabled.
- `withStructuredOutput(schema, { method: "functionCalling" })` works on all four providers (checked 2026-11-18) once thinking is disabled; `method: "jsonMode"` does not follow the schema. Level 1 lessons 09 and 20 pass `{ method: "functionCalling" }`, and the whole of Level 1 (02, 03, 05-20) was run against DeepSeek and passed. `pnpm check:llm` still reports the default structured method as failing for DeepSeek.
- `temperature` is accepted, but at 0 answers still differed across calls.
- Ollama was dropped from the project (2026-11-18); its provider code, key variables and dependency were removed.

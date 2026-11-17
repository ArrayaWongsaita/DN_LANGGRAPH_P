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

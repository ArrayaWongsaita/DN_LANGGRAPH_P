# Raw fetch findings (chat completions endpoint)

Verified live on 2026-11-17 with the author's own key, model `openai/gpt-oss-120b` (the default at the time; the default is now `openai/gpt-oss-20b`, same API shape expected but not re-recorded), endpoint `https://api.groq.com/openai/v1/chat/completions` (the `chatUrl` of the groq provider). 9 requests total.

## Request that works
- `POST <chatUrl>`
- Headers: `Authorization: Bearer <key>`, `Content-Type: application/json`
- Body: `{ "model": "...", "messages": [{ "role": "user", "content": "..." }] }` (add `"stream": true` for SSE)

## Response (non-streaming, HTTP 200, `application/json`)
- Top-level keys: `id, object, created, model, choices, usage, usage_breakdown, system_fingerprint, x_groq, service_tier`.
- The text is at `choices[0].message.content`. The message also has `role` and, for this reasoning model, a `reasoning` string (the model's thinking). `content` is a plain string here. Lessons read only `choices[0].message.content` and say "บางโมเดลมี field reasoning แยกอยู่ด้วย".
- `usage` has `prompt_tokens`, `completion_tokens`, `total_tokens` (and `completion_tokens_details.reasoning_tokens`); useful as a call-out about cost.
- Rate-limit response headers are present on success: `x-ratelimit-limit-requests` (1000), `x-ratelimit-limit-tokens` (8000), `x-ratelimit-remaining-requests`, `x-ratelimit-remaining-tokens`, `x-ratelimit-reset-requests`, `x-ratelimit-reset-tokens`. A 429 was not provoked; per docs it carries `retry-after`.

## Errors (same JSON shape for all)
`{ "error": { "message": "...", "type": "invalid_request_error", "code": "..." } }`
- Bad key: HTTP 401, `code: "invalid_api_key"`, message `Invalid API Key`.
- Unknown model: HTTP 404, `code: "model_not_found"`, message names the model.
Lesson 0-02 reads `res.status` and `body.error.message`.

## Streaming (SSE, HTTP 200, `text/event-stream`)
- Each event is a line `data: {json}` followed by a blank line; the stream ends with `data: [DONE]`.
- Text delta is at `choices[0].delta.content`. For this model, early chunks carry `delta.reasoning` (thinking) instead of `content`, and the first chunk has `delta.role` with empty `content`; the last JSON chunk has an empty `delta` and a `finish_reason`.
- **Network reads do not align with lines**: in one 16-read stream, 9 reads did not end at a newline, i.e. an event can be cut in the middle. A correct reader must buffer partial lines. This is the real pain point lesson 0-05 teaches.

## JSON-only prompts
Asked 3 times for JSON only (`{"name": string, "age": number}`); all 3 replies were bare JSON, no code fence. The fence problem is real for other models but not reproducible on demand here, so lesson 0-04 reproduces it deterministically with a scripted `fakeFetch` reply and says so in the README. Replies also vary (`สมชาย` vs `คุณสมชาย`), a free example of why validation matters.

## Decisions for the lessons
- 0-01 field path: `choices[0].message.content`.
- 0-02 error body: `body.error.message`; teach 401 and 404 from real findings, 429 from docs (and the `x-ratelimit-*` headers).
- 0-05 (streaming) stays optional; it is hard because of partial-line buffering, but doable in ~20 lines.

## Pilot 0-01 live run (2026-11-17)
`callLLM` (solution) with real `fetch`, the groq `chatUrl` and the default model returned a Thai one-sentence greeting; request body and response path match the findings above.

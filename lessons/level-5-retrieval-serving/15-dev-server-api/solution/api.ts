export type FetchFn = typeof fetch;

export interface SseEvent {
  event: string;
  data: string;
  id?: string;
}

export const endpoint = (base: string, path: string) => `${base.replace(/\/+$/, "")}${path}`;

const JSON_HEADERS = { "content-type": "application/json" };

export async function ensureOk(res: Response): Promise<Response> {
  if (res.ok) return res;
  throw new Error(`เซิร์ฟเวอร์ตอบ ${res.status}: ${await res.text()}`);
}

export async function createThread(base: string, fetchFn: FetchFn = fetch): Promise<string> {
  const res = await ensureOk(await fetchFn(endpoint(base, "/threads"), { method: "POST", headers: JSON_HEADERS, body: "{}" }));
  return (await res.json()).thread_id;
}

export async function runWait(
  base: string,
  threadId: string,
  assistantId: string,
  input: unknown,
  fetchFn: FetchFn = fetch,
): Promise<unknown> {
  const res = await ensureOk(
    await fetchFn(endpoint(base, `/threads/${threadId}/runs/wait`), {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ assistant_id: assistantId, input }),
    }),
  );
  return res.json();
}

export async function getState(base: string, threadId: string, fetchFn: FetchFn = fetch): Promise<{ values: unknown; next: string[] }> {
  const res = await ensureOk(await fetchFn(endpoint(base, `/threads/${threadId}/state`)));
  return res.json();
}

function parseBlock(block: string): SseEvent | null {
  let event: string | undefined;
  let id: string | undefined;
  const data: string[] = [];
  for (const line of block.split("\n")) {
    if (line === "" || line.startsWith(":")) continue;
    const colon = line.indexOf(":");
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? "" : line.slice(colon + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    if (field === "event") event = value;
    else if (field === "data") data.push(value);
    else if (field === "id") id = value;
  }
  if (event === undefined && data.length === 0) return null;
  return { event: event ?? "message", data: data.join("\n"), ...(id !== undefined ? { id } : {}) };
}

export async function* parseSse(chunks: AsyncIterable<string>): AsyncGenerator<SseEvent> {
  let buffer = "";
  for await (const chunk of chunks) {
    buffer = (buffer + chunk).replace(/\r\n/g, "\n");
    let cut: number;
    while ((cut = buffer.indexOf("\n\n")) !== -1) {
      const parsed = parseBlock(buffer.slice(0, cut));
      buffer = buffer.slice(cut + 2);
      if (parsed) yield parsed;
    }
  }
  if (buffer.trim() !== "") {
    const parsed = parseBlock(buffer);
    if (parsed) yield parsed;
  }
}

export async function* streamRun(
  base: string,
  threadId: string,
  assistantId: string,
  input: unknown,
  streamMode: string[],
  fetchFn: FetchFn = fetch,
): AsyncGenerator<{ event: string; data: unknown }> {
  const res = await ensureOk(
    await fetchFn(endpoint(base, `/threads/${threadId}/runs/stream`), {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ assistant_id: assistantId, input, stream_mode: streamMode }),
    }),
  );
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  async function* texts() {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
    const rest = decoder.decode();
    if (rest) yield rest;
  }
  for await (const ev of parseSse(texts())) {
    const data = ev.data === "" ? null : JSON.parse(ev.data);
    if (ev.event === "end") return;
    if (ev.event === "error") throw new Error(data?.message ?? data?.error ?? "สตรีมล้มเหลว");
    yield { event: ev.event, data };
  }
}

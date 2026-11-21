import { fileURLToPath } from "node:url";
import { todo } from "@src/todo";
import { startDevServer } from "@src/devServer";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-15  (เปิดเซิร์ฟเวอร์ langgraph dev ชั่วคราวในสคริปต์เอง ครั้งแรกใช้เวลาสักครู่ ไม่ต้องมีบัญชี LangSmith ไม่ใช้ LLM)
// langgraph dev เปิด graph ของเราเป็น HTTP API (threads, runs, state, stream) บทนี้เรียก API นั้นด้วย fetch ล้วน ๆ เพื่อให้เห็นว่า SDK ทำอะไรให้เบื้องหลัง: สร้าง thread, รันแล้วรอผล, อ่าน state, และอ่านสตรีม SSE ที่ถูกตัดก้อนตรงไหนก็ได้
type FetchFn = typeof fetch;

interface SseEvent {
  event: string;
  data: string;
  id?: string;
}

// (ให้ไว้แล้ว) ต่อ base กับพาธโดยไม่ซ้อน /
const endpoint = (base: string, path: string) => `${base.replace(/\/+$/, "")}${path}`;

const JSON_HEADERS = { "content-type": "application/json" };

async function ensureOk(res: Response): Promise<Response> {
  if (res.ok) return res;
  throw new Error(`เซิร์ฟเวอร์ตอบ ${res.status}: ${await res.text()}`);
}

async function createThread(base: string, fetchFn: FetchFn = fetch): Promise<string> {
  const res = await ensureOk(await fetchFn(endpoint(base, "/threads"), { method: "POST", headers: JSON_HEADERS, body: "{}" }));
  return (await res.json()).thread_id;
}

async function runWait(base: string, threadId: string, assistantId: string, input: unknown, fetchFn: FetchFn = fetch): Promise<unknown> {
  // 👉 ข้อ 1 POST endpoint(base, `/threads/${threadId}/runs/wait`) body JSON { assistant_id: assistantId, input } ผ่าน ensureOk แล้วคืน res.json()
  // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
  //   const res = await ensureOk(
  //     await fetchFn(endpoint(base, `/threads/${threadId}/runs/wait`), { method: "POST", headers: JSON_HEADERS, body: JSON.stringify({ assistant_id: assistantId, input }) }),
  //   );
  //   return res.json();
  return todo(1);
}

// (ให้ไว้แล้ว)
async function getState(base: string, threadId: string, fetchFn: FetchFn = fetch): Promise<{ values: unknown; next: string[] }> {
  const res = await ensureOk(await fetchFn(endpoint(base, `/threads/${threadId}/state`)));
  return res.json();
}

// อ่านข้อความ SSE จากก้อนข้อความที่ตัดตรงไหนก็ได้ แล้วคืนเหตุการณ์ทีละอัน
async function* parseSse(chunks: AsyncIterable<string>): AsyncGenerator<SseEvent> {
  const parseBlock = (block: string): SseEvent | null => {
    let event = "";
    let id: string | undefined;
    const data: string[] = [];
    for (const line of block.split("\n")) {
      if (line === "" || line.startsWith(":")) continue;
      const colon = line.indexOf(":");
      const field = colon === -1 ? line : line.slice(0, colon);
      const value = colon === -1 ? "" : line.slice(colon + 1).replace(/^ /, "");
      if (field === "event") event = value;
      else if (field === "data") data.push(value);
      else if (field === "id") id = value;
    }
    if (event === "" && data.length === 0) return null;
    const out: SseEvent = { event: event || "message", data: data.join("\n") };
    if (id !== undefined) out.id = id;
    return out;
  };
  let buffer = "";
  for await (const chunk of chunks) {
    buffer = (buffer + chunk).replace(/\r\n/g, "\n");
    let cut = buffer.indexOf("\n\n");
    while (cut !== -1) {
      const parsed = parseBlock(buffer.slice(0, cut));
      buffer = buffer.slice(cut + 2);
      if (parsed) yield parsed;
      cut = buffer.indexOf("\n\n");
    }
  }
  if (buffer.trim() !== "") {
    const parsed = parseBlock(buffer);
    if (parsed) yield parsed;
  }
}

async function* streamRun(
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
  async function* texts(): AsyncGenerator<string> {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        const rest = decoder.decode();
        if (rest) yield rest;
        return;
      }
      yield decoder.decode(value, { stream: true });
    }
  }
  for await (const ev of parseSse(texts())) {
    const data = ev.data === "" ? null : JSON.parse(ev.data);
    if (ev.event === "end") return;
    if (ev.event === "error") throw new Error(data?.message ?? data?.error ?? "สตรีมล้มเหลว");
    yield { event: ev.event, data };
  }
}

// ส่วนที่ 1: ของจริง เปิด langgraph dev แล้วเรียกด้วยฟังก์ชันของคุณ (graph "demo" นับรอบ turns ค้างใน thread)
const PORT = 2955;
const BASE = `http://localhost:${PORT}`;
const config = fileURLToPath(new URL("./server/langgraph.json", import.meta.url));
console.log("กำลังเปิดเซิร์ฟเวอร์ (ครั้งแรกอาจใช้เวลาสักครู่)...");
const stop = await startDevServer(config, PORT);
let thread = "";
let first: { answer?: string; turns?: number } = {};
let second: { answer?: string; turns?: number } = {};
let state: { values: { turns?: number } } = { values: {} };
const streamed: { event: string; data: unknown }[] = [];
let badAssistant = "";
try {
  thread = await createThread(BASE);
  first = (await runWait(BASE, thread, "demo", { question: "สวัสดี" })) as typeof first;
  second = (await runWait(BASE, thread, "demo", { question: "อีกครั้ง" })) as typeof second;
  state = (await getState(BASE, thread)) as typeof state;
  for await (const ev of streamRun(BASE, thread, "demo", { question: "สตรีม" }, ["updates", "values"])) streamed.push(ev);
  try {
    await runWait(BASE, thread, "ไม่มีจริง", {});
  } catch (error) {
    badAssistant = (error as Error).message;
  }
} finally {
  stop();
}
console.log({ thread, first, second, values: state.values, streamed: streamed.length, badAssistant });

// ส่วนที่ 2: fetch ปลอมที่จดคำขอ (ไม่ใช้เครือข่าย) ตรวจรูปคำขอและการอ่าน SSE ที่ตัดก้อนแปลก ๆ
type Call = { url: string; method?: string; body?: unknown; headers?: Record<string, string> };
function fakeFetch(respond: (call: Call) => Response) {
  const calls: Call[] = [];
  const fn = (async (url: string, init?: RequestInit) => {
    const call: Call = { url, method: init?.method, headers: init?.headers as Record<string, string>, body: init?.body ? JSON.parse(String(init.body)) : undefined };
    calls.push(call);
    return respond(call);
  }) as unknown as FetchFn;
  return { fn, calls };
}
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
async function* chunksOf(...parts: string[]) {
  for (const p of parts) yield p;
}
async function all<T>(gen: AsyncIterable<T>): Promise<T[]> {
  const out: T[] = [];
  for await (const x of gen) out.push(x);
  return out;
}
const failMsg = async (p: Promise<unknown>): Promise<string> => {
  try {
    await p;
    return "";
  } catch (e) {
    return (e as Error).message;
  }
};
function streamResponse(text: string, splitAt: number[]) {
  const bytes = new TextEncoder().encode(text);
  const cuts = [0, ...splitAt, bytes.length];
  return new Response(
    new ReadableStream({
      start(controller) {
        for (let i = 0; i < cuts.length - 1; i++) controller.enqueue(bytes.slice(cuts[i], cuts[i + 1]));
        controller.close();
      },
    }),
  );
}
const SSE = 'event: metadata\ndata: {"run_id":"r1"}\n\nevent: values\ndata: {"answer":"ตอบ: สวัสดี"}\n\nevent: updates\ndata: {"respond":{"answer":"ก"}}\n\nevent: end\ndata: {"status":"success"}\n\nevent: values\ndata: {"หลังจบ":1}\n\n';

const goodRes = json({});
const okSame = (await ensureOk(goodRes)) === goodRes;
const notOk = await failMsg(ensureOk(new Response("No assistant found", { status: 404 })));
const ct = fakeFetch(() => json({ thread_id: "t-1" }));
const ctId = await createThread("http://x:2024/", ct.fn);
const rw = fakeFetch(() => json({ answer: "ตอบ: สวัสดี" }));
const rwOut = await runWait("http://x", "t-1", "demo", { question: "สวัสดี" }, rw.fn);
const rw404 = await failMsg(runWait("http://x", "t", "nope", {}, fakeFetch(() => new Response('No assistant found for "nope"', { status: 404 })).fn));
const gs = fakeFetch(() => json({ values: { a: 1 }, next: [] }));
const gsOut = await getState("http://x", "t", gs.fn);
const sse1 = await all(parseSse(chunksOf('event: values\ndata: {"a":1}\nid: 3\n\nevent: end\ndata: {}\n\n')));
const cutText = 'event: values\ndata: {"msg":"สวัสดี"}\n\nevent: updates\ndata: {"b":2}\n\n';
let cutOk = true;
for (const size of [1, 2, 3, 7, 13]) {
  const parts: string[] = [];
  for (let i = 0; i < cutText.length; i += size) parts.push(cutText.slice(i, i + size));
  const out = await all(parseSse(chunksOf(...parts)));
  cutOk = cutOk && out.map((e) => e.event).join() === "values,updates" && JSON.parse(out[0].data).msg === "สวัสดี";
}
const sseOdd = await all(parseSse(chunksOf(": heartbeat\r\n\r\ndata: บรรทัดหนึ่ง\r\ndata: บรรทัดสอง\r\n\r\n")));
const sseTail = await all(parseSse(chunksOf("event: a\ndata: 1\n\n\n\nevent: b\ndata: 2")));
const sr = fakeFetch(() => streamResponse(SSE, []));
const srOut = await all(streamRun("http://x", "t-1", "demo", { question: "q" }, ["values", "updates"], sr.fn));
const thaiAt = Buffer.from(SSE).indexOf(Buffer.from("สวัสดี")) + 1; // ตัดกลางตัว "ส"
const srThai = await all(streamRun("http://x", "t", "demo", {}, ["values"], fakeFetch(() => streamResponse(SSE, [thaiAt, thaiAt + 5])).fn));
const srErr = await failMsg(all(streamRun("http://x", "t", "demo", {}, ["values"], fakeFetch(() => streamResponse('event: values\ndata: {"a":1}\n\nevent: error\ndata: {"message":"โมเดลล่ม"}\n\n', [])).fn)));
const sr404 = await failMsg(all(streamRun("http://x", "t", "demo", {}, ["values"], fakeFetch(() => new Response("ไม่พบ thread", { status: 404 })).fn)));
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ensureOk: ผ่านเมื่อ ok และโยน error ที่มีสถานะ+ข้อความเมื่อไม่ ok", okSame && notOk === "เซิร์ฟเวอร์ตอบ 404: No assistant found");
check("createThread: POST /threads (base มี / ท้ายก็ไม่ซ้อน) คืน thread_id", ctId === "t-1" && ct.calls[0].url === "http://x:2024/threads" && ct.calls[0].method === "POST" && ct.calls[0].headers?.["content-type"] === "application/json");
check("runWait: ส่ง assistant_id + input ไปที่ /threads/{id}/runs/wait และคืนผล", same(rwOut, { answer: "ตอบ: สวัสดี" }) && rw.calls[0].url === "http://x/threads/t-1/runs/wait" && rw.calls[0].method === "POST" && same(rw.calls[0].body, { assistant_id: "demo", input: { question: "สวัสดี" } }));
check("runWait: เซิร์ฟเวอร์ตอบ 404 → error อ่านรู้เรื่อง", rw404 === 'เซิร์ฟเวอร์ตอบ 404: No assistant found for "nope"');
check("getState: อ่าน state (ให้ไว้แล้ว ใช้ ensureOk ของคุณ)", same(gsOut, { values: { a: 1 }, next: [] }) && gs.calls[0].url === "http://x/threads/t/state");
check("parseSse: event/data/id ปกติ", same(sse1, [{ event: "values", data: '{"a":1}', id: "3" }, { event: "end", data: "{}" }]));
check("parseSse: ก้อนถูกตัดกลางบรรทัด กลางคำ และกลางตัวคั่น ก็ได้ผลเหมือนเดิม", cutOk, "สะสม buffer แล้วตัดที่ \\n\\n");
check("parseSse: data หลายบรรทัด, \\r\\n, คอมเมนต์ และไม่มี event (= message)", same(sseOdd, [{ event: "message", data: "บรรทัดหนึ่ง\nบรรทัดสอง" }]));
check("parseSse: เหตุการณ์สุดท้ายที่ไม่มีบรรทัดว่างปิดท้ายยังถูกส่งออก และบล็อกว่างถูกข้าม", same(sseTail, [{ event: "a", data: "1" }, { event: "b", data: "2" }]));
check("streamRun: ส่ง stream_mode ถูก yield ทุกเหตุการณ์ (ยกเว้น end) และหยุดที่ end", sr.calls[0].url === "http://x/threads/t-1/runs/stream" && same(sr.calls[0].body, { assistant_id: "demo", input: { question: "q" }, stream_mode: ["values", "updates"] }) && same(srOut, [{ event: "metadata", data: { run_id: "r1" } }, { event: "values", data: { answer: "ตอบ: สวัสดี" } }, { event: "updates", data: { respond: { answer: "ก" } } }]));
check("streamRun: ไบต์ตัวอักษรไทยถูกตัดครึ่งระหว่างก้อน ต้องไม่เพี้ยน (TextDecoder แบบ stream)", same(srThai[1], { event: "values", data: { answer: "ตอบ: สวัสดี" } }), "decoder.decode(value, { stream: true })");
check("streamRun: เหตุการณ์ error ทำให้ throw ด้วยข้อความจากเซิร์ฟเวอร์", srErr.includes("โมเดลล่ม"));
check("streamRun: เซิร์ฟเวอร์ตอบ 404 ก่อนเริ่มสตรีม → error อ่านรู้เรื่อง", sr404 === "เซิร์ฟเวอร์ตอบ 404: ไม่พบ thread");
check("เซิร์ฟเวอร์จริง: รอบ 1 และ 2 ตอบถูก และ turns เพิ่มเพราะ state ค้างใน thread", first.answer === "ตอบ: สวัสดี" && first.turns === 1 && second.answer === "ตอบ: อีกครั้ง" && second.turns === 2 && state.values.turns === 2);
check("เซิร์ฟเวอร์จริง: สตรีมได้เหตุการณ์ values ที่มีคำตอบ และไม่มี end หลุดมา", streamed.some((e) => e.event === "values" && JSON.stringify(e.data).includes("ตอบ: สตรีม")) && !streamed.some((e) => e.event === "end"));
check("เซิร์ฟเวอร์จริง: assistant ที่ไม่มีได้ error ที่อ่านรู้เรื่อง", /^เซิร์ฟเวอร์ตอบ 4\d\d/.test(badAssistant));

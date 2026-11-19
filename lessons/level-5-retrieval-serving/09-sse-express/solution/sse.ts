import type { Server } from "node:http";
import { tool } from "@langchain/core/tools";
import express from "express";
import { createAgent } from "langchain";
import { z } from "zod";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-09  (เปิดเซิร์ฟเวอร์ชั่วคราวในสคริปต์เอง แล้วเรียกตัวเองด้วย fetch จึงไม่ต้องเปิดพอร์ตหรือ curl เอง)
// SSE (Server-Sent Events): ส่งสตรีมไปที่เบราว์เซอร์ผ่าน HTTP ธรรมดา แต่ละเหตุการณ์คือข้อความ "event: ..\ndata: ..\n\n" เราเขียนส่วนจัดรูปแบบ + ท่อที่หยุดเองเมื่อผู้ใช้ปิดแท็บ ส่วนผูกกับ Express ให้ไว้แล้ว

interface SseMessage {
  event?: string;
  data: unknown;
  id?: string | number;
}

function formatSse(message: SseMessage): string {
  // ข้อ 1: สร้างข้อความ SSE ตามลำดับ: `id: ..\n` (ถ้ามี id), `event: ..\n` (ถ้ามี event),
  //          แล้ว data: ถ้า data เป็น string ให้แยกตาม "\n" และขึ้น `data: <บรรทัด>\n` ทุกบรรทัด
  //          ถ้าไม่ใช่ string ใช้ JSON.stringify เป็นบรรทัดเดียว จบด้วยบรรทัดว่างหนึ่งบรรทัด ("\n")
  let out = "";
  if (message.id !== undefined) out += `id: ${message.id}\n`;
  if (message.event) out += `event: ${message.event}\n`;
  const lines = typeof message.data === "string" ? message.data.split("\n") : [JSON.stringify(message.data)];
  for (const line of lines) out += `data: ${line}\n`;
  return `${out}\n`;
}

function sseHeaders(): Record<string, string> {
  // ข้อ 2: คืน { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" }
  return { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" };
}

// ปลายทางที่เขียนได้ (Express `res` ใช้แทนได้โดยตรง)
interface Sink {
  write(chunk: string): unknown;
  end(): unknown;
}

// เขียนทุกรายการจาก source ลง sink เป็นข้อความ SSE (ชื่อเหตุการณ์ = item.type ถ้ามี, data = item)
async function streamToSink(source: AsyncIterable<{ type?: string }>, sink: Sink, signal: AbortSignal): Promise<void> {
  try {
    // ข้อ 3: for await (const item of source): ถ้า signal.aborted ให้ break (ออกจาก for await จะหยุดท่อต้นทางเอง) ก่อนเขียน
    //          ไม่งั้น sink.write(formatSse({ event: item.type, data: item }))
    //          ถ้าวนอ่านโยน error และยังไม่ aborted: เขียนเหตุการณ์ "error" ด้วย data { message: ข้อความของ error }
    //          และไม่ว่าจะจบแบบไหน (ปกติ/ยกเลิก/ล้ม) ต้อง sink.end() เสมอ ครั้งเดียว (มี finally ให้แล้ว)
    for await (const item of source) {
      if (signal.aborted) break;
      sink.write(formatSse({ event: item.type, data: item }));
    }
  } catch (error) {
    if (!signal.aborted) sink.write(formatSse({ event: "error", data: { message: error instanceof Error ? error.message : String(error) } }));
  } finally {
    sink.end();
  }
}

type MakeStream = (question: string, signal: AbortSignal) => AsyncIterable<{ type?: string }>;

// (ให้ไว้แล้ว) ส่วนที่ผูกกับ Express: GET /ask?q=...
function createApp(makeStream: MakeStream) {
  const app = express();
  app.get("/ask", async (req, res) => {
    const question = typeof req.query.q === "string" ? req.query.q : "";
    if (!question) {
      res.status(400).json({ error: "ต้องมีพารามิเตอร์ q" });
      return;
    }
    const controller = new AbortController();
    // ผู้ใช้ปิดแท็บ/ตัดการเชื่อมต่อ → ยกเลิก (ทั้งท่อนี้และการรันกราฟที่ผูกกับ signal เดียวกัน)
    res.on("close", () => controller.abort());
    res.writeHead(200, sseHeaders());
    res.flushHeaders();
    await streamToSink(makeStream(question, controller.signal), res as unknown as Sink, controller.signal);
  });
  return app;
}

// ส่วนที่ 1: เซิร์ฟเวอร์จริงบนพอร์ตสุ่ม กับต้นทางที่เราสคริปต์เอง (ผลแน่นอน) แล้วดึงสตรีมดิบด้วย fetch
let upstreamStopped = false;
async function* scripted(question: string, signal: AbortSignal) {
  try {
    yield { type: "token", text: question };
    yield { type: "done" };
    // ต้นทางที่ไม่จบเอง ใช้ทดสอบว่าท่อหยุดเมื่อผู้ใช้ปิดแท็บ (เหมือนกราฟจริงที่รับ signal เดียวกันแล้วหยุดเมื่อถูกยกเลิก)
    if (question === "forever") while (!signal.aborted) await new Promise((r) => setTimeout(r, 5));
  } finally {
    if (question === "forever" && signal.aborted) upstreamStopped = true;
  }
}
function listen(app: ReturnType<typeof express>): Promise<{ server: Server; base: string }> {
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve({ server, base: `http://127.0.0.1:${(server.address() as { port: number }).port}` }));
  });
}
const local = await listen(createApp(scripted));
const res = await fetch(`${local.base}/ask?q=${encodeURIComponent("สวัสดี")}`);
const body = await res.text();
const missing = await fetch(`${local.base}/ask`);

// ผู้ใช้ปิดแท็บกลางสตรีม: อ่านชิ้นแรกแล้วยกเลิก ต้นทางต้องหยุดเอง
const ac = new AbortController();
const live = await fetch(`${local.base}/ask?q=forever`, { signal: ac.signal });
await live.body!.getReader().read();
ac.abort();
for (let i = 0; i < 40 && !upstreamStopped; i++) await new Promise((r) => setTimeout(r, 25));
local.server.close();
console.log(body);

// ส่วนที่ 2: เอเจนต์จริงผ่านเซิร์ฟเวอร์เดียวกัน
const add = tool(async ({ a, b }) => String(a + b), { name: "add", description: "บวกเลขสองจำนวน", schema: z.object({ a: z.number(), b: z.number() }) });
const agent = createAgent({ model: llm, tools: [add] });
async function* progress(question: string, signal: AbortSignal) {
  const run = await agent.streamEvents({ messages: [{ role: "user", content: question }] }, { version: "v3", signal } as never);
  for await (const ev of run) {
    const data = ev.params.data as { event?: string; delta?: { text?: string }; tool_name?: string };
    if (ev.method === "tools" && data.event === "tool-started") yield { type: "tool", name: data.tool_name };
    if (ev.method === "messages" && data.event === "content-block-delta" && data.delta?.text) yield { type: "token", text: data.delta.text };
  }
  yield { type: "done" };
}
const real = await listen(createApp(progress));
const realBody = await (await fetch(`${real.base}/ask?q=${encodeURIComponent("ใช้เครื่องมือ add บวก 20 กับ 22 แล้วบอกผล")}`)).text();
real.server.close();

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
// sink ปลอมที่จดสิ่งที่ถูกเขียน ไม่เปิดพอร์ต
function makeSink() {
  const chunks: string[] = [];
  let ended = 0;
  return { chunks, get ended() { return ended; }, write: (c: string) => (chunks.push(c), true), end: () => { ended++; } };
}
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const h = sseHeaders();
const okSink = makeSink();
async function* two() {
  yield { type: "node", node: "a" };
  yield { type: "done" };
}
await streamToSink(two(), okSink, new AbortController().signal);

const abortSink = makeSink();
const abortAc = new AbortController();
let stopped = false;
let produced = 0;
async function* endless() {
  try {
    while (true) {
      produced++;
      yield { type: "token", n: produced };
      if (produced === 2) abortAc.abort();
      await new Promise((r) => setTimeout(r, 1));
    }
  } finally {
    stopped = true;
  }
}
await streamToSink(endless(), abortSink, abortAc.signal);

const failSink = makeSink();
async function* failing() {
  yield { type: "token" };
  throw new Error("โมเดลล่ม");
}
await streamToSink(failing(), failSink, new AbortController().signal);

const lateSink = makeSink();
const lateAc = new AbortController();
async function* lateFail() {
  yield { type: "a" };
  lateAc.abort();
  throw new Error("ล้มหลังยกเลิก");
}
await streamToSink(lateFail(), lateSink, lateAc.signal);

const preSink = makeSink();
const preAc = new AbortController();
preAc.abort();
async function* one() {
  yield { type: "a" };
}
await streamToSink(one(), preSink, preAc.signal);

check("formatSse: event + data เป็น JSON จบด้วยบรรทัดว่าง", formatSse({ event: "token", data: { text: "ส" } }) === 'event: token\ndata: {"text":"ส"}\n\n');
check("formatSse: id มาก่อน event และไม่มี event ก็ได้", formatSse({ id: 7, event: "x", data: 1 }) === "id: 7\nevent: x\ndata: 1\n\n" && formatSse({ data: "สวัสดี" }) === "data: สวัสดี\n\n");
check("formatSse: ข้อความหลายบรรทัดต้องขึ้น data: ทุกบรรทัด", formatSse({ data: "บรรทัดหนึ่ง\nบรรทัดสอง" }) === "data: บรรทัดหนึ่ง\ndata: บรรทัดสอง\n\n");
const escaped = formatSse({ data: { text: "ก\nข" } });
check("formatSse: ออบเจ็กต์ที่มีขึ้นบรรทัดใหม่ในค่า JSON escape ให้ ข้อความไม่แตก", escaped === 'data: {"text":"ก\\nข"}\n\n' && escaped.split("\n").filter((l) => l.startsWith("data:")).length === 1);
check("sseHeaders: ชนิดสื่อและกัน cache/บีบอัดของตัวกลาง", h["Content-Type"] === "text/event-stream" && h["Cache-Control"].includes("no-cache") && h["Cache-Control"].includes("no-transform"));
check("streamToSink: เขียนทุกรายการเป็นเหตุการณ์ตามชนิด แล้วปิดครั้งเดียว", same(okSink.chunks, ['event: node\ndata: {"type":"node","node":"a"}\n\n', 'event: done\ndata: {"type":"done"}\n\n']) && okSink.ended === 1);
check("ผู้ใช้ปิดแท็บ: หยุดเขียนและหยุดท่อต้นทาง แล้วปิด sink", stopped && abortSink.chunks.length <= 2 && produced <= 3 && abortSink.ended === 1, "break ออกจาก for await เมื่อ signal.aborted");
check("ต้นทางล้ม: ส่งเหตุการณ์ error ปิด sink ไม่ throw ออกมา", failSink.chunks.at(-1) === 'event: error\ndata: {"message":"โมเดลล่ม"}\n\n' && failSink.ended === 1);
check("ยกเลิกแล้วต้นทางล้ม: ไม่เขียน error เพิ่ม แต่ยังปิด sink", !lateSink.chunks.some((c) => c.includes("error")) && lateSink.ended === 1);
check("ยกเลิกก่อนเริ่ม: ไม่เขียนอะไรเลย", preSink.chunks.length === 0 && preSink.ended === 1);
check("เซิร์ฟเวอร์จริง: ได้ text/event-stream และข้อความ SSE ครบ", res.status === 200 && (res.headers.get("content-type") ?? "").includes("text/event-stream") && body === 'event: token\ndata: {"type":"token","text":"สวัสดี"}\n\nevent: done\ndata: {"type":"done"}\n\n');
check("เซิร์ฟเวอร์จริง: ไม่มี q ได้ 400", missing.status === 400);
check("เซิร์ฟเวอร์จริง: ลูกค้าตัดการเชื่อมต่อแล้วต้นทางหยุดเอง", upstreamStopped, "res.on(\"close\") สั่ง abort");
check("เอเจนต์จริงผ่าน SSE: มีเหตุการณ์ token และ done และเรียก tool add", realBody.includes("event: token") && realBody.includes("event: done") && realBody.includes("event: tool"));

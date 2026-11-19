import { fileURLToPath } from "node:url";
import { Client } from "@langchain/langgraph-sdk";
import { startDevServer } from "@src/devServer";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-16  (เปิดเซิร์ฟเวอร์ langgraph dev ชั่วคราวในสคริปต์เอง ครั้งแรกใช้เวลาสักครู่ ไม่ใช้ LLM)
// JS SDK (@langchain/langgraph-sdk): Client เรียกเซิร์ฟเวอร์ให้เราแทน fetch ดิบของบท 5-15 บทนี้เขียนชั้นบางครอบมัน: เริ่มงานที่หยุดรออนุมัติ (interrupt), กู้คำถามที่ค้างจาก state (เช่นผู้ใช้เปิดหน้าใหม่), ตัดสินใจต่อ, สตรีมการอัปเดต และแปลงข้อผิดพลาดเป็นข้อความที่ผู้ใช้อ่านรู้เรื่อง

// ส่วนย่อยของ Client จริงที่บทนี้ใช้ (ของจริงใช้แทนได้ ส่วนของปลอมในส่วนตรวจก็หน้าตาเหมือนกัน)
interface ClientLike {
  threads: {
    create(): Promise<{ thread_id: string }>;
    getState(threadId: string): Promise<{ values: unknown; next: string[]; tasks: { interrupts: { value: unknown }[] }[] }>;
  };
  runs: {
    wait(threadId: string | null, assistantId: string, payload: Record<string, unknown>): Promise<any>;
    stream(threadId: string | null, assistantId: string, payload: Record<string, unknown>): AsyncIterable<{ event: string; data: any }>;
  };
}

interface Started {
  threadId: string;
  pending?: unknown; // คำถามที่รออนุมัติ (ค่าที่ interrupt ส่งมา) ถ้ามี
  result: any;
}

async function startOrder(client: ClientLike, assistantId: string, item: string): Promise<Started> {
  // ข้อ 1: สร้าง thread ด้วย client.threads.create() แล้ว client.runs.wait(thread_id, assistantId, { input: { item } })
  //          คืน { threadId, pending: result.__interrupt__?.[0]?.value, result }
  const { thread_id } = await client.threads.create();
  const result = await client.runs.wait(thread_id, assistantId, { input: { item } });
  return { threadId: thread_id, pending: result.__interrupt__?.[0]?.value, result };
}

// กู้คำถามที่ค้างอยู่ (เช่นผู้ใช้เปิดหน้าใหม่) จาก state ของ thread
async function pendingApproval(client: ClientLike, threadId: string): Promise<unknown | undefined> {
  // ข้อ 2: state = await client.threads.getState(threadId) คืน value ของ interrupt ตัวแรกที่พบใน state.tasks (วน tasks แล้ว interrupts) ไม่มีคืน undefined
  const state = await client.threads.getState(threadId);
  for (const t of state.tasks) if (t.interrupts.length > 0) return t.interrupts[0].value;
  return undefined;
}

async function decide(client: ClientLike, assistantId: string, threadId: string, approve: boolean): Promise<any> {
  // ข้อ 3: client.runs.wait(threadId, assistantId, { command: { resume: approve } }) แล้วคืนผล
  return client.runs.wait(threadId, assistantId, { command: { resume: approve } });
}

type Update = { type: "node"; node: string; update: unknown } | { type: "interrupt"; value: unknown };

async function* streamUpdates(client: ClientLike, assistantId: string, threadId: string, input: Record<string, unknown>): AsyncGenerator<Update> {
  // ข้อ 4: วน client.runs.stream(threadId, assistantId, { input, streamMode: ["updates"] })
  //   สนใจเฉพาะ event === "updates": วน Object.entries(data): คีย์ "__interrupt__" → yield { type: "interrupt", value: ค่าของ interrupt ตัวแรก (data.__interrupt__[0].value) }
  //   คีย์อื่น → yield { type: "node", node: คีย์, update: ค่า }  เหตุการณ์ชนิดอื่น (metadata, end) ข้าม
  for await (const ev of client.runs.stream(threadId, assistantId, { input, streamMode: ["updates"] })) {
    if (ev.event !== "updates") continue;
    for (const [key, value] of Object.entries(ev.data as Record<string, any>)) {
      if (key === "__interrupt__") yield { type: "interrupt", value: value[0].value };
      else yield { type: "node", node: key, update: value };
    }
  }
}

// แปลงข้อผิดพลาดของ SDK/เครือข่ายเป็นข้อความที่ผู้ใช้อ่านรู้เรื่อง (ไม่เผยรายละเอียดภายในเซิร์ฟเวอร์)
function describeError(error: unknown): string {
  // ข้อ 5: อ่าน status จาก (error as { status?: number }).status
  //   404 → "ไม่พบ graph หรือ thread บนเซิร์ฟเวอร์"; 401 หรือ 403 → "ไม่มีสิทธิ์เรียกเซิร์ฟเวอร์ (ตรวจ API key)";
  //   status >= 500 → "เซิร์ฟเวอร์มีปัญหา ลองใหม่ภายหลัง";
  //   ไม่มี status แต่ข้อความมี "fetch failed" หรือ "ECONNREFUSED" → "ต่อเซิร์ฟเวอร์ไม่ได้ ตรวจว่าเปิดอยู่และที่อยู่ถูกต้อง";
  //   นอกนั้นคืน "เกิดข้อผิดพลาดที่ไม่คาดคิด"
  const status = (error as { status?: number } | null)?.status;
  if (status === 404) return "ไม่พบ graph หรือ thread บนเซิร์ฟเวอร์";
  if (status === 401 || status === 403) return "ไม่มีสิทธิ์เรียกเซิร์ฟเวอร์ (ตรวจ API key)";
  if (typeof status === "number" && status >= 500) return "เซิร์ฟเวอร์มีปัญหา ลองใหม่ภายหลัง";
  const message = error instanceof Error ? error.message : "";
  if (status === undefined && (message.includes("fetch failed") || message.includes("ECONNREFUSED"))) return "ต่อเซิร์ฟเวอร์ไม่ได้ ตรวจว่าเปิดอยู่และที่อยู่ถูกต้อง";
  return "เกิดข้อผิดพลาดที่ไม่คาดคิด";
}

// ส่วนที่ 1: เซิร์ฟเวอร์จริง + Client จริง (graph "order": เตรียม → หยุดรออนุมัติ → ผลลัพธ์)
const PORT = 2956;
const config = fileURLToPath(new URL("../server/langgraph.json", import.meta.url));
console.log("กำลังเปิดเซิร์ฟเวอร์ (ครั้งแรกอาจใช้เวลาสักครู่)...");
const stop = await startDevServer(config, PORT);
let started: Started | undefined;
let recovered: unknown;
let approved: any;
let afterDecision: unknown = "ยังไม่ได้เช็ก";
const streamed: Update[] = [];
let badRaw = "";
let badFriendly = "";
try {
  const client = new Client({ apiUrl: `http://localhost:${PORT}` });
  const like = client as unknown as ClientLike;
  started = await startOrder(like, "order", "หูฟัง");
  recovered = await pendingApproval(like, started.threadId);
  approved = await decide(like, "order", started.threadId, true);
  afterDecision = await pendingApproval(like, started.threadId);
  const fresh = (await client.threads.create()).thread_id;
  for await (const u of streamUpdates(like, "order", fresh, { item: "หมวก" })) streamed.push(u);
  try {
    await like.runs.wait(fresh, "ไม่มีจริง", { input: {} });
  } catch (error) {
    badRaw = (error as Error).message;
    badFriendly = describeError(error);
  }
} finally {
  stop();
}
console.log({ started, recovered, approved, afterDecision, streamed, badRaw: badRaw.slice(0, 60), badFriendly });

// ส่วนที่ 2: client ปลอมที่ทำตัวเหมือนเซิร์ฟเวอร์ graph "order" (ตรวจรูปคำสั่งที่เราส่ง)
function fakeServer() {
  const calls: { op: string; args: unknown[] }[] = [];
  const threads = new Map<string, { item: string; result?: string }>();
  let n = 0;
  const interrupt = (item: string) => ({ __interrupt__: [{ id: "i1", value: { question: `อนุมัติ ${item} ไหม` } }] });
  const fake: ClientLike = {
    threads: {
      async create() {
        const id = `t${++n}`;
        threads.set(id, { item: "" });
        calls.push({ op: "create", args: [] });
        return { thread_id: id };
      },
      async getState(id) {
        calls.push({ op: "getState", args: [id] });
        const t = threads.get(id)!;
        const waiting = t.item !== "" && t.result === undefined;
        return { values: t, next: waiting ? ["approve"] : [], tasks: waiting ? [{ interrupts: [{ value: { question: `อนุมัติ ${t.item} ไหม` } }] }] : [{ interrupts: [] }] };
      },
    },
    runs: {
      async wait(id, assistant, payload) {
        calls.push({ op: "wait", args: [id, assistant, payload] });
        const t = threads.get(id!)!;
        const command = payload.command as { resume: boolean } | undefined;
        if (command) {
          t.result = command.resume ? `อนุมัติ ${t.item}` : "ไม่อนุมัติ";
          return { item: t.item, result: t.result };
        }
        t.item = (payload.input as { item: string }).item;
        return interrupt(t.item);
      },
      async *stream(id, assistant, payload) {
        calls.push({ op: "stream", args: [id, assistant, payload] });
        const item = (payload.input as { item: string }).item;
        yield { event: "metadata", data: { run_id: "r" } };
        yield { event: "values", data: { item } };
        yield { event: "updates", data: { prepare: { note: "เตรียมแล้ว" } } };
        yield { event: "updates", data: interrupt(item) };
        yield { event: "end", data: { status: "success" } };
      },
    },
  };
  return { fake, calls };
}
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const s1 = fakeServer();
const so = await startOrder(s1.fake, "order", "หูฟัง");
const noInterrupt = fakeServer();
noInterrupt.fake.runs.wait = async () => ({ item: "x", result: "เสร็จ" });
const noPending = (await startOrder(noInterrupt.fake, "order", "x")).pending;
const s2 = fakeServer();
const so2 = await startOrder(s2.fake, "order", "แว่น");
const recover1 = await pendingApproval(s2.fake, so2.threadId);
await decide(s2.fake, "order", so2.threadId, true);
const recover2 = await pendingApproval(s2.fake, so2.threadId);
const s3 = fakeServer();
s3.fake.threads.getState = async () => ({ values: {}, next: ["b"], tasks: [{ interrupts: [] }, { interrupts: [{ value: "คำถาม" }] }] });
const secondTask = await pendingApproval(s3.fake, "t");
const s4 = fakeServer();
const so4 = await startOrder(s4.fake, "order", "หูฟัง");
const yes = await decide(s4.fake, "order", so4.threadId, true);
const yesPayload = s4.calls.at(-1)?.args[2];
const so5 = await startOrder(s4.fake, "order", "แว่น");
const no = await decide(s4.fake, "order", so5.threadId, false);
const noPayload = s4.calls.at(-1)?.args[2];
const s5 = fakeServer();
const ups: Update[] = [];
for await (const u of streamUpdates(s5.fake, "order", "t9", { item: "หมวก" })) ups.push(u);
const http = (status: number) => Object.assign(new Error(`HTTP ${status}: ข้อมูลภายในเซิร์ฟเวอร์ secret-path`), { status });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("startOrder: สร้าง thread รัน และได้คำถามที่รออนุมัติ", so.threadId === "t1" && same(so.pending, { question: "อนุมัติ หูฟัง ไหม" }) && same(s1.calls.map((c) => c.op), ["create", "wait"]) && same(s1.calls[1].args, ["t1", "order", { input: { item: "หูฟัง" } }]));
check("startOrder: กราฟที่ไม่หยุดรอ (ไม่มี interrupt) → pending เป็น undefined", noPending === undefined);
check("pendingApproval: กู้คำถามที่ค้างจาก state และคืน undefined เมื่อไม่มี", same(recover1, { question: "อนุมัติ แว่น ไหม" }) && recover2 === undefined);
check("pendingApproval: หา interrupt ได้แม้ task แรกไม่มี", secondTask === "คำถาม");
check("decide: ส่ง command.resume ตามการตัดสินใจ", same(yes, { item: "หูฟัง", result: "อนุมัติ หูฟัง" }) && same(yesPayload, { command: { resume: true } }) && no.result === "ไม่อนุมัติ" && same(noPayload, { command: { resume: false } }));
check("streamUpdates: แปลง updates เป็น node/interrupt ข้าม metadata, values, end", same(ups, [{ type: "node", node: "prepare", update: { note: "เตรียมแล้ว" } }, { type: "interrupt", value: { question: "อนุมัติ หมวก ไหม" } }]) && same(s5.calls[0], { op: "stream", args: ["t9", "order", { input: { item: "หมวก" }, streamMode: ["updates"] }] }));
check("describeError: แปลงตามสถานะ และไม่เผยรายละเอียดภายใน", describeError(http(404)) === "ไม่พบ graph หรือ thread บนเซิร์ฟเวอร์" && describeError(http(401)).includes("ไม่มีสิทธิ์") && describeError(http(403)).includes("ไม่มีสิทธิ์") && describeError(http(500)) === "เซิร์ฟเวอร์มีปัญหา ลองใหม่ภายหลัง" && describeError(http(503)) === "เซิร์ฟเวอร์มีปัญหา ลองใหม่ภายหลัง" && !describeError(http(404)).includes("secret-path"));
check("describeError: ต่อไม่ติดและกรณีอื่น", describeError(new TypeError("fetch failed")).includes("ต่อเซิร์ฟเวอร์ไม่ได้") && describeError(new Error("connect ECONNREFUSED ::1:2024")).includes("ต่อเซิร์ฟเวอร์ไม่ได้") && describeError(new Error("อะไรสักอย่าง")) === "เกิดข้อผิดพลาดที่ไม่คาดคิด" && describeError("string") === "เกิดข้อผิดพลาดที่ไม่คาดคิด" && describeError(undefined) === "เกิดข้อผิดพลาดที่ไม่คาดคิด" && describeError(Object.assign(new Error("HTTP 418"), { status: 418 })) === "เกิดข้อผิดพลาดที่ไม่คาดคิด");
check("เซิร์ฟเวอร์จริง: เริ่มงานแล้วหยุดรออนุมัติ และกู้คำถามเดิมจาก state ได้", same(started?.pending, { question: "อนุมัติ หูฟัง ไหม" }) && same(recovered, started?.pending));
check("เซิร์ฟเวอร์จริง: อนุมัติแล้วได้ผลลัพธ์ และไม่มีคำถามค้างอีก", approved?.result === "อนุมัติ หูฟัง" && afterDecision === undefined);
check("เซิร์ฟเวอร์จริง: สตรีมการอัปเดตได้ node prepare แล้ว interrupt", streamed[0]?.type === "node" && (streamed[0] as { node: string }).node === "prepare" && streamed.at(-1)?.type === "interrupt");
check("เซิร์ฟเวอร์จริง: assistant ที่ไม่มีได้ข้อความที่ผู้ใช้อ่านรู้เรื่อง ไม่ใช่ข้อความดิบ", badFriendly === "ไม่พบ graph หรือ thread บนเซิร์ฟเวอร์", `ข้อความดิบ: ${badRaw.slice(0, 40)}`);

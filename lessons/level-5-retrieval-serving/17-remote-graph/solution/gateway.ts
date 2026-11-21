import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { END, MemorySaver, START, StateGraph, StateSchema } from "@langchain/langgraph";
import type { BaseCheckpointSaver, LangGraphRunnableConfig } from "@langchain/langgraph";
import { RemoteGraph } from "@langchain/langgraph/remote";
import { z } from "zod";
import { startDevServer } from "@src/devServer";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-17  (เปิดเซิร์ฟเวอร์ langgraph dev ชั่วคราวในสคริปต์เอง ครั้งแรกใช้เวลาสักครู่ ไม่ใช้ LLM)
// RemoteGraph: เรียก graph ที่รันอยู่บนเซิร์ฟเวอร์อื่นเหมือนเป็น graph ในเครื่อง บทนี้เขียนตัวเชื่อม (adapter) ที่ทำให้กราฟแม่ปลอดภัย: ส่งเฉพาะ input ที่ปลายทางควรเห็น (ไม่ส่งความลับ), map thread ของแม่เป็น thread ฝั่งปลายทาง (ต้องเป็น UUID), ตรวจรูปคำตอบ และถ้าปลายทางล่มให้ใช้ fallback แทนที่จะล้มทั้งกราฟ

// ส่วนย่อยของ RemoteGraph ที่ใช้ (ตัวจริงใช้แทนได้)
interface RemoteLike {
  invoke(input: Record<string, unknown>, config?: { configurable?: Record<string, unknown> }): Promise<Record<string, unknown>>;
}

const State = new StateSchema({
  question: z.string().default(""),
  secret: z.string().default(""), // ข้อมูลของกราฟแม่ที่ห้ามส่งไปปลายทาง
  answer: z.string().default(""),
  source: z.string().default(""), // "remote" หรือ "fallback"
  error: z.string().default(""),
});
type S = typeof State.State;

function toRemoteInput(state: Pick<S, "question">): Record<string, unknown> {
  return { question: state.question };
}

// thread ฝั่งปลายทางที่อิงจาก thread ของกราฟแม่ (undefined = ไม่มี thread ต่อเนื่อง)
function remoteThreadId(parentThreadId: unknown): string | undefined {
  if (typeof parentThreadId !== "string" || parentThreadId === "") return undefined;
  const h = createHash("sha256").update(`remote:${parentThreadId}`).digest("hex");
  const v = ((Number.parseInt(h[16], 16) & 0x3) | 0x8).toString(16);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${v}${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

function fromRemoteOutput(out: Record<string, unknown>): Partial<S> {
  if (typeof out.answer !== "string" || out.answer === "") throw new Error("ปลายทางไม่ส่ง answer ที่ใช้ได้");
  return { answer: out.answer, source: "remote", error: "" };
}

async function askRemote(remote: RemoteLike, state: S, config?: LangGraphRunnableConfig): Promise<Partial<S>> {
  const threadId = remoteThreadId(config?.configurable?.thread_id);
  try {
    const out = await remote.invoke(toRemoteInput(state), threadId ? { configurable: { thread_id: threadId } } : undefined);
    return fromRemoteOutput(out);
  } catch (error) {
    return { answer: "ขออภัย ระบบปลายทางไม่พร้อมให้บริการ", source: "fallback", error: error instanceof Error ? error.message : String(error) };
  }
}

// (ให้ไว้แล้ว) กราฟแม่: ask (เรียกปลายทางผ่าน adapter) → END
function buildGateway(remote: RemoteLike, checkpointer?: BaseCheckpointSaver) {
  return new StateGraph(State)
    .addNode("ask", (state, config) => askRemote(remote, state, config))
    .addEdge(START, "ask")
    .addEdge("ask", END)
    .compile(checkpointer ? { checkpointer } : undefined);
}

// ส่วนที่ 1: เซิร์ฟเวอร์ปลายทางจริง (graph "demo" ตอบโดยนับรอบใน thread) ผ่าน RemoteGraph จริง
const PORT = 2957;
const config = fileURLToPath(new URL("../server/langgraph.json", import.meta.url));
console.log("กำลังเปิดเซิร์ฟเวอร์ปลายทาง (ครั้งแรกอาจใช้เวลาสักครู่)...");
const stop = await startDevServer(config, PORT);
const liveAnswers: { answer: string; source: string; error: string }[] = [];
try {
  const remote = new RemoteGraph({ graphId: "demo", url: `http://localhost:${PORT}` }) as unknown as RemoteLike;
  const app = buildGateway(remote, new MemorySaver());
  const cfg = { configurable: { thread_id: `demo-${Date.now()}` } };
  for (const question of ["สวัสดี", "ถามอีกครั้งใน thread เดิม"]) {
    const r = await app.invoke({ question, secret: "ความลับของกราฟแม่" }, cfg);
    liveAnswers.push({ answer: r.answer, source: r.source, error: r.error });
  }
} finally {
  stop();
}
// ปลายทางไม่ขึ้น → ควรได้ fallback ไม่ใช่ล้มทั้งกราฟ
const dead = new RemoteGraph({ graphId: "demo", url: "http://localhost:1" }) as unknown as RemoteLike;
const deadOut = await buildGateway(dead).invoke({ question: "ปลายทางล่ม" });
console.log({ liveAnswers, dead: deadOut.answer, source: deadOut.source, error: deadOut.error.slice(0, 50) });

// ส่วนที่ 2: ปลายทางปลอมที่จดว่าถูกเรียกด้วยอะไร
function fakeRemote(handler: (input: Record<string, unknown>) => Promise<Record<string, unknown>>) {
  const calls: { input: Record<string, unknown>; config?: { configurable?: Record<string, unknown> } }[] = [];
  const remote: RemoteLike = {
    async invoke(input, config) {
      calls.push({ input, config });
      return handler(input);
    },
  };
  return { remote, calls };
}
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const throws = (fn: () => void): string => {
  try {
    fn();
    return "";
  } catch (e) {
    return (e as Error).message;
  }
};
const f1 = fakeRemote(async () => ({ answer: "จากปลายทาง" }));
const r1 = await buildGateway(f1.remote).invoke({ question: "ถาม", secret: "รหัสลับ-999" });
const f2 = fakeRemote(async () => ({ answer: "ok" }));
const app2 = buildGateway(f2.remote, new MemorySaver());
await app2.invoke({ question: "1" }, { configurable: { thread_id: "p1" } });
await app2.invoke({ question: "2" }, { configurable: { thread_id: "p1" } });
await app2.invoke({ question: "3" }, { configurable: { thread_id: "p2" } });
const threadIds = f2.calls.map((c) => c.config?.configurable?.thread_id);
const f3 = fakeRemote(async () => {
  throw new Error("HTTP 503");
});
const r3 = await buildGateway(f3.remote).invoke({ question: "ถาม" });
const f4 = fakeRemote(async () => ({ somethingElse: 1 }));
const r4 = await buildGateway(f4.remote).invoke({ question: "ถาม" });
const f5 = fakeRemote(async () => ({ answer: "x" }));
const out5 = await askRemote(f5.remote, { question: "q", secret: "s", answer: "", source: "", error: "" } as never);
const seen: unknown[][] = [];
const clientStub = {
  runs: {
    async *stream(...args: unknown[]) {
      seen.push(args);
      yield { event: "values", data: { question: "ถาม", answer: "จาก RemoteGraph" } };
    },
  },
};
const stubRemote = new RemoteGraph({ graphId: "demo", client: clientStub as never });
const r6 = await buildGateway(stubRemote as unknown as RemoteLike, new MemorySaver()).invoke({ question: "ถาม", secret: "ลับ-777" }, { configurable: { thread_id: "p9" } });












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("toRemoteInput: ส่งเฉพาะ question", same(toRemoteInput({ question: "สวัสดี", secret: "ลับ", answer: "x" } as never), { question: "สวัสดี" }));
check("remoteThreadId: เป็น UUID คงที่ต่อ thread เดิม และต่างกันต่อ thread ต่างกัน", UUID.test(remoteThreadId("abc") ?? "") && remoteThreadId("abc") === remoteThreadId("abc") && remoteThreadId("abc") !== remoteThreadId("abd") && UUID.test(remoteThreadId("ผู้ใช้-1") ?? ""));
check("remoteThreadId: ไม่มี thread ก็ไม่มี", [undefined, "", null, 5].every((none) => remoteThreadId(none) === undefined));
check("fromRemoteOutput: ใช้ answer และปฏิเสธรูปแบบที่ไม่ถูกต้อง", same(fromRemoteOutput({ answer: "ตอบ", extra: 1 }), { answer: "ตอบ", source: "remote", error: "" }) && [{}, { answer: "" }, { answer: 42 }, { answer: null }].every((bad) => throws(() => fromRemoteOutput(bad)).includes("ปลายทางไม่ส่ง answer")));
check("กราฟแม่: ส่งเฉพาะ question ไปปลายทาง (secret ไม่รั่ว) และรับ answer กลับ", r1.answer === "จากปลายทาง" && r1.source === "remote" && r1.error === "" && r1.secret === "รหัสลับ-999" && same(f1.calls[0].input, { question: "ถาม" }) && !JSON.stringify(f1.calls[0]).includes("999"));
check("thread ปลายทางอิงจาก thread ของแม่ และคงที่ข้ามรอบ", same(threadIds, [remoteThreadId("p1"), remoteThreadId("p1"), remoteThreadId("p2")]) && UUID.test(String(threadIds[0])) && threadIds[0] !== threadIds[2]);
check("ปลายทางล้ม: กราฟแม่ไม่ล้ม ได้ fallback พร้อมบันทึกสาเหตุ", r3.answer === "ขออภัย ระบบปลายทางไม่พร้อมให้บริการ" && r3.source === "fallback" && r3.error === "HTTP 503");
check("ปลายทางตอบผิดรูป: ใช้ fallback ไม่ใช่ปล่อยค่าว่างต่อ", r4.source === "fallback" && r4.error.includes("ปลายทางไม่ส่ง answer"));
check("askRemote: คืนเฉพาะฟิลด์ที่ต้องอัปเดต ไม่แตะ question/secret", same(Object.keys(out5).sort(), ["answer", "error", "source"]));
check("RemoteGraph (client ปลอม): graphId และ thread ปลายทางถูกส่ง และ input ไม่มี secret", r6.answer === "จาก RemoteGraph" && seen[0][0] === remoteThreadId("p9") && UUID.test(String(seen[0][0])) && seen[0][1] === "demo" && !JSON.stringify(seen[0][2]).includes("777"));
check("เซิร์ฟเวอร์จริง: ถามสองรอบใน thread เดิมได้รอบ 1 แล้วรอบ 2 (state ค้างฝั่งปลายทาง)", liveAnswers[0]?.source === "remote" && liveAnswers[0].answer.includes("[รอบ 1]") && liveAnswers[1]?.answer.includes("[รอบ 2]"));
check("ปลายทางล่มจริง: ได้ fallback ไม่ใช่ล้มทั้งกราฟ", deadOut.source === "fallback" && deadOut.error.length > 0);

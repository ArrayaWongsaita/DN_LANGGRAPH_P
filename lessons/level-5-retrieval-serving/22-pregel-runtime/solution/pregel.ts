import { END, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-22  (ไม่ใช้ LLM รัน graph จริงของ LangGraph กับ node ปลอม)
// Pregel runtime: graph ทำงานเป็น "รอบ" (superstep) แต่ละรอบรัน node ที่พร้อมพร้อมกัน เขียนผลลงช่อง (channel) แล้วค่อยขึ้นรอบถัดไป บทนี้ดูมันด้วยตา: จัดกลุ่ม node ตามรอบจาก stream แบบ debug, รู้ว่าทำไมสอง node เขียนฟิลด์เดียวกันในรอบเดียวถึง error (ต้องมี reducer), ทำไมชื่อ node ห้ามซ้ำชื่อฟิลด์ และ channel ไหนเป็นของ runtime เอง

// diamond: a → (b, c) → d  ทุก node เขียนบันทึกลงฟิลด์ log
// withReducer = true → log รวมค่าด้วย reducer, false → log เป็นฟิลด์ธรรมดา (LastValue)
function buildDiamond(withReducer: boolean) {
  const State = new StateSchema({
    log: withReducer
      ? new ReducedValue(z.array(z.string()).default(() => []), { inputSchema: z.string(), reducer: (a: string[], b: string) => [...a, b] })
      : z.array(z.string()).default(() => []),
  });
  const write = (name: string) => () => ({ log: (withReducer ? name : [name]) as never });
  return new StateGraph(State)
    .addNode("a", write("a"))
    .addNode("b", write("b"))
    .addNode("c", write("c"))
    .addNode("d", write("d"))
    .addEdge(START, "a")
    .addEdge("a", "b")
    .addEdge("a", "c")
    .addEdge("b", "d")
    .addEdge("c", "d")
    .addEdge("d", END)
    .compile();
}

interface DebugEvent {
  type: string;
  step: number;
  payload?: { name?: string };
}

// (ให้ไว้แล้ว) เก็บ event แบบ debug ทั้งหมดของการรันหนึ่งครั้ง
async function recordDebug(graph: ReturnType<typeof buildDiamond>): Promise<DebugEvent[]> {
  const events: DebugEvent[] = [];
  for await (const e of await graph.stream({}, { streamMode: "debug" })) events.push(e as unknown as DebugEvent);
  return events;
}

// จัดกลุ่ม node ตามรอบ (superstep) จาก event ชนิด "task" เท่านั้น เรียงเลขรอบน้อย→มาก ชื่อ node ในรอบเรียงตามตัวอักษร
function groupSupersteps(events: DebugEvent[]): { step: number; nodes: string[] }[] {
  const byStep = new Map<number, string[]>();
  for (const e of events) {
    const name = e.type === "task" ? e.payload?.name : undefined;
    if (!name) continue;
    byStep.set(e.step, [...(byStep.get(e.step) ?? []), name]);
  }
  return [...byStep.entries()].sort((x, y) => x[0] - y[0]).map(([step, nodes]) => ({ step, nodes: nodes.sort() }));
}

// จำนวน node ที่รันขนานกันมากที่สุดในรอบเดียว (ไม่มีรอบเลย = 0)
function maxParallelism(steps: { nodes: string[] }[]): number {
  return steps.reduce((max, s) => Math.max(max, s.nodes.length), 0);
}

// ชื่อที่ซ้ำกันระหว่างชื่อ node กับชื่อฟิลด์ State (คืนตามลำดับใน nodeNames ไม่ซ้ำ)
function findNameClashes(nodeNames: string[], stateKeys: string[]): string[] {
  return [...new Set(nodeNames.filter((name) => stateKeys.includes(name)))];
}

// error นี้คือ "สอง node เขียนฟิลด์ LastValue เดียวกันในรอบเดียว" ใช่ไหม
function isConcurrentUpdateError(error: unknown): boolean {
  if (error === null || typeof error !== "object") return false;
  const code = (error as { lc_error_code?: string }).lc_error_code;
  const message = error instanceof Error ? error.message : "";
  return code === "INVALID_CONCURRENT_GRAPH_UPDATE" || message.includes("can only receive one value per step");
}

// เหลือเฉพาะ channel ของผู้ใช้ (ฟิลด์ State) โดยตัด channel ภายในของ runtime ที่ขึ้นต้นด้วย "__", "branch:", "join:" หรือ "start:"
function userChannels(channelNames: string[]): string[] {
  const internal = ["__", "branch:", "join:", "start:"];
  return channelNames.filter((name) => !internal.some((prefix) => name.startsWith(prefix)));
}

// ส่วนที่ 1: ดู graph จริงทำงาน
const graph = buildDiamond(true);
const steps = groupSupersteps(await recordDebug(graph));
const channelNames = Object.keys((graph as unknown as { channels: object }).channels);
console.log("รอบรัน:", steps.map((s) => `#${s.step} [${s.nodes.join(", ")}]`).join("  "));
console.log("ขนานสูงสุด:", maxParallelism(steps), "node");
console.log("channel ทั้งหมด:", channelNames.join(", "));
console.log("channel ของผู้ใช้:", userChannels(channelNames).join(", "));
const withReducerOut = await graph.invoke({});
let noReducerError: unknown;
try {
  await buildDiamond(false).invoke({});
} catch (error) {
  noReducerError = error;
  console.log("ไม่มี reducer →", isConcurrentUpdateError(error) ? "error ความขนาน:" : "error อื่น:", (error as Error).message.split("\n")[0]);
}
const ClashState = new StateSchema({ log: z.string().default(""), n: z.number().default(0) });
console.log("ชื่อ node ที่ชนกับฟิลด์:", findNameClashes(["plan", "log"], ["log", "n"]));
let clashMessage = "";
try {
  new StateGraph(ClashState).addNode("log", () => ({})).addEdge(START, "log").addEdge("log", END);
} catch (error) {
  clashMessage = (error as Error).message;
  console.log("addNode ชื่อ log →", clashMessage);
}












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const numbers = steps.map((s) => s.step);
const out = withReducerOut as { log: string[] };
const groupedDemo = groupSupersteps([
  { type: "checkpoint", step: 0 },
  { type: "task", step: 2, payload: { name: "z" } },
  { type: "task", step: 1, payload: { name: "a" } },
  { type: "task_result", step: 1, payload: { name: "a" } },
  { type: "task", step: 2, payload: { name: "m" } },
  { type: "task", step: 3, payload: {} },
  { type: "task", step: 3 },
]);
check("diamond มี 3 รอบ และ b กับ c อยู่รอบเดียวกัน (เลขรอบเรียงและไม่ซ้ำ)", same(steps.map((s) => s.nodes), [["a"], ["b", "c"], ["d"]]) && same(numbers, [...numbers].sort((x, y) => x - y)) && new Set(numbers).size === 3);
check("มี reducer: ผลของ node ขนานถูกรวมครบ", same([...out.log].sort(), ["a", "b", "c", "d"]) && out.log[0] === "a" && out.log[3] === "d");
check("ไม่มี reducer: สอง node เขียนฟิลด์เดียวกันในรอบเดียว → error ความขนาน", noReducerError !== undefined && isConcurrentUpdateError(noReducerError));
check("groupSupersteps: เรียงรอบ, เรียงชื่อ, ข้าม event ที่ไม่ใช่ task และ task ที่ไม่มีชื่อ", same(groupedDemo, [{ step: 1, nodes: ["a"] }, { step: 2, nodes: ["m", "z"] }]) && same(groupSupersteps([]), []));
check("groupSupersteps: เรียงเลขรอบเป็นตัวเลข (10 มาหลัง 2)", same(groupSupersteps([{ type: "task", step: 10, payload: { name: "late" } }, { type: "task", step: 2, payload: { name: "early" } }]).map((s) => s.step), [2, 10]));
check("maxParallelism", maxParallelism([]) === 0 && maxParallelism([{ nodes: ["a"] }, { nodes: ["b", "c", "d"] }, { nodes: ["e", "f"] }]) === 3);
check("findNameClashes: เจอชื่อซ้ำ ไม่ซ้ำกันเอง ตามลำดับ node", same(findNameClashes(["plan", "log", "n", "log"], ["n", "log", "other"]), ["log", "n"]) && same(findNameClashes(["a", "b"], ["x"]), []) && same(findNameClashes([], ["x"]), []));
check("isConcurrentUpdateError: รู้จักด้วยรหัสหรือข้อความ และไม่หลงทางกับ error อื่น", isConcurrentUpdateError(Object.assign(new Error("x"), { lc_error_code: "INVALID_CONCURRENT_GRAPH_UPDATE" })) && isConcurrentUpdateError(new Error('Invalid update for channel "log": LastValue can only receive one value per step.')) && !isConcurrentUpdateError(new Error("อื่น")) && !isConcurrentUpdateError(Object.assign(new Error("x"), { lc_error_code: "GRAPH_RECURSION_LIMIT" })) && [null, undefined, "string", 42].every((v) => !isConcurrentUpdateError(v)));
check("userChannels: ตัด channel ภายในของ runtime (เช็กเฉพาะคำขึ้นต้น)", same(userChannels(["log", "n", "__start__", "__pregel_tasks", "branch:to:a", "join:b+c:d", "start:a"]), ["log", "n"]) && same(userChannels(["branchy", "starter", "notes__old", "restart:flag"]), ["branchy", "starter", "notes__old", "restart:flag"]));
check("channel จริงของ graph: ฟิลด์ของเรามีอยู่ และมี channel ภายในปนอยู่", same(userChannels(channelNames), ["log"]) && channelNames.length > 1);
check("addNode ชื่อเดียวกับฟิลด์ State → LangGraph ปฏิเสธ", clashMessage.length > 0, "ลองดูข้อความ error ที่พิมพ์ไว้ด้านบน");

import { END, MemorySaver, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-14  (ไม่ใช้ LLM)
// time travel: ย้อนกลับไปจุดเก่าแล้ว "เล่นซ้ำ" (replay) หรือ "แก้ State แล้วแตกเส้นทางใหม่" (fork) ต่อจากจุดนั้น
const State = new StateSchema({
  log: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(),
    reducer: (current: string[], next: string) => [...current, next],
  }),
});

const graph = new StateGraph(State)
  .addNode("a", () => ({ log: "a" }))
  .addNode("b", () => ({ log: "b" }))
  .addNode("c", () => ({ log: "c" }))
  .addEdge(START, "a")
  .addEdge("a", "b")
  .addEdge("b", "c")
  .addEdge("c", END)
  .compile({ checkpointer: new MemorySaver() });

// รันให้จบไปแล้วสอง thread (หนึ่งไว้เล่นซ้ำ หนึ่งไว้แตกเส้นใหม่)
const replayCfg = { configurable: { thread_id: "replay" } };
const forkCfg = { configurable: { thread_id: "fork" } };
await graph.invoke({}, replayCfg);
await graph.invoke({}, forkCfg);

// หา checkpoint ก่อนทำ node "b" ของ thread หนึ่ง (ให้มาแล้ว)
async function snapshotBeforeB(config: typeof replayCfg) {
  for await (const s of graph.getStateHistory(config)) {
    if (s.next.includes("b")) return s;
  }
  throw new Error("ไม่พบ checkpoint ก่อน b");
}

const beforeReplay = await snapshotBeforeB(replayCfg);
const replayed = await graph.invoke(null, beforeReplay.config);

const beforeFork = await snapshotBeforeB(forkCfg);
// 👉 ข้อ 1 (fork) แก้ State ที่จุดนั้นให้มี log เพิ่ม "X" ได้ config ของเส้นใหม่: const forked = await graph.updateState(beforeFork.config, { log: "X" })
//        แล้วรันต่อ: await graph.invoke(null, forked) ได้ state สุดท้าย
// แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
//   const forked = await graph.updateState(beforeFork.config, { log: "X" });
//   const forkedResult = await graph.invoke(null, forked);
const forkedResult: { log: string[] } = todo(1);
console.log({ replayed: replayed.log, forked: forkedResult.log });












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("replay: node b และ c ทำงานซ้ำจากจุดเดิม ได้ log a,b,c", replayed.log.join("") === "abc", "invoke(null, snapshot.config)");
check("fork: log มี X แทรกระหว่าง a กับ b", forkedResult.log.join("") === "aXbc", "updateState ที่ snapshot แล้ว invoke(null, config ใหม่)");

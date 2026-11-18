import { Command, MemorySaver, entrypoint, getPreviousState, interrupt, task, getWriter } from "@langchain/langgraph";
const cp = new MemorySaver();
const cfg = { configurable: { thread_id: "t1" } };
// 1) previous state + entrypoint.final
const counter = entrypoint({ name: "counter", checkpointer: cp }, async (inc: number) => {
  const prev = getPreviousState<number>() ?? 0;
  const next = prev + inc;
  return entrypoint.final({ value: next, save: next });
});
console.log(await counter.invoke(5, cfg), await counter.invoke(2, cfg), await counter.invoke(1, { configurable: { thread_id: "other" } }));

// 2) task runs once across interrupt/resume
let runs = { a: 0, b: 0 };
const ta = task("a", async (x: number) => { runs.a++; return x + 1; });
const tb = task("b", async (x: number) => { runs.b++; return x * 10; });
const wf = entrypoint({ name: "wf", checkpointer: new MemorySaver() }, async (x: number) => {
  const a = await ta(x);
  const ok = interrupt({ ask: "ต่อไหม", a });
  if (!ok) return "ยกเลิก";
  return await tb(a);
});
const c2 = { configurable: { thread_id: "w" } };
const r1 = await wf.invoke(1, c2); console.log("r1", JSON.stringify(r1), runs);
const r2 = await wf.invoke(new Command({ resume: true }), c2); console.log("r2", r2, runs);

// 3) streaming modes + custom writer
const wf3 = entrypoint({ name: "wf3" }, async (x: number) => {
  const w = getWriter(); w({ progress: "เริ่ม" });
  const a = await ta(x); w({ progress: "ครึ่งทาง" });
  return a;
});
for await (const c of await wf3.stream(1, { streamMode: ["custom", "updates"] })) console.log("S", JSON.stringify(c));

// 4) task retry
let tries = 0;
const flaky = task({ name: "flaky", retry: { maxAttempts: 3, initialInterval: 1 } } as any, async () => { if (++tries < 3) throw new Error("ล้ม"); return "ok"; });
const wf4 = entrypoint({ name: "wf4" }, async (_n: number) => await flaky());
console.log(await wf4.invoke(0 as never), "tries", tries);

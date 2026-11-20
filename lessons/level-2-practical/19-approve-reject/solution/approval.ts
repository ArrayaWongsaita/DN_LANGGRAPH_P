// รันด้วย pnpm lesson 2-19
import { Command, END, START, MemorySaver, StateGraph, StateSchema, interrupt } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

const State = new StateSchema({
  action: z.string(),
  approved: z.boolean().default(false),
  result: z.string().default(""),
});

const graph = new StateGraph(State)
  .addNode("request", (state) => {
    const answer: unknown = interrupt({ question: "อนุมัติไหม?", action: state.action });
    return { approved: answer === true };
  })
  .addNode("execute", (state) => ({ result: `เผยแพร่แล้ว: ${state.action}` }))
  .addNode("cancelled", (state) => ({ result: `ยกเลิก: ${state.action}` }))
  .addEdge(START, "request")
  .addConditionalEdges(
    "request",
    (state) => state.approved ? "execute" : "cancelled",
    ["execute", "cancelled"],
  )
  .addEdge("execute", END)
  .addEdge("cancelled", END)
  .compile({ checkpointer: new MemorySaver() });

const requests: unknown[] = [];
const results: string[] = [];

for (const [threadId, answer] of [["approve", true], ["reject", false]] as const) {
  const config = { configurable: { thread_id: threadId } };
  await graph.invoke({ action: "รายงานประจำเดือน" }, config);
  const snapshot = await graph.getState(config);
  const request: unknown = snapshot.tasks[0]?.interrupts[0]?.value;

  const finished = await graph.invoke(new Command({ resume: answer }), config);
  console.log(JSON.stringify({ answer, request, result: finished.result }));
  requests.push(request);
  results.push(finished.result);
}

// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
check("อ่านคำถามของทั้งสอง thread ได้", requests.every((request) =>
  JSON.stringify(request) === JSON.stringify({ question: "อนุมัติไหม?", action: "รายงานประจำเดือน" })));
check("ตอบ true ไปที่ execute", results[0] === "เผยแพร่แล้ว: รายงานประจำเดือน");
check("ตอบ false ไปที่ cancelled", results[1] === "ยกเลิก: รายงานประจำเดือน");

// รันด้วย pnpm lesson 2-20
import { Command, END, START, MemorySaver, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

const State = new StateSchema({
  topic: z.string(),
  draft: z.string().default(""),
  final: z.string().default(""),
});

const graph = new StateGraph(State)
  .addNode("write", (state) => ({ draft: `เรียนทุกท่าน ขอแจ้ง${state.topic}` }))
  .addNode("review", (state) => {
    const edited: unknown = interrupt({ draft: state.draft });
    return { final: typeof edited === "string" && edited.length > 0 ? edited : state.draft };
  })
  .addEdge(START, "write")
  .addEdge("write", "review")
  .addEdge("review", END)
  .compile({ checkpointer: new MemorySaver() });

const outcomes: { request: unknown; draft: string; final: string }[] = [];
const edited = "เรียนทุกท่าน ขอเลื่อนประชุมเป็นวันอังคาร";

for (const [threadId, answer] of [["edit", edited], ["keep", ""]] as const) {
  const config = { configurable: { thread_id: threadId } };
  const started = await graph.invoke({ topic: "นัดประชุมวันจันทร์" }, config);
  const request = isInterrupted(started) ? started.__interrupt__[0]?.value : undefined;

  const finished = await graph.invoke(new Command({ resume: answer }), config);
  console.log(JSON.stringify({ answer, request, final: finished.final }));
  outcomes.push({ request, draft: finished.draft, final: finished.final });
}












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("หยุดพร้อมร่างให้ตรวจทั้งสองรอบ", outcomes.every(({ request, draft }) =>
  draft.length > 0 && JSON.stringify(request) === JSON.stringify({ draft })));
check("ส่งฉบับแก้แล้วได้ฉบับนั้นใน final", outcomes[0].final === edited);
check("ส่งสตริงว่างแล้ว final ใช้ร่าง", outcomes[1].final === outcomes[1].draft);

import { HumanMessage, RemoveMessage, SystemMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";
import { fakeLLM } from "@src/fakeLLM";
import { fakeToolLLM } from "@src/fakeToolLLM";

const State = new StateSchema({ messages: MessagesValue, summary: z.string().default("") });
const MAX_MESSAGES = 4;
const KEEP_LAST = 2;

const chatModel = fakeToolLLM(["รับทราบ", "รับทราบ", "รับทราบ", "คุณชื่อมาลี"]);
const summaryModel = fakeLLM(["ผู้ใช้ชื่อมาลีและชอบแมว"]);

const graph = new StateGraph(State)
  .addNode("chat", async (state) => {
    const context = state.summary ? [new SystemMessage(state.summary)] : [];
    const reply = await chatModel.invoke([...context, ...state.messages]);
    return { messages: [reply] };
  })
  .addNode("summarize", async (state) => {
    const context = state.summary ? [new SystemMessage(state.summary)] : [];
    const result = await summaryModel.invoke([
      ...context,
      ...state.messages,
      new HumanMessage("สรุปบทสนทนาสั้น ๆ"),
    ]);

    const oldCount = Math.max(0, state.messages.length - KEEP_LAST);
    const removals = state.messages.slice(0, oldCount).map((m) => new RemoveMessage({ id: m.id! }));
    return { summary: result.text, messages: removals };
  })
  .addEdge(START, "chat")
  .addConditionalEdges("chat", (state) => state.messages.length > MAX_MESSAGES ? "summarize" : END, ["summarize", END])
  .addEdge("summarize", END)
  .compile({ checkpointer: new MemorySaver() });

const config = { configurable: { thread_id: "mali" } };
const rounds: { messages: number; summary: string }[] = [];

for (const text of ["ฉันชื่อมาลีและชอบแมว", "ฉันอยู่เชียงใหม่", "ฉันเป็นครู", "ฉันชื่ออะไร"]) {
  const result = await graph.invoke({ messages: [new HumanMessage(text)] }, config);
  rounds.push({ messages: result.messages.length, summary: result.summary });
}

console.log(JSON.stringify(rounds, null, 2));
console.log("ข้อความแรกที่ส่งให้โมเดลรอบ 4", chatModel.calls.at(-1)?.[0].text);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("สรุปเมื่อต้องเก็บมากกว่า 4 ข้อความ", rounds[1].summary === "" && rounds[2].summary.length > 0);
check("เก็บ 2 ข้อความล่าสุดหลังสรุป", rounds[2].messages === KEEP_LAST);
check("รอบถัดไปได้รับสรุปใน SystemMessage", chatModel.calls.at(-1)?.[0].type === "system" && chatModel.calls.at(-1)?.[0].text === rounds[2].summary);

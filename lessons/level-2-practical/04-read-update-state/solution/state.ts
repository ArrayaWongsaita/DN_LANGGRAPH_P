import { HumanMessage, RemoveMessage } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-04
// ความจำใน checkpointer "อ่านได้และแก้ได้": getState อ่าน, updateState แก้ (เช่นลบข้อความที่ไม่อยากให้ LLM เห็น)
const State = new StateSchema({ messages: MessagesValue });

const graph = new StateGraph(State)
  .addNode("chat", async (state) => ({ messages: [await llm.invoke(state.messages)] }))
  .addEdge(START, "chat")
  .addEdge("chat", END)
  .compile({ checkpointer: new MemorySaver() });

const config = { configurable: { thread_id: "t" } };
for (const text of ["รหัสลับของฉันคือ 1234", "ฉันชอบแมว"]) {
  await graph.invoke({ messages: [new HumanMessage(text)] }, config);
}

const state = await graph.getState(config);
// ข้อ 1: เอาข้อความทั้งหมดของ thread นี้จาก state.values.messages
//        (thread ที่ยังไม่เคยคุย messages จะเป็น undefined ให้ใช้ [] แทน: ?? [])
const history: BaseMessage[] = state.values.messages ?? [];
console.log("ก่อนลบ:", history.map((m) => m.text));

// ข้อ 2: ลบข้อความแรกสุด (รหัสลับ) ออกจาก State
await graph.updateState(config, { messages: [new RemoveMessage({ id: history[0].id! })] });

const after: BaseMessage[] = (await graph.getState(config)).values.messages ?? [];
console.log("หลังลบ:", after.map((m) => m.text));
const reply = await graph.invoke({ messages: [new HumanMessage("รหัสลับของฉันคืออะไร")] }, config);
const emptyThread: BaseMessage[] = (await graph.getState({ configurable: { thread_id: "ใหม่" } })).values.messages ?? [];
console.log("LLM ตอบเมื่อรหัสถูกลบแล้ว:", reply.messages[reply.messages.length - 1].text);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("อ่านประวัติได้ครบ 4 ข้อความ (สองรอบ)", history.length === 4, "ใช้ state.values.messages");
check("thread ที่ยังไม่เคยคุยได้รายการว่าง", emptyThread.length === 0);
check("ลบแล้วเหลือ 3 ข้อความ และข้อความรหัสลับหายไป", after.length === 3 && !after.some((m) => m.text.includes("1234") && m.type === "human"), "ใช้ updateState กับ RemoveMessage");
check("LLM ไม่รู้รหัสที่ถูกลบแล้ว", !reply.messages[reply.messages.length - 1].text.includes("1234"), "ข้อความที่ลบต้องไม่ถูกส่งให้ LLM อีก");

import { HumanMessage, RemoveMessage, SystemMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-06
// ประวัติยาวเกินไป: ให้ LLM "สรุป" เนื้อหาเก่าเก็บไว้ แล้วลบข้อความเก่าทิ้ง เหลือแต่ข้อความล่าสุด
const State = new StateSchema({
  messages: MessagesValue,
  summary: z.string().default(""),
});

const MAX_MESSAGES = 4; // ยาวกว่านี้ให้สรุป
const KEEP_LAST = 2; // เก็บข้อความล่าสุดไว้กี่ข้อความหลังสรุป

const graph = new StateGraph(State)
  .addNode("chat", async (state) => {
    const head = state.summary ? [new SystemMessage(`สรุปบทสนทนาก่อนหน้า: ${state.summary}`)] : [];
    return { messages: [await llm.invoke([...head, ...state.messages])] };
  })
  .addNode("summarize", async (state) => {
    const head = state.summary ? [new SystemMessage(`สรุปบทสนทนาก่อนหน้า: ${state.summary}`)] : [];
    // ข้อ 2: ขอให้ llm สรุปบทสนทนาใน state.messages แล้วเก็บ .text ไว้ในตัวแปร summaryText
    const reply = await llm.invoke([...head, ...state.messages, new HumanMessage("สรุปบทสนทนาข้างต้นสั้น ๆ")]);
    const summaryText = reply.text;
    // ข้อ 3: สร้าง RemoveMessage ให้ทุกข้อความ ยกเว้น KEEP_LAST ข้อความสุดท้าย
    const removals = state.messages.slice(0, -KEEP_LAST).map((m) => new RemoveMessage({ id: m.id! }));
    return { summary: summaryText, messages: removals };
  })
  .addEdge(START, "chat")
  .addConditionalEdges(
    "chat",
    (state) => {
      // ข้อ 1: คืน "summarize" ถ้า state.messages ยาวกว่า MAX_MESSAGES ไม่เช่นนั้นคืน END
      return state.messages.length > MAX_MESSAGES ? "summarize" : END;
    },
    ["summarize", END],
  )
  .addEdge("summarize", END)
  .compile({ checkpointer: new MemorySaver() });

const config = { configurable: { thread_id: "t" } };
const snapshots: { messages: number; summary: string }[] = [];
for (const text of ["ฉันชื่อมาลี ชอบแมว", "ฉันอยู่เชียงใหม่", "ฉันทำงานเป็นครู", "ฉันชื่ออะไร"]) {
  const result = await graph.invoke({ messages: [new HumanMessage(text)] }, config);
  snapshots.push({ messages: result.messages.length, summary: result.summary });
  console.log(`หลังถาม "${text}": ข้อความใน State = ${result.messages.length}, สรุป = "${result.summary}"`);
}
const lastAnswer = (await graph.getState(config)).values.messages.at(-1)?.text ?? "";

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("สองรอบแรกยังไม่ยาวเกินเกณฑ์: ไม่สรุป และเก็บครบ 4 ข้อความ", snapshots[1].messages === 4 && snapshots[1].summary === "", "เงื่อนไข: ยาวกว่า MAX_MESSAGES จึงสรุป");
check("รอบที่ 3 ยาวเกินเกณฑ์: มีสรุป และเหลือ KEEP_LAST ข้อความ", snapshots[2].summary.length > 0 && snapshots[2].messages === KEEP_LAST, "สรุปแล้วต้องลบข้อความเก่า");
check("หลังสรุป LLM ยังจำชื่อ 'มาลี' ได้จากสรุป", lastAnswer.includes("มาลี"), "รอบถัดไปต้องส่งสรุปนำหน้า (node chat ทำให้แล้ว)");

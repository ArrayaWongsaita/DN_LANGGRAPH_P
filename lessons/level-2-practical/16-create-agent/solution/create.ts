import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createAgent } from "langchain";
import { makeAddTool, makeWeatherTool } from "@src/sampleTools";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-16
// createAgent = ทางลัดที่ประกอบ ReAct agent (agent + tools + loop) ให้ในบรรทัดเดียว (บท 2-11 คือสิ่งที่มันทำให้ข้างใน)
const agent = createAgent({
  // ข้อ 1: ใส่ model: llm
  model: llm,
  tools: [makeAddTool(), makeWeatherTool()],
  // ข้อ 2: ใส่ systemPrompt: "คุณคือผู้ช่วยที่ตอบสั้น กระชับ"
  systemPrompt: "คุณคือผู้ช่วยที่ตอบสั้น กระชับ",
  // ข้อ 3: ใส่ checkpointer: new MemorySaver() เพื่อให้จำบทสนทนาได้
  checkpointer: new MemorySaver(),
});

const config = { configurable: { thread_id: "me" } };
const replies: string[] = [];
let result;
for (const text of ["ฉันชื่อมาลี", "ฉันชื่ออะไร", "อากาศที่เชียงใหม่เป็นอย่างไร"]) {
  result = await agent.invoke({ messages: [new HumanMessage(text)] }, config);
  replies.push(result.messages[result.messages.length - 1].text);
}
console.log(replies);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("agent จำชื่อ 'มาลี' ได้ (มี checkpointer)", replies[1].includes("มาลี"), "ใส่ checkpointer และส่ง thread_id เดิม");
check("agent เรียก tool getWeather ได้เอง", result!.messages.some((m) => m.type === "tool" && m.text.includes("22")), "ส่ง tools ให้ createAgent");
check("ได้คำตอบสุดท้ายเป็นข้อความ", replies[2].length > 0);

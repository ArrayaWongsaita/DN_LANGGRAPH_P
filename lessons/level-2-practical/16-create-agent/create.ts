// รันด้วย pnpm lesson 2-16
import { HumanMessage, type BaseMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createAgent } from "langchain";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { makeWeatherTool } from "@src/sampleTools";
import { check } from "@src/check";
import { todo } from "@src/todo";

const model = fakeToolLLM([
  "สวัสดีมาลี",
  { toolCalls: [{ name: "getWeather", args: { city: "เชียงใหม่" } }] },
  "เชียงใหม่ 22 องศา",
]);
const weather = makeWeatherTool();

// 👉 ข้อ 1 สร้าง agent ด้วย model, tools: [weather], systemPrompt: "ตอบสั้น ๆ" และ MemorySaver
// แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
//   const agent = createAgent({
//     model,
//     tools: [weather],
//     systemPrompt: "ตอบสั้น ๆ",
//     checkpointer: new MemorySaver(),
//   });
const agent: ReturnType<typeof createAgent> = todo(1);

const config = { configurable: { thread_id: "mali" } };
const first: { messages: BaseMessage[] } = await agent.invoke({ messages: [new HumanMessage("ฉันชื่อมาลี")] }, config);
console.log(JSON.stringify(first.messages.map((message) => message.type)));

const second: { messages: BaseMessage[] } = await agent.invoke({ messages: [new HumanMessage("ขออากาศเชียงใหม่")] }, config);
console.log(JSON.stringify(second.messages.map((message) => message.type)));
console.log(JSON.stringify(second.messages.filter((message) => message.type === "tool").map((message) => message.text)));












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("โมเดลได้รับ systemPrompt", model.calls[0]?.[0]?.type === "system" && model.calls[0]?.[0]?.text === "ตอบสั้น ๆ");
check("thread เดิมโหลดข้อความของมาลี", second.messages[0]?.text === "ฉันชื่อมาลี");
check("agent เรียก tool แล้วตอบ", second.messages.some((message) => message.type === "tool" && message.text === "อากาศเย็น 22 องศา") &&
  second.messages.at(-1)?.type === "ai");

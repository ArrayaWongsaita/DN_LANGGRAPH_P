// ใช้ AIMessage ตัวอย่างแบบออฟไลน์ ใช้โมเดลจาก .env เมื่อกำหนด LESSON_LIVE=1
import { AIMessage } from "@langchain/core/messages";
import { check } from "@src/check";
import { getLLM } from "@src/llm";

function totalTokens(message: AIMessage): number {
  return message.usage_metadata?.total_tokens ?? 0;
}

const replies = [
  new AIMessage({
    content: "โมจิ",
    usage_metadata: { input_tokens: 12, output_tokens: 5, total_tokens: 17 },
  }),
  new AIMessage("นิล"),
  new AIMessage({
    content: "ทองม้วน",
    usage_metadata: { input_tokens: 11, output_tokens: 4, total_tokens: 15 },
  }),
];

const perCall = replies.map(totalTokens);
const knownTotal = perCall.reduce((sum, count) => sum + count, 0);
console.log(JSON.stringify({ perCall, knownTotal }));

if (process.env.LESSON_LIVE === "1") {
  const prompt = "ตั้งชื่อแมวหนึ่งชื่อ ตอบเฉพาะชื่อ";
  let liveKnownTotal = 0;
  for (const temperature of [0, 0.8]) {
    const model = getLLM({ temperature });
    const reply = await model.invoke(prompt);
    const tokens = totalTokens(reply);
    liveKnownTotal += tokens;
    console.log(JSON.stringify({ temperature, text: reply.text, usage: reply.usage_metadata ?? null }));
  }
  console.log(JSON.stringify({ liveKnownTotal }));
}












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("อ่านยอดที่รายงานและใช้ 0 เมื่อไม่มีข้อมูล", perCall.join(",") === "17,0,15", "อ่าน usage_metadata?.total_tokens แล้วใช้ ?? 0");

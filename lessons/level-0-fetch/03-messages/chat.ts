import { todo } from "@src/todo";
import { describeProvider } from "@src/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 0-03  (ต้องตั้ง key ใน .env)
// LLM "จำอะไรไม่ได้เลย" ทุกครั้งที่เรียกคือเริ่มใหม่ ความจำของแชตบอทคือการส่งบทสนทนาทั้งหมดไปให้ใหม่ทุกครั้ง
const { model, chatUrl, apiKey } = describeProvider();

interface Turn {
  role: "system" | "user" | "assistant";
  content: string;
}

// ส่ง messages ไปให้ LLM แล้วคืนข้อความตอบ (โค้ดคุ้นเคยจากบท 0-01 ให้มาแล้ว)
async function send(messages: Turn[]): Promise<string> {
  const res = await fetch(chatUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages }),
  });
  const data = await res.json();
  return data.choices[0].message.content;
}

const system: Turn = { role: "system", content: "ตอบสั้น ๆ เป็นภาษาไทย" };

// รอบแรก: บอกข้อมูลกับ LLM
const first = "ฉันชื่อมาลี ชอบแมว จำไว้นะ";
const firstAnswer = await send([system, { role: "user", content: first }]);

// 👉 ข้อ 1: สร้างประวัติบทสนทนา (ไม่รวม system) จากรอบแรก: ข้อความ user ที่ถามว่า first ตามด้วยข้อความ assistant ที่ตอบว่า firstAnswer
// แนวทาง: [{ role: "user", content: first }, { role: "assistant", content: firstAnswer }]
const history: Turn[] = todo(1);

const second = "ฉันชื่ออะไร และชอบอะไร";
// 👉 ข้อ 2: สร้าง messages สำหรับถามคำถาม second โดยให้ LLM "จำ" ได้: system, ประวัติทั้งหมด, แล้วปิดท้ายด้วยคำถามใหม่ (role "user")
// แนวทาง: [system, ...history, { role: "user", content: second }]
const messages: Turn[] = todo(2);

const withHistory = await send(messages);
const noHistory = await send([system, { role: "user", content: second }]);
console.log("มีประวัติ:   ", withHistory);
console.log("ไม่มีประวัติ:", noHistory);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ประวัติมี 2 ข้อความ (user แล้ว assistant)", history.length === 2 && history[0].role === "user" && history[1].role === "assistant", "ดูรูปแบบใน README");
check("messages เรียง system, ประวัติ, คำถามใหม่ (4 ข้อความ)", messages.length === 4 && messages[0].role === "system" && messages[3].content === second, "[system, ...history, คำถามใหม่]");
check("มีประวัติ: LLM จำชื่อ 'มาลี' ได้", withHistory.includes("มาลี"), "ส่งประวัติทั้งหมดไปด้วยทุกครั้ง");
check("ไม่มีประวัติ: LLM ไม่รู้จักชื่อ (เริ่มใหม่ทุกครั้ง)", !noHistory.includes("มาลี"));

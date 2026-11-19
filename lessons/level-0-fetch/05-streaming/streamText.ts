import { todo } from "@src/todo";
import { describeProvider } from "@src/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 0-05  (ต้องตั้ง key ใน .env)
// ขอคำตอบแบบ stream (SSE): เซิร์ฟเวอร์ส่งทีละชิ้น แต่ละ event คือบรรทัด "data: {json}" ปิดท้ายด้วย "data: [DONE]"
const { model, chatUrl, apiKey } = describeProvider();

const res = await fetch(chatUrl, {
  method: "POST",
  headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model, stream: true, messages: [{ role: "user", content: "เล่านิทานสั้น ๆ สามประโยค" }] }),
});

const reader = res.body!.getReader();
const decoder = new TextDecoder();
let buffer = "";
const pieces: string[] = []; // ข้อความที่ได้ทีละชิ้น

for (;;) {
  const { done, value } = await reader.read();
  if (done) break;

  // 👉 ข้อ 1: เอาข้อมูลที่เพิ่งอ่านได้ต่อท้าย buffer แล้วแยกเป็นบรรทัด
  //   ข้อควรระวัง: การอ่านจากเครือข่าย "ไม่ตรงกับขอบเขตของบรรทัด" บรรทัดสุดท้ายอาจยังมาไม่ครบ
  //   จึงต้องเก็บบรรทัดสุดท้ายที่ยังไม่ครบไว้ใน buffer ไปต่อกับการอ่านรอบหน้า
  // แนวทาง: buffer += decoder.decode(value, { stream: true });
  //         const lines = buffer.split("\n");
  //         buffer = lines.pop() ?? "";   // บรรทัดสุดท้าย (อาจไม่ครบ) เก็บไว้
  const lines: string[] = todo(1);

  for (const line of lines) {
    // 👉 ข้อ 2: จัดการทีละบรรทัดที่ครบแล้ว
    //   - ข้ามบรรทัดที่ไม่ขึ้นต้นด้วย "data: " หรือเป็น "data: [DONE]" (continue)
    //   - นอกนั้นตัด "data: " ออกแล้ว JSON.parse ข้อความอยู่ที่ choices[0].delta.content
    //     ถ้าเป็น string และไม่ว่าง ให้ pieces.push(ข้อความ) และ process.stdout.write(ข้อความ) เพื่อให้ตัวอักษรทยอยขึ้นจอ
    //     (บาง chunk ไม่มี content เช่น chunk ความคิดของโมเดล)
    todo(2);
  }
}
process.stdout.write("\n");

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ได้ข้อความมาเป็นชิ้น ๆ หลายชิ้น (ไม่ใช่ก้อนเดียว)", pieces.length > 1, "วน reader.read() แล้ว push ทีละ chunk");
check("รวมแล้วเป็นเรื่องเล่าที่ไม่ว่าง", pieces.join("").trim().length > 10);
check("ไม่มีเศษ 'data:' หลุดมาในข้อความ", !pieces.join("").includes("data:"), "ตัด 'data: ' ออกก่อน JSON.parse");

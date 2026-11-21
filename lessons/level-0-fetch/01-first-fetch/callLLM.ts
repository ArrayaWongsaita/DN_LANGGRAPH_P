import { todo } from "@src/todo";
import { check } from "@src/check";
import { describeProvider } from "@src/llm";

// ใช้ API key ของโมเดลที่ตั้งใน .env
const { model, chatUrl, apiKey } = describeProvider();
const question = "ทักทายคนที่เพิ่งเริ่มเรียนเขียนแอป LLM หนึ่งประโยค";
const messages = [{ role: "user", content: question }];

// 👉 ข้อ 1 ส่ง POST ด้วย fetch ไปที่ chatUrl แล้วรอรับ Response
// ใส่ Authorization แบบ Bearer, Content-Type แบบ JSON และแปลง { model, messages } ด้วย JSON.stringify
// แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
//   const response = await fetch(chatUrl, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${apiKey}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ model, messages }),
//   });
const response: Response = todo(1);

console.log(`HTTP ${response.status}`);
if (!response.ok) throw new Error(`HTTP ${response.status} ให้ลองดูวิธีจัดการในบท 0-02`);

const data = await response.json();
const answer: unknown = data.choices?.[0]?.message?.content;
console.log(answer);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ส่งคำขอสำเร็จ", response.ok);
check("ได้คำตอบเป็นข้อความที่มีเนื้อหา", typeof answer === "string" && answer.trim().length > 0);

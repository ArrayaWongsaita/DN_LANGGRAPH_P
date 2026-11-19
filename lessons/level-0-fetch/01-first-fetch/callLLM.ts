import { todo } from "@src/todo";
import { describeProvider } from "@src/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 0-01  (ต้องตั้ง key ใน .env ก่อน ดูวิธีใน README)
// เรียก LLM ด้วย HTTP ตรง ๆ ไม่ผ่านไลบรารีใด
// describeProvider() โหลดและตรวจ .env ให้ แล้วบอก URL / โมเดล / key ที่ใช้อยู่ (ถ้ายังไม่ตั้ง key จะได้ข้อความไทยบอกว่าต้องตั้งอะไร)
const { model, chatUrl, apiKey } = describeProvider();
const question = "ทักทายคนที่เพิ่งเริ่มเรียนเขียนแอป LLM หนึ่งประโยค";

// 👉 ข้อ 1: ส่ง HTTP request แล้ว "รอ" ผล ด้วย fetch(chatUrl, { ... })
//   - method: "POST"
//   - headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }
//   - body: ข้อความ JSON ที่มี model และ messages (array ที่มีข้อความเดียว: { role: "user", content: question })
// แนวทาง: const res = await fetch(chatUrl, {
//           method: "POST",
//           headers: { ... },
//           body: JSON.stringify({ model, messages: [{ role: "user", content: question }] }),
//         });
const res: Response = todo(1);

// 👉 ข้อ 2: อ่านผลลัพธ์เป็น JSON แล้วเอาข้อความคำตอบ ซึ่งอยู่ที่ choices[0].message.content
// แนวทาง: const data = await res.json();  แล้ว data.choices[0].message.content
const answer: string = todo(2);
console.log(answer);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("เซิร์ฟเวอร์ตอบสำเร็จ (HTTP 200)", res.status === 200, "ตรวจ key ใน .env และดูข้อความ error ที่พิมพ์ไว้");
check("ได้คำตอบเป็นข้อความที่ไม่ว่าง", typeof answer === "string" && answer.trim().length > 0, "คำตอบอยู่ที่ data.choices[0].message.content (ลืม await หรือเปล่า?)");

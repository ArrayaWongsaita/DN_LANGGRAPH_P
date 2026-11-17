import { todo } from "@src/todo";

// Ask = ฟังก์ชันที่รับคำสั่งเป็นข้อความ แล้วคืนคำตอบของ LLM เป็นข้อความ
// (ของจริงสร้างจาก fetch ตามบท 0-01 ใน run.ts ตอนตรวจงานเราส่ง ask ปลอมเข้ามา)
export type Ask = (prompt: string) => Promise<string>;

export type Category = "greeting" | "question";

// ให้ LLM จัดประเภทข้อความของผู้ใช้
export async function classify(ask: Ask, question: string): Promise<Category> {
  // 👉 ข้อ 1: ถามด้วยคำสั่งที่มี question ให้ตอบคำเดียวว่า greeting หรือ question
  //          แล้วคืน "greeting" ถ้าคำตอบ (ตัดช่องว่าง แปลงเป็นตัวพิมพ์เล็ก) เท่ากับ "greeting" นอกนั้นคืน "question"
  // แนวทาง: const raw = await ask(`จัดประเภทข้อความนี้ ตอบคำเดียว: greeting หรือ question\nข้อความ: ${question}`);
  //         return raw.trim().toLowerCase() === "greeting" ? "greeting" : "question";
  return todo(1);
}

// ผู้ช่วย: จัดประเภทก่อน แล้วเลือกทางตอบ
//   greeting -> ตอบสำเร็จรูป (ไม่เปลืองการเรียก LLM)
//   question -> ให้ LLM ตอบร่างแรก แล้วปรับปรุงวนไปเรื่อย ๆ จนตอบ "OK" หรือครบ maxRounds รอบ
export async function runAssistant(
  ask: Ask,
  question: string,
  maxRounds = 3,
): Promise<{ category: Category; answer: string; rounds: number }> {
  const category = await classify(ask, question);

  // 👉 ข้อ 2: ถ้าเป็น greeting ให้คืน { category, answer: "สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ", rounds: 0 } ทันที
  todo(2);

  let answer = await ask(question); // ร่างแรก
  let rounds = 0;

  // 👉 ข้อ 3: วนปรับปรุงคำตอบ ไม่เกิน maxRounds รอบ
  //   แต่ละรอบ: rounds เพิ่ม 1 แล้วถาม ask ว่า `ปรับปรุงคำตอบนี้ให้ดีขึ้น ถ้าดีแล้วตอบว่า OK เท่านั้น:\n${answer}`
  //   ถ้าผลที่ได้ (ตัดช่องว่าง) เท่ากับ "OK" ให้หยุดวน และคงคำตอบเดิม
  //   นอกนั้นให้ใช้ผลที่ได้เป็นคำตอบใหม่แล้ววนต่อ
  // แนวทาง: while (rounds < maxRounds) { rounds++; const improved = await ask(...); if (improved.trim() === "OK") break; answer = improved; }
  todo(3);

  return { category, answer, rounds };
}

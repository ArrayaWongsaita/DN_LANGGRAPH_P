import { todo } from "@src/todo";
import { describeProvider } from "@src/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 0-06  (ต้องตั้ง key ใน .env)
// ผู้ช่วยแบบไม่มีเฟรมเวิร์ก: จัดประเภทข้อความก่อน แล้วเลือกทางตอบ
//   greeting -> ตอบสำเร็จรูป (ไม่เปลืองการเรียก LLM)
//   question -> ให้ LLM ตอบร่างแรก แล้วปรับปรุงวนไปเรื่อย ๆ จนตอบ "OK" หรือครบ maxRounds รอบ
const { model, chatUrl, apiKey } = describeProvider();

// ask = ถามคำสั่งเป็นข้อความ แล้วได้คำตอบของ LLM เป็นข้อความ (หน้าตาเหมือนบท 0-01 ย่อให้เหลือเท่าที่ใช้)
async function ask(prompt: string): Promise<string> {
  const res = await fetch(chatUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return (await res.json()).choices[0].message.content;
}

type Category = "greeting" | "question";
const maxRounds = 3;
const results: { question: string; category: Category; answer: string; rounds: number }[] = [];

for (const question of ["สวัสดีครับ", "ทำไมท้องฟ้าถึงเป็นสีฟ้า"]) {
  // 👉 ข้อ 1: ถามด้วยคำสั่งที่มี question ให้ตอบคำเดียวว่า greeting หรือ question
  //          แล้วได้ category = "greeting" ถ้าคำตอบ (ตัดช่องว่าง แปลงเป็นตัวพิมพ์เล็ก) เท่ากับ "greeting" นอกนั้น "question"
  // แนวทาง: const raw = await ask(`จัดประเภทข้อความนี้ ตอบคำเดียว: greeting หรือ question\nข้อความ: ${question}`);
  //         const category: Category = raw.trim().toLowerCase() === "greeting" ? "greeting" : "question";
  const category: Category = todo(1);

  let answer = "";
  let rounds = 0;
  if (category === "greeting") {
    // 👉 ข้อ 2: ถ้าเป็น greeting ตอบสำเร็จรูปว่า "สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ" (answer = ...) ไม่ต้องเรียก LLM อีก
    todo(2);
  } else {
    answer = await ask(question); // ร่างแรก
    // 👉 ข้อ 3: วนปรับปรุงคำตอบ ไม่เกิน maxRounds รอบ
    //   แต่ละรอบ: rounds เพิ่ม 1 แล้วถาม ask ว่า `ปรับปรุงคำตอบนี้ให้ดีขึ้น ตอบด้วยคำตอบที่ปรับปรุงแล้วเท่านั้น แต่ถ้าดีอยู่แล้วให้ตอบคำว่า OK คำเดียว ห้ามใส่ OK ปนในคำตอบ:\n${answer}` (คำสั่งต้องบอกรูปแบบให้ชัด เพราะ LLM ชอบตอบเกินจากที่ขอ)
    //   ถ้าผลที่ได้ (ตัดช่องว่าง) เท่ากับ "OK" ให้หยุดวน และคงคำตอบเดิม
    //   นอกนั้นให้ใช้ผลที่ได้เป็นคำตอบใหม่แล้ววนต่อ
    // แนวทาง: while (rounds < maxRounds) { rounds++; const improved = await ask(...); if (improved.trim() === "OK") break; answer = improved; }
    todo(3);
  }
  results.push({ question, category, answer, rounds });
  console.log(`[${category}, ปรับปรุง ${rounds} รอบ] ${question}\n   -> ${answer.slice(0, 80)}`);
}

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
const [hello, why] = results;
check("ทักทายถูกจัดเป็น greeting", hello.category === "greeting", "ดูคำสั่งจัดประเภทใน ข้อ 1");
check("ทักทายตอบสำเร็จรูป ไม่วนปรับปรุง", hello.answer === "สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ" && hello.rounds === 0, "ข้อ 2");
check("คำถามถูกจัดเป็น question", why.category === "question");
check(`คำถามได้คำตอบ และปรับปรุงอย่างน้อย 1 รอบและไม่เกิน ${maxRounds} รอบ`, why.answer.trim().length > 0 && why.answer.trim() !== "OK" && why.rounds >= 1 && why.rounds <= maxRounds, "ข้อ 3: วนไม่เกิน maxRounds");

import { todo } from "@src/todo";
import { check } from "@src/check";
import { describeProvider } from "@src/llm";

// ใช้ API key ของโมเดลที่ตั้งใน .env
const { model, chatUrl, apiKey } = describeProvider();
let callCount = 0;

async function ask(prompt: string): Promise<string> {
  callCount += 1;
  const response = await fetch(chatUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data = await response.json();
  const answer: unknown = data.choices?.[0]?.message?.content;
  if (typeof answer !== "string" || !answer.trim()) throw new Error("โมเดลส่งคำตอบว่าง");
  return answer;
}

type Category = "greeting" | "question";
const maxRounds = 3;
const greeting = "สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ";
const results: { category: Category; answer: string; rounds: number; calls: number }[] = [];

for (const question of ["สวัสดีครับ", "ทำไมท้องฟ้าถึงเป็นสีฟ้า"]) {
  const callsBefore = callCount;
  // 👉 ข้อ 1 ใช้ ask จัดประเภทแล้วปรับรูปคำตอบด้วย trim และ toLowerCase
  // ถ้าได้ greeting ให้ใช้หมวด greeting กรณีอื่นให้ใช้ question
  // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
  //   const raw = await ask(`จัดประเภทข้อความนี้ ตอบคำเดียวว่า greeting หรือ question\nข้อความ: ${question}`);
  //   const category: Category = raw.trim().toLowerCase() === "greeting" ? "greeting" : "question";
  const category: Category = todo(1);
  let answer: string;
  let rounds = 0;

  if (category === "greeting") {
    // 👉 ข้อ 2 กำหนด answer เป็นคำตอบสำเร็จรูป greeting
    // แนวทาง (เอา // ออกแล้วแทนที่ todo(2) ได้เลย):
    //   answer = greeting;
    answer = todo(2);
  } else {
    answer = await ask(question);

    // 👉 ข้อ 3 ถามให้ปรับปรุง answer จนถึง maxRounds โดยนับรอบที่ถามทุกครั้ง
    // ถ้าได้ OK หลังตัดช่องว่างให้หยุด ถ้าได้ข้อความอื่นให้แทน answer ก่อนวนรอบถัดไป
    // แนวทาง (เอา // ออกแล้วแทนที่ todo(3) ได้เลย):
    //   while (rounds < maxRounds) {
    //     rounds += 1;
    //     const improved = await ask(`ปรับปรุงคำตอบต่อไปนี้และส่งเฉพาะคำตอบที่ดีขึ้น ถ้าดีอยู่แล้วให้ตอบคำว่า OK เพียงคำเดียว\nคำตอบ: ${answer}`);
    //     if (improved.trim() === "OK") break;
    //     answer = improved;
    //   }
    todo(3);
  }

  const calls = callCount - callsBefore;
  results.push({ category, answer, rounds, calls });
  console.log(`[${category} | ปรับปรุง ${rounds} รอบ | เรียก ${calls} ครั้ง] ${question}`);
  console.log(answer);
}












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
const [hello, why] = results;
check("คำทักทายใช้คำตอบสำเร็จรูปหลังจัดประเภทหนึ่งครั้ง", hello.category === "greeting" && hello.answer === greeting && hello.rounds === 0 && hello.calls === 1);
check("คำถามมีร่างแรกและเรียกปรับปรุงตามจำนวนรอบ", why.category === "question" && why.rounds >= Math.min(1, maxRounds) && why.rounds <= maxRounds && why.calls === 2 + why.rounds);
check("ส่งคำตอบล่าสุดกลับไปให้ผู้ใช้", why.answer.trim().length > 0 && why.answer.trim() !== "OK");

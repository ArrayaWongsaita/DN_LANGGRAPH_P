import { check } from "@src/check";
import { getLLM } from "@src/llm";
import { todo } from "@src/todo";

// ต้องใช้ API key ใน .env และโมเดลที่รองรับการกำหนด temperature
const question = "ตั้งชื่อแมวสีส้มหนึ่งชื่อ ตอบแค่ชื่อเดียว";
const temperatures = [0, 1];
const attempts = 3;
const results: { temperature: number; model: ReturnType<typeof getLLM>; answers: string[] }[] = [];

for (const temperature of temperatures) {
  // 👉 ข้อ 1 ใช้ getLLM สร้างโมเดลด้วย temperature ของรอบนี้
  // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
  //   const model = getLLM({ temperature });
  const model: ReturnType<typeof getLLM> = todo(1);
  const answers: string[] = [];

  for (let i = 0; i < attempts; i++) {
    const reply = await model.invoke(question);
    answers.push(reply.text.trim());
  }

  results.push({ temperature, model, answers });
  console.log(`temperature ${temperature}`, answers, `มี ${new Set(answers).size} ชื่อที่ต่างกัน`);
}












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check(
  "ส่ง temperature ทั้งสองค่าให้โมเดล",
  results.every(({ model, temperature }) => model.getLsParams({}).ls_temperature === temperature),
  "ส่ง temperature ของรอบนี้เข้า getLLM",
);
check(
  "ได้คำตอบทั้งสามรอบของแต่ละค่า",
  results.every(({ answers }) => answers.length === attempts && answers.every(Boolean)),
  "เก็บ reply.text ทุกครั้งที่เรียกโมเดล",
);

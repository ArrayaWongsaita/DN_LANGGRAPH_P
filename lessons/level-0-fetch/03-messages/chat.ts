import { todo } from "@src/todo";
import { check } from "@src/check";
import { describeProvider } from "@src/llm";

type Message = { role: "system" | "user" | "assistant"; content: string };

// โหมดปกติใช้คำตอบจำลอง เปิด LESSON_LIVE=1 เพื่อส่งคำขอจริงด้วย API key ใน .env
const provider = process.env.LESSON_LIVE === "1" ? describeProvider() : undefined;
const system: Message = { role: "system", content: "ตอบสั้น ๆ เป็นภาษาไทย" };
const history: Message[] = [
  { role: "user", content: "ฉันชื่อมาลี ชอบแมว" },
  { role: "assistant", content: "สวัสดีมาลี ฉันจะจำไว้ว่าคุณชอบแมว" },
];
const followUp: Message = { role: "user", content: "ฉันชื่ออะไร และชอบอะไร" };
// 👉 ข้อ 1 เรียง system ตามด้วย ...history แล้วปิดท้ายด้วย followUp
const messages: Message[] = todo(1);

const cases = [
  { label: "มีประวัติ", turns: messages },
  { label: "ไม่มีประวัติ", turns: [system, followUp] },
];
const answers: string[] = [];

for (const { label, turns } of cases) {
  const response = provider
    ? await fetch(provider.chatUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: provider.model, messages: turns }),
      })
    : Response.json({
        choices: [{
          message: {
            content: turns.some((turn) => turn.role === "user" && turn.content === history[0].content)
              ? "คุณชื่อมาลี และชอบแมว"
              : "ฉันยังไม่มีข้อมูลชื่อและสิ่งที่คุณชอบ",
          },
        }],
      });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const answer: string = (await response.json()).choices[0].message.content;
  answers.push(answer);
  console.log(`[${label}] ${turns.map((turn) => turn.role).join(" → ")}`);
  console.log(answer);
}

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
// ─────────────────────────────────────────────────────────────
check(
  "ส่ง system ประวัติทั้งสองข้อความ และคำถามล่าสุดตามลำดับ",
  messages.length === 4 && [system, ...history, followUp].every(
    (expected, index) => messages[index]?.role === expected.role && messages[index]?.content === expected.content,
  ),
  "วาง ...history ไว้ระหว่าง system กับ followUp",
);
check(
  "ทั้งสองคำขอได้คำตอบ",
  answers.length === 2 && answers.every((answer) => typeof answer === "string" && answer.trim().length > 0),
);

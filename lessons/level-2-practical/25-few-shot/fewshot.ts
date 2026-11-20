// ดู prompt แบบออฟไลน์ ใช้โมเดลจากบท 1-02 เมื่อกำหนด LESSON_LIVE=1
import { AIMessage, HumanMessage, SystemMessage, type BaseMessage } from "@langchain/core/messages";
import { check } from "@src/check";
import { todo } from "@src/todo";

const system = "จัดประเภทรีวิว ตอบเพียงคำว่า บวก หรือ ลบ";
const examples = [
  { input: "อาหารอร่อยมาก", output: "บวก" },
  { input: "รอนานจนอาหารเย็น", output: "ลบ" },
];
const review = "พนักงานใส่ใจ ประทับใจมาก";

// 👉 ข้อ 1 แปลงตัวอย่างแต่ละรายการเป็นคู่ HumanMessage(input) แล้ว AIMessage(output)
const exampleMessages: BaseMessage[] = todo(1);
const messages = [new SystemMessage(system), ...exampleMessages, new HumanMessage(review)];

for (const message of messages) {
  console.log(message.type, message.text);
}

if (process.env.LESSON_LIVE === "1") {
  const { llm } = await import("../../level-1-basics/02-llm-config/llm");
  const reply = await llm.invoke(messages);
  console.log("คำตอบจากโมเดล", reply.text.trim());
}

// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
check(
  "ตัวอย่างทุกคู่เรียง human แล้ว ai พร้อมเนื้อหาตรงกัน",
  exampleMessages.length === examples.length * 2 &&
    examples.every(({ input, output }, index) => {
      const [human, ai] = exampleMessages.slice(index * 2, index * 2 + 2);
      return human instanceof HumanMessage && human.text === input && ai instanceof AIMessage && ai.text === output;
    }),
  "ใช้ flatMap สร้างคู่ HumanMessage(input) และ AIMessage(output)",
);

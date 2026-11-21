import { ChatPromptTemplate } from "@langchain/core/prompts";
import { check } from "@src/check";
import { todo } from "@src/todo";

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "แปลข้อความของผู้ใช้เป็นภาษา{language}"],
  ["human", "{text}"],
]);

const input = { language: "อังกฤษ", text: "วันนี้อากาศดีจัง" };
// 👉 ข้อ 1 เติมค่า input ลงในแม่แบบด้วย prompt.formatMessages แล้วรอผลลัพธ์
// แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
//   const messages = await prompt.formatMessages(input);
const messages: Awaited<ReturnType<typeof prompt.formatMessages>> = todo(1);

for (const message of messages) {
  console.log(message.type, message.text);
}












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check(
  "เติม language ในข้อความ system",
  messages[0]?.type === "system" && messages[0].text === `แปลข้อความของผู้ใช้เป็นภาษา${input.language}`,
  "ส่ง input ให้ prompt.formatMessages",
);
check(
  "เติม text ในข้อความ human",
  messages.length === 2 && messages[1].type === "human" && messages[1].text === input.text,
  "ส่งทั้ง language และ text ให้แม่แบบ",
);

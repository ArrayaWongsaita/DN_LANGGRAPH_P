import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { check } from "@src/check";

const system = new SystemMessage("ตอบสั้น ๆ เป็นภาษาไทย");
const history = [new HumanMessage("ฉันชื่อมาลี ชอบแมว"), new AIMessage("ยินดีที่ได้รู้จักค่ะ")];
const question = new HumanMessage("ฉันชื่ออะไร และชอบอะไร");

const messages = [system, ...history, question];
const withoutHistory = [system, question];

console.log("มีประวัติ", messages.map(({ type, text }) => [type, text]));
console.log("ประวัติว่าง", withoutHistory.map(({ type, text }) => [type, text]));

// ส่วนตรวจคำตอบ ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
check(
  "ส่งคำสั่ง ประวัติ และคำถามตามลำดับ",
  messages.length === history.length + 2 &&
    messages[0] === system &&
    history.every((message, i) => messages[i + 1] === message) &&
    messages.at(-1) === question,
  "ใช้ [system, ...history, question]",
);

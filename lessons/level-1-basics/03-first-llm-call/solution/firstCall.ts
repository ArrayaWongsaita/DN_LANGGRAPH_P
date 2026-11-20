import { AIMessage } from "@langchain/core/messages";
import { check } from "@src/check";
import { llm } from "../../02-llm-config/solution/llm";

// ต้องตั้งค่าโมเดลในบท 1-02 และเชื่อมต่ออินเทอร์เน็ต
const question = "ทักทายคนที่เพิ่งเริ่มเรียน LangGraph หนึ่งประโยค";
const reply = await llm.invoke(question);

console.log("คำถาม", question);
console.log("คำตอบ", reply.text);

// ส่วนตรวจคำตอบ ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
check("ได้ข้อความจาก chat model", AIMessage.isInstance(reply), "รอผลจาก await llm.invoke(question)");
check("อ่านคำตอบด้วย reply.text", reply.text.trim().length > 0, "ส่งคำถามที่ขอให้โมเดลตอบเป็นข้อความ");

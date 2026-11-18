import { ChatPromptTemplate } from "@langchain/core/prompts";
import { llm } from "../../02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 07
// แม่แบบข้อความ: ช่องที่เขียนในปีกกา {ชื่อ} จะถูกเติมค่าตอนใช้งาน

// ข้อ 1: สร้างแม่แบบด้วย ChatPromptTemplate.fromMessages มี 2 ข้อความ
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "คุณคือนักแปล แปลข้อความของผู้ใช้เป็นภาษา{language} ตอบเฉพาะคำแปล"],
  ["human", "{text}"],
]);

// ข้อ 2: ต่อแม่แบบเข้ากับ llm เป็นสายเดียว (chain) แล้วเรียกด้วยค่าของช่อง
const chain = prompt.pipe(llm);
const reply = await chain.invoke({ language: "อังกฤษ", text: "วันนี้อากาศดีจัง" });

console.log("อังกฤษ:", reply.text);
// แม่แบบเดียวใช้ซ้ำได้กับภาษาอื่น (ให้มาแล้ว)
console.log("ญี่ปุ่น:", (await chain.invoke({ language: "ญี่ปุ่น", text: "วันนี้อากาศดีจัง" })).text);

const formatted = await prompt.formatMessages({ language: "อังกฤษ", text: "สวัสดี" });
check(
  "แม่แบบสร้างข้อความ system แล้ว human โดยเติมช่อง {language} {text}",
  formatted.length === 2 &&
    formatted[0].type === "system" &&
    String(formatted[0].content).includes("อังกฤษ") &&
    formatted[1].type === "human" &&
    String(formatted[1].content) === "สวัสดี",
  'ช่องในปีกกาต้องชื่อ {language} กับ {text}',
);
check("ได้คำแปลเป็นข้อความ", typeof reply.text === "string" && reply.text.length > 0, "ลืม pipe(llm) หรือเปล่า?");

import type { AIMessage } from "@langchain/core/messages";
import { todo } from "@src/todo";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { llm } from "../02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 06
// แม่แบบข้อความ: ช่องที่เขียนในปีกกา {ชื่อ} จะถูกเติมค่าตอนใช้งาน

// 👉 ข้อ 1: สร้างแม่แบบด้วย ChatPromptTemplate.fromMessages([...]) มี 2 ข้อความ:
//          ["system", "คุณคือนักแปล แปลข้อความของผู้ใช้เป็นภาษา{language} ตอบเฉพาะคำแปล"]
//          ["human", "{text}"]
const prompt: ChatPromptTemplate = todo(1);

// 👉 ข้อ 2: ต่อแม่แบบเข้ากับ llm เป็นสายเดียว (chain) แล้วเรียกด้วยค่าของช่อง
// แนวทาง: const chain = prompt.pipe(llm);
//         const reply = await chain.invoke({ language: "อังกฤษ", text: "วันนี้อากาศดีจัง" });
const chain = prompt.pipe(llm);
const reply: AIMessage = todo(2);

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

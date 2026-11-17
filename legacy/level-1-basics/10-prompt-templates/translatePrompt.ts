import { ChatPromptTemplate } from "@langchain/core/prompts";

// เทมเพลตมีช่องว่าง {language} และ {text} ให้เติมทีหลัง
export const translatePrompt = ChatPromptTemplate.fromMessages([
  ["system", "คุณคือนักแปล แปลข้อความที่ได้รับเป็นภาษา{language} ตอบเฉพาะคำแปล"],
  ["human", "{text}"],
]);

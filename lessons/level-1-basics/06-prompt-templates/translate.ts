import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { todo } from "@src/todo";

// แม่แบบข้อความ: ช่องที่เขียนในปีกกา {ชื่อ} จะถูกเติมค่าตอนใช้งาน
export function buildTranslatePrompt(): ChatPromptTemplate {
  // 👉 ข้อ 1: คืนแม่แบบที่สร้างด้วย ChatPromptTemplate.fromMessages([...]) มี 2 ข้อความ:
  //          ["system", "คุณคือนักแปล แปลข้อความของผู้ใช้เป็นภาษา{language} ตอบเฉพาะคำแปล"]
  //          ["human", "{text}"]
  return todo(1);
}

export async function translate(llm: BaseChatModel, language: string, text: string): Promise<string> {
  // 👉 ข้อ 2: ต่อแม่แบบเข้ากับ llm เป็นสายเดียว แล้วเรียกด้วยค่าของช่อง แล้วคืน .text
  // แนวทาง: const chain = buildTranslatePrompt().pipe(llm);
  //         const reply = await chain.invoke({ language, text });
  return todo(2);
}

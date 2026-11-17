import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export function buildTranslatePrompt() {
  return ChatPromptTemplate.fromMessages([
    ["system", "คุณคือนักแปล แปลข้อความของผู้ใช้เป็นภาษา{language} ตอบเฉพาะคำแปล"],
    ["human", "{text}"],
  ]);
}

export async function translate(llm: BaseChatModel, language: string, text: string): Promise<string> {
  const chain = buildTranslatePrompt().pipe(llm);
  const reply = await chain.invoke({ language, text });
  return reply.text;
}

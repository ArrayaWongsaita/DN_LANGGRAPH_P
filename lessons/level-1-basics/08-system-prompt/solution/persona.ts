import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// system prompt = คำสั่งกำหนดบทบาท ส่งเป็นข้อความแรกเสมอ
export async function askWithPersona(
  llm: BaseChatModel,
  persona: string,
  question: string,
): Promise<string> {
  const response = await llm.invoke([new SystemMessage(persona), new HumanMessage(question)]);
  return String(response.content);
}

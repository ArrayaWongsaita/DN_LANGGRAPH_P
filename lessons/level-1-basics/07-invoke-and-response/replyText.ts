import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

// ถาม LLM แล้วคืน "ข้อความล้วน" แม้ content จะมาเป็น array ของ block ก็ตาม
export async function replyText(llm: BaseChatModel, prompt: string): Promise<string> {
  const { content } = await llm.invoke(prompt);
  if (typeof content === "string") return content;
  return content
    .map((block) => (block.type === "text" ? (block as { text: string }).text : ""))
    .join("");
}

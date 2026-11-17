import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { todo } from "@src/todo";

export async function askSturdy(
  primary: BaseChatModel,
  backup: BaseChatModel,
  question: string,
): Promise<string> {
  // 👉 ข้อ 1: ทำ primary ให้ลองใหม่ได้สูงสุด 3 ครั้ง: primary.withRetry({ stopAfterAttempt: 3 })
  const retrying = todo(1);
  // 👉 ข้อ 2: เพิ่มตัวสำรอง: retrying.withFallbacks({ fallbacks: [backup] })
  const sturdy = todo(2);
  const reply = await sturdy.invoke(question);
  return (reply as { text: string }).text;
}

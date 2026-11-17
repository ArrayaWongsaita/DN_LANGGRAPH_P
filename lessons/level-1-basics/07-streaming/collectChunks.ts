import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { todo } from "@src/todo";

// ขอคำตอบแบบ stream แล้วเก็บข้อความของแต่ละชิ้นตามลำดับที่ได้รับ
export async function collectChunks(llm: BaseChatModel, question: string): Promise<string[]> {
  const chunks: string[] = [];

  // 👉 ข้อ 1: เปิด stream จาก LLM
  // แนวทาง: const stream = await llm.stream(question);
  const stream = todo(1);

  // 👉 ข้อ 2: วนอ่านทีละชิ้นด้วย for await แล้วเก็บ chunk.text ลง chunks
  // แนวทาง: for await (const chunk of stream) { chunks.push(chunk.text); }
  todo(2);

  return chunks;
}

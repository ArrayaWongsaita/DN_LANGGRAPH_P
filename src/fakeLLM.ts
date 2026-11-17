import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { FakeListChatModel } from "@langchain/core/utils/testing";

/**
 * LLM ปลอมสำหรับ test: ตอบตาม replies ที่เขียนไว้ทีละอัน ตามลำดับ
 * เมื่อตอบครบแล้วจะวนกลับไปอันแรก (cycle)
 * ไม่ต้องใช้ API key และไม่ยิงเน็ต จึงผลลัพธ์แน่นอนทุกครั้ง
 */
export function fakeLLM(replies: string[]): BaseChatModel {
  return new FakeListChatModel({ responses: replies });
}

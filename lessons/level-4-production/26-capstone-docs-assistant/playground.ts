// Playground ของบท 4-26: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-26   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-26 --watch)
// เริ่มใหม่: pnpm play 4-26 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ถามผู้ช่วยเอกสารด้วยคำถามหลายแบบ รวมถึงที่ไม่ปลอดภัย
//   2) เพิ่มเอกสารใหม่แล้วถามเรื่องนั้น
//   3) ปรับ guardrail ให้เข้มขึ้น

import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { BaseCheckpointSaver } from "@langchain/langgraph";
import { END, MemorySaver, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { InMemoryIndex, KeywordEmbeddings, SAMPLE_DOCS } from "@src/rag";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

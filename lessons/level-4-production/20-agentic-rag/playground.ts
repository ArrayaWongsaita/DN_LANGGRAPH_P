// Playground ของบท 4-20: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-20   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-20 --watch)
// เริ่มใหม่: pnpm play 4-20 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ให้ agent ให้คะแนนผลค้น แล้วเขียนคำถามใหม่ถ้าไม่เกี่ยว
//   2) จำกัดจำนวนรอบ
//   3) ลองคำถามที่เอกสารไม่มีคำตอบ

import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { InMemoryIndex, KeywordEmbeddings, SAMPLE_DOCS } from "@src/rag";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

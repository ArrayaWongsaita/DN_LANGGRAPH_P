// Playground ของบท 4-19: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-19   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-19 --watch)
// เริ่มใหม่: pnpm play 4-19 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ทำ tool ค้นเอกสารให้ agent เรียกใช้เอง
//   2) ถามคำถามที่ต้องค้นและที่ไม่ต้องค้น
//   3) ปรับจำนวนผลลัพธ์

import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { type Hit, InMemoryIndex, KeywordEmbeddings, SAMPLE_DOCS } from "@src/rag";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

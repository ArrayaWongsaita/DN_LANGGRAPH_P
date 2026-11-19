// Playground ของบท 4-21: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-21   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-21 --watch)
// เริ่มใหม่: pnpm play 4-21 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ให้คำตอบอ้างอิงแหล่งที่มา
//   2) ตรวจว่าอ้างอิงตรงกับเอกสารจริง
//   3) ลองคำถามที่ต้องใช้หลายแหล่ง

import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { Hit } from "@src/rag";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

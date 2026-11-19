// Playground ของบท 5-05: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 5-05   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 5-05 --watch)
// เริ่มใหม่: pnpm play 5-05 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) จัดอันดับผลค้นใหม่ด้วยโมเดล แล้วตัดด้วยเกณฑ์คะแนน
//   2) เทียบลำดับก่อนและหลัง rerank
//   3) ลองเกณฑ์ตัดต่าง ๆ

import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

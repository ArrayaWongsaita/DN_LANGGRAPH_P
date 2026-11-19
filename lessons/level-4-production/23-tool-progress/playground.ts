// Playground ของบท 4-23: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-23   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-23 --watch)
// เริ่มใหม่: pnpm play 4-23 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ทำ tool ที่รายงานความคืบหน้าด้วย streamMode "tools"
//   2) พิมพ์ความคืบหน้าทีละขั้น
//   3) ลอง tool หลายตัวพร้อมกัน

import { HumanMessage } from "@langchain/core/messages";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

// Playground ของบท 4-07: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-07   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-07 --watch)
// เริ่มใหม่: pnpm play 4-07 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) สร้าง agent ทดสอบด้วย fake model ที่กำหนดคำตอบเอง
//   2) ตรวจว่า agent เรียก tool ตามที่คาด
//   3) เขียนสถานการณ์ที่ tool ล้มเหลว

import { AIMessage, HumanMessage } from "@langchain/core/messages";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { createAgent, fakeModel } from "langchain";
import { makeAddTool } from "@src/sampleTools";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

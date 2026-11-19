// Playground ของบท 4-12: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-12   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-12 --watch)
// เริ่มใหม่: pnpm play 4-12 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ใส่ middleware ปกปิด PII แล้วลองข้อความที่มีอีเมลและเบอร์โทร
//   2) เพิ่มรูปแบบข้อมูลที่ต้องปกปิดอีกชนิด
//   3) เปลี่ยนวิธีปกปิด

import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { createAgent, piiMiddleware } from "langchain";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

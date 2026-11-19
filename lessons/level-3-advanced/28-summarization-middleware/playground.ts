// Playground ของบท 3-28: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-28   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-28 --watch)
// เริ่มใหม่: pnpm play 3-28 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ใส่ summarization middleware ให้ agent ที่คุยยาว
//   2) ปรับเกณฑ์ที่เริ่มสรุป
//   3) คุยหลายรอบแล้วดูประวัติที่เหลือ

import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createAgent, summarizationMiddleware } from "langchain";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

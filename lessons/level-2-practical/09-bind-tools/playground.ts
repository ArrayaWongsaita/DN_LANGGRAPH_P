// Playground ของบท 2-09: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-09   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-09 --watch)
// เริ่มใหม่: pnpm play 2-09 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ผูก tools เข้ากับ llm ด้วย bindTools แล้วถามคำถามที่ต้องใช้ tool
//   2) พิมพ์ tool_calls ที่ LLM ขอ
//   3) รัน tool ตามที่ขอเองด้วยมือ

import { HumanMessage } from "@langchain/core/messages";
import { makeAddTool, makeWeatherTool } from "@src/sampleTools";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

// Playground ของบท 2-21: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-21   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-21 --watch)
// เริ่มใหม่: pnpm play 2-21 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ใส่ interrupt ใน tool ที่มีผลข้างเคียง เช่น ส่งอีเมล
//   2) ปฏิเสธการอนุมัติแล้วดูว่า tool ไม่ทำงาน
//   3) ลองวาง interrupt หลังการทำงานจริงแล้วดูปัญหา

import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { Command, MemorySaver, interrupt, isInterrupted } from "@langchain/langgraph";
import { createAgent } from "langchain";
import { z } from "zod";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

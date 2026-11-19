// Playground ของบท 3-29: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-29   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-29 --watch)
// เริ่มใหม่: pnpm play 3-29 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ใส่ human-in-the-loop middleware ให้ tool ที่เสี่ยง
//   2) อนุมัติ ปฏิเสธ และแก้ไขอาร์กิวเมนต์
//   3) เลือกว่า tool ไหนต้องขออนุมัติ

import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { Command, MemorySaver, isInterrupted } from "@langchain/langgraph";
import { createAgent, humanInTheLoopMiddleware } from "langchain";
import { z } from "zod";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

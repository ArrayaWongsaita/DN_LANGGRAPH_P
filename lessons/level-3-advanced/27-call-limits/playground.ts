// Playground ของบท 3-27: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-27   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-27 --watch)
// เริ่มใหม่: pnpm play 3-27 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ใส่ middleware จำกัดจำนวนครั้งที่เรียกโมเดลและ tool
//   2) ทำ agent ที่วนแล้วดูว่าถูกตัดเมื่อถึงเพดาน
//   3) เปลี่ยนเพดานและเทียบผล

import { HumanMessage } from "@langchain/core/messages";
import { createAgent, modelCallLimitMiddleware, toolCallLimitMiddleware } from "langchain";
import { makeAddTool } from "@src/sampleTools";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

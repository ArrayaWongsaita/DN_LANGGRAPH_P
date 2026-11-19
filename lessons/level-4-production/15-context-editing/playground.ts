// Playground ของบท 4-15: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-15   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-15 --watch)
// เริ่มใหม่: pnpm play 4-15 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ล้างผลลัพธ์ tool เก่าเมื่อ context ยาว
//   2) ปรับจำนวนผลที่เก็บไว้
//   3) คุยหลายรอบแล้วดูขนาด context

import { HumanMessage } from "@langchain/core/messages";
import { createAgent, ClearToolUsesEdit, contextEditingMiddleware } from "langchain";
import { makeAddTool } from "@src/sampleTools";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

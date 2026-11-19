// Playground ของบท 4-14: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-14   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-14 --watch)
// เริ่มใหม่: pnpm play 4-14 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ลอง prompt injection ในผลลัพธ์ของ tool แล้วดูว่าป้องกันได้
//   2) จำกัดสิทธิ์ของ tool ด้วย allowlist
//   3) ลองเรียก tool ที่ไม่ได้รับอนุญาต

import type { StructuredToolInterface } from "@langchain/core/tools";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

// Playground ของบท 2-21: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-21   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-21 --watch)
// เริ่มใหม่: pnpm play 2-21 --reset
//
// ลองทำดู:
//   1) สลับผลอนุมัติแล้วดูรายการ sent
//   2) พิมพ์ payload ที่ tool ส่งออกมาตอนหยุด

import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { Command, MemorySaver, interrupt, isInterrupted } from "@langchain/langgraph";
import { createAgent } from "langchain";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";

// เขียนโค้ดของคุณตรงนี้

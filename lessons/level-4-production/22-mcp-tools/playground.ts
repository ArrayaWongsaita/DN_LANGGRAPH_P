// Playground ของบท 4-22: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-22   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-22 --watch)
// เริ่มใหม่: pnpm play 4-22 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) เชื่อมต่อ MCP server แล้วโหลด tool มาใช้ใน agent
//   2) ลองเรียก tool ของ server โดยตรง
//   3) ลองเมื่อ server ไม่ตอบ

import { fileURLToPath } from "node:url";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { HumanMessage } from "@langchain/core/messages";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createAgent } from "langchain";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

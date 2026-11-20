// Playground ของบท 2-17: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-17   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-17 --watch)
// เริ่มใหม่: pnpm play 2-17 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) จดโน้ตสองรายการและพิมพ์ผลจาก listNotes
//   2) เทียบจำนวนข้อความเมื่อเปิดไฟล์เดิมด้วย thread เดิมกับ thread ใหม่

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { HumanMessage, type BaseMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { createAgent } from "langchain";
import { z } from "zod";
import { llm } from "@lessons/level-1-basics/02-llm-config/llm";

// เขียนโค้ดของคุณตรงนี้

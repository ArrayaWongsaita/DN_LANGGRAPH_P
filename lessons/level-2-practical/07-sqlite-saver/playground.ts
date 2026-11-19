// Playground ของบท 2-07: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-07   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-07 --watch)
// เริ่มใหม่: pnpm play 2-07 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) สร้าง SqliteSaver ที่เก็บลงไฟล์ แล้วคุยหนึ่งรอบ
//   2) รันไฟล์ซ้ำด้วย thread_id เดิมเพื่อดูว่าจำข้ามการรันได้
//   3) ลบไฟล์ฐานข้อมูลแล้วเทียบผล

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { HumanMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

// Playground ของบท 2-07: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-07   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-07 --watch)
// เริ่มใหม่: pnpm play 2-07 --reset
//
// ลองทำดู:
//   1) ปิดแล้วเปิด SqliteSaver ด้วย path เดิม
//   2) เปลี่ยน thread_id ตอนเปิดไฟล์เดิมครั้งที่สอง
//   3) เปรียบเทียบผลจากไฟล์กับ :memory:

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";

// เขียนโค้ดของคุณตรงนี้

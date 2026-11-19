// Playground ของบท 3-22: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-22   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-22 --watch)
// เริ่มใหม่: pnpm play 3-22 --reset
//
// ลองทำดู:
//   1) ให้ subgraph มี interrupt แล้วทำงานต่อด้วย checkpointer ของ graph หลัก
//   2) ดู state ของ subgraph ด้วย subgraphs: true
//   3) ลอง resume หลายรอบ

import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

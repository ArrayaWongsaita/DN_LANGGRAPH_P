// Playground ของบท 2-06: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-06   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-06 --watch)
// เริ่มใหม่: pnpm play 2-06 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) สรุปข้อความเก่าด้วย llm แล้วลบของเดิมด้วย RemoveMessage
//   2) เพิ่มเงื่อนไขว่าเมื่อไรจึงสรุป (conditional edge)
//   3) ถามเรื่องในประวัติที่ถูกสรุปไปแล้ว

import { HumanMessage, RemoveMessage, SystemMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

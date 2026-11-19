// Playground ของบท 2-04: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-04   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-04 --watch)
// เริ่มใหม่: pnpm play 2-04 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) อ่าน state ของ thread ด้วย graph.getState แล้วพิมพ์ข้อความทั้งหมด
//   2) แก้ state ด้วย updateState เช่น ลบข้อความแรก
//   3) คุยต่อแล้วดูว่า LLM เห็นข้อความที่แก้แล้ว

import { HumanMessage, RemoveMessage } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

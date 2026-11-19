// Playground ของบท 2-02: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-02   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-02 --watch)
// เริ่มใหม่: pnpm play 2-02 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) compile graph แชตด้วย MemorySaver แล้วคุยสองรอบใน thread เดียว
//   2) ถามเรื่องที่คุยไปในรอบแรก เพื่อดูว่า graph จำได้
//   3) เอา checkpointer ออกแล้วเทียบผล

import { HumanMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

// Playground ของบท 2-22: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-22   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-22 --watch)
// เริ่มใหม่: pnpm play 2-22 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) สตรีม streamMode "messages" แล้วพิมพ์ chunk ทีละชิ้น
//   2) กรองเฉพาะ node ที่สนใจจาก metadata
//   3) ต่อ chunk เป็นข้อความเต็ม

import { HumanMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

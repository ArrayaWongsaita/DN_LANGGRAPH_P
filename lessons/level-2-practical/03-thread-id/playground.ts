// Playground ของบท 2-03: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-03   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-03 --watch)
// เริ่มใหม่: pnpm play 2-03 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ใช้ thread_id สองค่า แล้วดูว่าบทสนทนาแยกกัน
//   2) ประกอบ thread_id จากชื่อผู้ใช้และหัวข้อ
//   3) คุยต่อใน thread เดิมหลังผ่านไปหลายรอบ

import { HumanMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

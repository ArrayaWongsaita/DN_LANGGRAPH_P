// Playground ของบท 1-06: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-06   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-06 --watch)
// เริ่มใหม่: pnpm play 1-06 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) สร้างบทสนทนาด้วย SystemMessage, HumanMessage, AIMessage แล้วถามเรื่องที่คุยไปก่อนหน้า
//   2) เปลี่ยน system prompt เป็นบุคลิกอื่น เช่น พี่เลี้ยงสายฮา
//   3) ตัดประวัติบางส่วนออก แล้วดูว่า LLM ลืมอะไรบ้าง

import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

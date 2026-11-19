// Playground ของบท 2-05: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-05   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-05 --watch)
// เริ่มใหม่: pnpm play 2-05 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ตัดประวัติด้วย trimMessages ก่อนส่งให้ llm ด้วยค่า maxTokens ต่าง ๆ
//   2) คุยหลายรอบแล้วดูว่าข้อความไหนหายไป
//   3) ลอง strategy อื่นและดูผลต่าง

import { HumanMessage, trimMessages } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

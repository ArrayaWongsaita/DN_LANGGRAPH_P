// Playground ของบท 2-01: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-01   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-01 --watch)
// เริ่มใหม่: pnpm play 2-01 --reset
//
// ลองทำดู:
//   1) คืน AIMessage สองข้อความจาก node แล้วดูว่าต่อท้ายตามลำดับไหม
//   2) รัน invoke สองครั้งแล้วดู messages ของแต่ละรอบ
//   3) ลองอ่านข้อความสุดท้ายด้วย .at(-1)?.text

import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";

// เขียนโค้ดของคุณตรงนี้

// Playground ของบท 2-04: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-04   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-04 --watch)
// เริ่มใหม่: pnpm play 2-04 --reset
//
// ลองทำดู:
//   1) อ่าน values.messages ของ thread ที่ยังไม่มีประวัติ
//   2) เปลี่ยน id ที่ส่งให้ RemoveMessage
//   3) ส่ง HumanMessage ที่ใช้ id เดิมเพื่อแก้ข้อความ

import { AIMessage, HumanMessage, RemoveMessage, type BaseMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";

// เขียนโค้ดของคุณตรงนี้

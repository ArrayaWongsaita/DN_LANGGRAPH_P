// Playground ของบท 2-02: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-02   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-02 --watch)
// เริ่มใหม่: pnpm play 2-02 --reset
//
// ลองทำดู:
//   1) รันสองรอบด้วย MemorySaver แล้วดูจำนวนข้อความใน getState
//   2) ใช้ thread_id ใหม่ในรอบสองแล้วเทียบจำนวนข้อความ
//   3) สร้าง MemorySaver ตัวใหม่แล้วลองอ่าน thread เดิม

import { AIMessage, HumanMessage, type BaseMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";

// เขียนโค้ดของคุณตรงนี้

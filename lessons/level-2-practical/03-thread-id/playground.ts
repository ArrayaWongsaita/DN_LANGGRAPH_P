// Playground ของบท 2-03: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-03   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-03 --watch)
// เริ่มใหม่: pnpm play 2-03 --reset
//
// ลองทำดู:
//   1) เรียก graph สลับระหว่างสอง thread_id
//   2) เปลี่ยนห้องของรอบสามแล้วดูว่าข้อความแรกเป็นของใคร
//   3) เพิ่มห้องส่วนตัวของผู้ใช้คนเดิม

import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";

// เขียนโค้ดของคุณตรงนี้

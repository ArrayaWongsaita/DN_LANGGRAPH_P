// Playground ของบท 2-12: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-12   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-12 --watch)
// เริ่มใหม่: pnpm play 2-12 --reset
//
// ลองทำดู:
//   1) สร้าง agent ที่วนไม่จบ แล้วใส่ recursionLimit
//   2) จับ GraphRecursionError แล้วแสดงข้อความที่เป็นมิตร
//   3) คำนวณ limit จากจำนวนรอบ tool ที่ยอมรับ

import { AIMessage, type BaseMessage } from "@langchain/core/messages";
import { END, GraphRecursionError, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { makeAddTool } from "@src/sampleTools";

// เขียนโค้ดของคุณตรงนี้

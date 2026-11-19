// Playground ของบท 2-15: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-15   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-15 --watch)
// เริ่มใหม่: pnpm play 2-15 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) เลือกโมเดลตามความยาวของคำถาม (ถูกกับแรง)
//   2) กรอง tools ตามเนื้อหาคำถาม
//   3) พิมพ์ว่าเลือกอะไรไปในแต่ละคำถาม

import { HumanMessage } from "@langchain/core/messages";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { makeAddTool, makeWeatherTool } from "@src/sampleTools";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

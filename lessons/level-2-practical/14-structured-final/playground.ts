// Playground ของบท 2-14: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-14   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-14 --watch)
// เริ่มใหม่: pnpm play 2-14 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) กำหนด zod schema ของคำตอบสุดท้าย แล้วใช้ withStructuredOutput หลัง agent ทำงานเสร็จ
//   2) เพิ่ม field ใหม่ในคำตอบ
//   3) ลองถามคำถามที่ข้อมูลไม่ครบ

import { HumanMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { makeWeatherTool } from "@src/sampleTools";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

// Playground ของบท 2-14: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-14   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-14 --watch)
// เริ่มใหม่: pnpm play 2-14 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ลอง schema กับ tempC ที่เป็นตัวเลขและสตริง
//   2) เพิ่มฟิลด์ unit แล้วตรวจด้วย safeParse
//   3) ดูโครงสร้าง answer ที่คืนจาก node format

import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "@lessons/level-1-basics/02-llm-config/llm";

// เขียนโค้ดของคุณตรงนี้

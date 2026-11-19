// Playground ของบท 2-16: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-16   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-16 --watch)
// เริ่มใหม่: pnpm play 2-16 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) สร้าง agent ด้วย createAgent ใส่ model, tools และ systemPrompt
//   2) เพิ่ม checkpointer เพื่อให้จำบทสนทนา
//   3) เทียบกับวง ReAct ที่เขียนเองในบท 2-11

import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createAgent } from "langchain";
import { makeAddTool, makeWeatherTool } from "@src/sampleTools";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

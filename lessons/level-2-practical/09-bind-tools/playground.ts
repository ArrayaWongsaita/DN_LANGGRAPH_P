// Playground ของบท 2-09: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-09   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-09 --watch)
// เริ่มใหม่: pnpm play 2-09 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) พิมพ์ name และ args ของ tool_calls
//   2) ลองถามให้โมเดลใช้ add หรือ getWeather
//   3) เทียบกับ AIMessage ตัวอย่างใน README

import { HumanMessage, ToolMessage } from "@langchain/core/messages";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { makeAddTool, makeWeatherTool } from "@src/sampleTools";
import { llm } from "@lessons/level-1-basics/02-llm-config/llm";

// เขียนโค้ดของคุณตรงนี้

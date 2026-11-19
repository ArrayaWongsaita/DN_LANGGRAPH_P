// Playground ของบท 2-11: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-11   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-11 --watch)
// เริ่มใหม่: pnpm play 2-11 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ต่อวง ReAct เองจาก node agent, ToolNode และ toolsCondition
//   2) ถามคำถามที่ต้องใช้ tool หลายครั้ง
//   3) พิมพ์ messages ทั้งหมดดูลำดับ

import { HumanMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { makeAddTool, makeWeatherTool } from "@src/sampleTools";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

// Playground ของบท 2-20: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-20   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-20 --watch)
// เริ่มใหม่: pnpm play 2-20 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ให้มนุษย์แก้ร่างที่ LLM เขียนก่อนส่งต่อ
//   2) resume ด้วยฉบับแก้ไขและด้วยสตริงว่าง
//   3) เพิ่มขั้นตอนที่ใช้ฉบับที่แก้แล้วต่อ

import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

// Playground ของบท 4-06: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-06   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-06 --watch)
// เริ่มใหม่: pnpm play 4-06 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) แยกตรรกะของ node ออกมาเป็นฟังก์ชันที่ทดสอบได้
//   2) เขียนการเรียกฟังก์ชันนั้นด้วยข้อมูลหลายแบบ
//   3) เพิ่มกรณีขอบ

import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

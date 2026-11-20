// Playground ของบท 1-20: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-20   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-20 --watch)
// เริ่มใหม่: pnpm play 1-20 --reset
//
// ลองทำดู:
//   1) จำลอง greeting กับ question โดยใช้ข้อความเดิม
//   2) เปลี่ยนคำตอบตายตัวของ smallTalk แล้วสังเกต State
//   3) ลองใช้โมเดลที่ตั้งไว้ในบท 1-02 หลังฝึกเส้นทางแล้ว

import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";

// เขียนโค้ดของคุณตรงนี้

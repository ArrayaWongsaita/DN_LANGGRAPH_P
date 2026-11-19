// Playground ของบท 5-14: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 5-14   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 5-14 --watch)
// เริ่มใหม่: pnpm play 5-14 --reset
//
// ต้องใช้: Postgres ของคอร์ส (docker compose up -d --wait) และ DATABASE_URL ใน .env, key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) สร้าง SQL agent: ดู schema เขียน query ตรวจ แล้วรัน
//   2) ถามคำถามหลายแบบกับข้อมูลตัวอย่าง
//   3) ลองคำถามที่ query ผิดแล้วดูว่าแก้เองได้ไหม

import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import pg from "pg";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

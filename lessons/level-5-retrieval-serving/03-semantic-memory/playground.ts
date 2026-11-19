// Playground ของบท 5-03: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 5-03   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 5-03 --watch)
// เริ่มใหม่: pnpm play 5-03 --reset
//
// ต้องใช้: Postgres ของคอร์ส (docker compose up -d --wait) และ DATABASE_URL ใน .env, key ของ embedding ใน .env
//
// ลองทำดู:
//   1) เก็บความจำระยะยาวที่ค้นด้วยความหมาย
//   2) ค้นด้วยคำถามที่ไม่ใช้คำเดียวกับความจำ
//   3) เพิ่มความจำใหม่แล้วค้นซ้ำ

import { randomUUID } from "node:crypto";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { BaseStore } from "@langchain/langgraph";
import { END, InMemoryStore, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { getEmbeddings, embeddingDimensions } from "@src/embeddings";
import { KeywordEmbeddings } from "@src/rag";

// เขียนโค้ดของคุณตรงนี้

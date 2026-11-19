// Playground ของบท 5-11: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 5-11   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 5-11 --watch)
// เริ่มใหม่: pnpm play 5-11 --reset
//
// ต้องใช้: Postgres ของคอร์ส (docker compose up -d --wait) และ DATABASE_URL ใน .env
//
// ลองทำดู:
//   1) เข้ารหัส checkpoint ด้วย serializer แล้วอ่านข้อมูลดิบในตาราง
//   2) ลองถอดรหัสด้วยกุญแจผิด
//   3) เทียบขนาดข้อมูลก่อนและหลังเข้ารหัส

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { END, MemorySaver, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { JsonPlusSerializer } from "@langchain/langgraph-checkpoint";
import type { SerializerProtocol } from "@langchain/langgraph-checkpoint";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import pg from "pg";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

// Playground ของบท 5-10: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 5-10   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 5-10 --watch)
// เริ่มใหม่: pnpm play 5-10 --reset
//
// ต้องใช้: Postgres ของคอร์ส (docker compose up -d --wait) และ DATABASE_URL ใน .env
//
// ลองทำดู:
//   1) ดูจำนวน checkpoint ของแต่ละ thread
//   2) ลบ checkpoint เก่าและเก็บเฉพาะล่าสุด N อัน
//   3) ลบ thread ทั้งหมด

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import pg from "pg";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

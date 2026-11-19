// Playground ของบท 4-24: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-24   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-24 --watch)
// เริ่มใหม่: pnpm play 4-24 --reset
//
// ต้องใช้: Postgres ของคอร์ส (docker compose up -d --wait) และ DATABASE_URL ใน .env
//
// ลองทำดู:
//   1) เก็บความจำถาวรด้วย PostgresSaver แล้วคุยข้ามการรัน
//   2) ดูตารางที่ถูกสร้างใน Postgres
//   3) ลบข้อมูลของ thread หนึ่ง

import { createHash } from "node:crypto";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

// เขียนโค้ดของคุณตรงนี้

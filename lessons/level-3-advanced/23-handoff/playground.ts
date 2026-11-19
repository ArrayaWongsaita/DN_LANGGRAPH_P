// Playground ของบท 3-23: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-23   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-23 --watch)
// เริ่มใหม่: pnpm play 3-23 --reset
//
// ลองทำดู:
//   1) ทำ handoff ให้ agent หนึ่งส่งต่อให้อีกตัวด้วย Command
//   2) เพิ่ม agent ตัวที่สาม
//   3) พิมพ์ว่าใครตอบในแต่ละรอบ

import { Command, END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

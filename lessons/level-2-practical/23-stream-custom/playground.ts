// Playground ของบท 2-23: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-23   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-23 --watch)
// เริ่มใหม่: pnpm play 2-23 --reset
//
// ลองทำดู:
//   1) เปลี่ยนจำนวนหน้าแล้วนับ custom event
//   2) เพิ่มชื่อหน้าใน payload ของ writer

import { setTimeout } from "node:timers/promises";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

// Playground ของบท 5-22: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 5-22   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 5-22 --watch)
// เริ่มใหม่: pnpm play 5-22 --reset
//
// ลองทำดู:
//   1) สร้าง graph เล็ก ๆ แล้วดู channels และ superstep ของ Pregel
//   2) ลองตั้งชื่อ node ซ้ำกับ state key แล้วดู error
//   3) พิมพ์โครงสร้างของ graph ที่ compile แล้ว

import { END, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

// Playground ของบท 5-24: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 5-24   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 5-24 --watch)
// เริ่มใหม่: pnpm play 5-24 --reset
//
// ลองทำดู:
//   1) สร้าง custom stream channel ส่งข้อมูลเฉพาะแอปไปฝั่ง UI
//   2) อ่านข้อมูลจาก channel ด้วย client
//   3) เพิ่ม channel ที่สอง

import { END, START, StateGraph, StateSchema, StreamChannel } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

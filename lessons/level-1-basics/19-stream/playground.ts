// Playground ของบท 1-19: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-19   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-19 --watch)
// เริ่มใหม่: pnpm play 1-19 --reset
//
// ลองทำดู:
//   1) สร้าง graph เล็ก ๆ แล้วใช้ graph.stream ด้วย streamMode "updates" พิมพ์ว่าแต่ละ node อัปเดตอะไร
//   2) เปลี่ยนเป็น "values" แล้วเทียบกับ "updates"
//   3) เพิ่ม node ที่สามแล้วดูว่า stream ให้อะไรเพิ่ม

import { END, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

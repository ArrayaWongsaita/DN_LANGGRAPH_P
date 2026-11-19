// Playground ของบท 3-08: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-08   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-08 --watch)
// เริ่มใหม่: pnpm play 3-08 --reset
//
// ลองทำดู:
//   1) สร้าง graph ที่แตกหลายสายต่างความยาว แล้วใช้ defer ให้ node สุดท้ายรอทุกสาย
//   2) เทียบกับไม่ใช้ defer
//   3) พิมพ์ลำดับการทำงาน

import { END, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

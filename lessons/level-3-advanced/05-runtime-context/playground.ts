// Playground ของบท 3-05: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-05   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-05 --watch)
// เริ่มใหม่: pnpm play 3-05 --reset
//
// ลองทำดู:
//   1) กำหนด context schema แล้วอ่านจาก runtime.context
//   2) ส่ง context ต่างกันตอน invoke แล้วเทียบผล
//   3) ลองไม่ส่ง context เลย

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

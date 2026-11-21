// Playground ของบท 1-16: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-16   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-16 --watch)
// เริ่มใหม่: pnpm play 1-16 --reset
//
// ลองทำดู:
//   1) เปลี่ยน maxRounds จาก 3 เป็น 1 โดยใช้ replies เดิม
//   2) ลองให้คำตอบแรกเป็น OK แล้วนับจำนวนรอบ

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

// Playground ของบท 3-06: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-06   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-06 --watch)
// เริ่มใหม่: pnpm play 3-06 --reset
//
// ลองทำดู:
//   1) ใส่ retryPolicy ให้ node ที่ล้มเป็นบางครั้ง
//   2) ใช้ retryOn ไม่ลองซ้ำ error บางชนิด
//   3) นับจำนวนครั้งที่ node ถูกเรียก

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

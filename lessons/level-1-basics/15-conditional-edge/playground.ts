// Playground ของบท 1-15: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-15   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-15 --watch)
// เริ่มใหม่: pnpm play 1-15 --reset
//
// ลองทำดู:
//   1) เขียน router ที่เลือกทางจากข้อความ (เช่น ยาวหรือสั้น หรือมีคำที่กำหนด) แล้วใช้ addConditionalEdges
//   2) เพิ่มทางที่สาม เช่น ข้อความว่างให้ไป node empty
//   3) ลองส่งข้อความหลายแบบแล้วพิมพ์ว่าไปทางไหน

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

// Playground ของบท 1-12: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-12   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-12 --watch)
// เริ่มใหม่: pnpm play 1-12 --reset
//
// ลองทำดู:
//   1) สร้าง graph ที่มี 3 node ต่อด้วย addEdge จาก START ถึง END
//   2) ให้แต่ละ node ต่อชื่อตัวเองท้าย trace แล้วพิมพ์ดูลำดับ
//   3) ลองลืมต่อไป END แล้วดู error ตอน compile

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

// Playground ของบท 3-12: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-12   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-12 --watch)
// เริ่มใหม่: pnpm play 3-12 --reset
//
// ลองทำดู:
//   1) ใช้ runtime.store ใน node เก็บและอ่านข้อมูลข้าม thread
//   2) คุยใน thread ใหม่แล้วดูว่ายังจำได้
//   3) แยก namespace ตามผู้ใช้

import { END, InMemoryStore, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

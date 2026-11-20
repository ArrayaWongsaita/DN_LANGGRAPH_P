// Playground ของบท 2-20: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-20   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-20 --watch)
// เริ่มใหม่: pnpm play 2-20 --reset
//
// ลองทำดู:
//   1) ทดลองส่งฉบับแก้ สตริงว่าง และช่องว่าง
//   2) พิมพ์ draft และ final เพื่อเทียบกัน

import { Command, END, START, MemorySaver, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

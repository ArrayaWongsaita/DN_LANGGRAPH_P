// Playground ของบท 3-32: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-32   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-32 --watch)
// เริ่มใหม่: pnpm play 3-32 --reset
//
// ลองทำดู:
//   1) สร้าง graph แล้วพิมพ์เป็น Mermaid ด้วย getGraph().drawMermaid()
//   2) เพิ่ม conditional edge แล้วดูเส้นประ
//   3) วางผลใน Mermaid live editor เพื่อดูภาพ

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

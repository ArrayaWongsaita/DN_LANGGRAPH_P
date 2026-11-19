// Playground ของบท 3-21: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-21   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-21 --watch)
// เริ่มใหม่: pnpm play 3-21 --reset
//
// ลองทำดู:
//   1) ใส่ subgraph เป็น node โดยตรงเมื่อใช้ state ร่วมกัน
//   2) เพิ่ม node ก่อนและหลัง subgraph
//   3) เทียบกับวิธีเรียกใน node ในบท 3-20

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

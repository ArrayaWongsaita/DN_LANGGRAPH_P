// Playground ของบท 3-13: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-13   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-13 --watch)
// เริ่มใหม่: pnpm play 3-13 --reset
//
// ลองทำดู:
//   1) วนอ่าน graph.getStateHistory ของ thread แล้วพิมพ์ checkpoint
//   2) หา checkpoint ที่ node ถัดไปเป็นอันที่ต้องการ
//   3) เทียบจำนวน checkpoint ของ graph ที่ยาวต่างกัน

import { END, MemorySaver, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import type { StateSnapshot } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

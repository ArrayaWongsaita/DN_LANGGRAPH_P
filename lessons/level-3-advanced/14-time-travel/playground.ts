// Playground ของบท 3-14: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-14   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-14 --watch)
// เริ่มใหม่: pnpm play 3-14 --reset
//
// ลองทำดู:
//   1) เลือก checkpoint เก่าแล้ว replay จากจุดนั้น
//   2) fork ด้วย updateState แล้วรันต่อ
//   3) เทียบผลของเส้นเวลาเดิมกับเส้นที่แตกใหม่

import { END, MemorySaver, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

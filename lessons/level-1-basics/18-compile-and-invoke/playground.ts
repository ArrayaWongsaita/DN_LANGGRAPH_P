// Playground ของบท 1-18: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-18   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-18 --watch)
// เริ่มใหม่: pnpm play 1-18 --reset
//
// ลองทำดู:
//   1) เปลี่ยน recursionLimit โดยใช้ target เดิม
//   2) เรียก graph ที่ compile แล้วด้วย n หลายค่า

import { END, GraphRecursionError, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

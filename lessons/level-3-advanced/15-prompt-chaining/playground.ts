// Playground ของบท 3-15: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-15   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-15 --watch)
// เริ่มใหม่: pnpm play 3-15 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ต่อ prompt เป็นสายพาน: ร่าง แล้วขัดเกลา
//   2) เพิ่มขั้นที่สาม เช่น แปลเป็นภาษาอื่น
//   3) เปลี่ยนหัวข้อและเทียบผล

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

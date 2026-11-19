// Playground ของบท 4-02: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-02   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-02 --watch)
// เริ่มใหม่: pnpm play 4-02 --reset
//
// ลองทำดู:
//   1) ใส่ errorHandler ให้ node ที่ล้มเหลวแล้วชดเชยด้วยค่าสำรอง
//   2) บันทึกสาเหตุที่ล้มลง state
//   3) ลอง error หลายชนิด

import { Command, END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import type { NodeError } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

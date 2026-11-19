// Playground ของบท 3-04: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-04   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-04 --watch)
// เริ่มใหม่: pnpm play 3-04 --reset
//
// ลองทำดู:
//   1) ทำ map-reduce: แตกเอกสารเป็นงานย่อย นับคำ แล้วรวมผล
//   2) เปลี่ยนงานย่อยเป็นอย่างอื่น เช่น หาคำที่ยาวที่สุด
//   3) ลองเอกสารจำนวนมาก

import { END, ReducedValue, Send, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

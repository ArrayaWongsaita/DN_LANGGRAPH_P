// Playground ของบท 5-08: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 5-08   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 5-08 --watch)
// เริ่มใหม่: pnpm play 5-08 --reset
//
// ลองทำดู:
//   1) แปลงเหตุการณ์เป็นข้อความความคืบหน้าสำหรับหน้าจอ
//   2) แสดง node ที่กำลังทำงานและ tool ที่เรียก
//   3) ต่อ token เป็นข้อความเต็ม

import type { ProtocolEvent } from "@langchain/langgraph";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { demoRun, recordDemoEvents } from "@src/streamDemo";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

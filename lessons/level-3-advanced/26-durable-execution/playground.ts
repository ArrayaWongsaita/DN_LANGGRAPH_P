// Playground ของบท 3-26: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-26   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-26 --watch)
// เริ่มใหม่: pnpm play 3-26 --reset
//
// ลองทำดู:
//   1) ทำให้ node ที่มีผลข้างเคียงทนต่อการล่มกลางทาง แล้วรันซ้ำจาก checkpoint
//   2) แยกงานที่มีผลข้างเคียงออกเป็นขั้นตอนของตัวเอง
//   3) จำลองการล่มแล้วดูว่าไม่ทำซ้ำ

import { END, MemorySaver, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

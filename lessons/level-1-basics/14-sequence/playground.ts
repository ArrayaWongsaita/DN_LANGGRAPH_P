// Playground ของบท 1-14: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-14   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-14 --watch)
// เริ่มใหม่: pnpm play 1-14 --reset
//
// ลองทำดู:
//   1) สลับ writeDraft กับ improve แล้วดูว่าร่างที่อ่านเปลี่ยนอย่างไร
//   2) เปลี่ยนหัวข้อแล้วตามค่าจาก draft ไป final

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

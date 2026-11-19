// Playground ของบท 1-10: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-10   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-10 --watch)
// เริ่มใหม่: pnpm play 1-10 --reset
//
// ลองทำดู:
//   1) สร้าง StateSchema ของตัวเอง (เช่น โปรไฟล์ หรือรายการสินค้า) ให้บาง field มีค่าเริ่มต้น
//   2) สร้าง graph ที่มี node เดียวแล้ว invoke ด้วยข้อมูลไม่ครบ ดูค่าเริ่มต้น
//   3) ส่งค่าที่ชนิดผิด แล้วดู error

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

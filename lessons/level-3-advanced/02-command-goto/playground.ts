// Playground ของบท 3-02: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-02   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-02 --watch)
// เริ่มใหม่: pnpm play 3-02 --reset
//
// ลองทำดู:
//   1) ใช้ Command({ update, goto }) ให้ node เลือกทางไปต่อเอง
//   2) ประกาศปลายทางด้วย ends
//   3) ส่ง input หลายแบบแล้วดูเส้นทาง

import { Command, END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

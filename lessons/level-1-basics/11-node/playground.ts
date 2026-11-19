// Playground ของบท 1-11: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-11   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-11 --watch)
// เริ่มใหม่: pnpm play 1-11 --reset
//
// ลองทำดู:
//   1) เขียน node สองตัวที่แก้ state คนละ field (เช่น แปลงเป็นตัวพิมพ์ใหญ่ และนับความยาว)
//   2) ต่อเป็น graph แล้ว invoke ด้วยข้อความที่มีช่องว่างหัวท้าย
//   3) สลับลำดับ node แล้วดูว่าผลเปลี่ยนไหม

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

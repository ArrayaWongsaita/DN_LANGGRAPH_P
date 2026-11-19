// Playground ของบท 2-08: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-08   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-08 --watch)
// เริ่มใหม่: pnpm play 2-08 --reset
//
// ลองทำดู:
//   1) สร้าง tool ของตัวเองด้วย tool() และ schema ของ zod
//   2) เรียก tool ตรง ๆ ด้วย .invoke เพื่อดูผล
//   3) ลองส่งอาร์กิวเมนต์ผิดชนิดแล้วดู error

import { tool } from "@langchain/core/tools";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

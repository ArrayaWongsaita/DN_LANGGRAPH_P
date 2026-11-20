// Playground ของบท 2-08: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-08   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-08 --watch)
// เริ่มใหม่: pnpm play 2-08 --reset
//
// ลองทำดู:
//   1) เปลี่ยนตัวเลขที่ส่งให้ add แล้วสังเกตชนิดผลลัพธ์
//   2) ลองส่งสตริงแทนตัวเลขให้ schema
//   3) สร้าง tool คูณด้วย schema เดิม

import { tool, ToolInputParsingException } from "@langchain/core/tools";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

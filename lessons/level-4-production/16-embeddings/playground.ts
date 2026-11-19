// Playground ของบท 4-16: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-16   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-16 --watch)
// เริ่มใหม่: pnpm play 4-16 --reset
//
// ต้องใช้: key ของ embedding ใน .env
//
// ลองทำดู:
//   1) สร้าง embedding ของข้อความแล้วคำนวณ cosine similarity
//   2) เทียบข้อความที่ความหมายใกล้และไกล
//   3) ลองข้อความต่างภาษา

import type { Embeddings } from "@langchain/core/embeddings";
import { KeywordEmbeddings } from "@src/rag";
import { getEmbeddings } from "@src/embeddings";

// เขียนโค้ดของคุณตรงนี้

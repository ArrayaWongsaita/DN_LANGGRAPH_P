// Playground ของบท 5-01: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 5-01   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 5-01 --watch)
// เริ่มใหม่: pnpm play 5-01 --reset
//
// ต้องใช้: key ของ embedding ใน .env
//
// ลองทำดู:
//   1) สร้าง embedding จริงหลายข้อความเป็นชุด (batch)
//   2) ตรวจจำนวนมิติของเวกเตอร์
//   3) ลองข้อความภาษาไทยที่ความหมายใกล้กัน

import { Embeddings } from "@langchain/core/embeddings";
import { getEmbeddings, embeddingDimensions } from "@src/embeddings";
import { cosine } from "@src/rag";

// เขียนโค้ดของคุณตรงนี้

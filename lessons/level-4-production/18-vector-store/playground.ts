// Playground ของบท 4-18: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-18   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-18 --watch)
// เริ่มใหม่: pnpm play 4-18 --reset
//
// ต้องใช้: key ของ embedding ใน .env
//
// ลองทำดู:
//   1) สร้าง vector store ในหน่วยความจำ ใส่เอกสารแล้วค้นด้วยคำถาม
//   2) ลองค่า k ต่าง ๆ
//   3) เพิ่มเอกสารแล้วค้นซ้ำ

import type { Embeddings } from "@langchain/core/embeddings";
import { type Chunk, type Hit, KeywordEmbeddings, SAMPLE_DOCS, cosine } from "@src/rag";
import { getEmbeddings } from "@src/embeddings";

// เขียนโค้ดของคุณตรงนี้

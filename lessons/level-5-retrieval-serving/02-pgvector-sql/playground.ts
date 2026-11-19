// Playground ของบท 5-02: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 5-02   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 5-02 --watch)
// เริ่มใหม่: pnpm play 5-02 --reset
//
// ต้องใช้: Postgres ของคอร์ส (docker compose up -d --wait) และ DATABASE_URL ใน .env, key ของ embedding ใน .env
//
// ลองทำดู:
//   1) สร้างตารางที่มีคอลัมน์ vector แล้วใส่ข้อมูล
//   2) ค้นเพื่อนบ้านที่ใกล้ที่สุดด้วย <=>
//   3) ลองค่า LIMIT ต่าง ๆ

import pg from "pg";
import { getEmbeddings, embeddingDimensions } from "@src/embeddings";
import { SAMPLE_DOCS } from "@src/rag";

// เขียนโค้ดของคุณตรงนี้

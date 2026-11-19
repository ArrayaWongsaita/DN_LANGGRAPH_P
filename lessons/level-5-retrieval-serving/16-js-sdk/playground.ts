// Playground ของบท 5-16: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 5-16   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 5-16 --watch)
// เริ่มใหม่: pnpm play 5-16 --reset
//
// ต้องใช้: langgraph dev (เริ่มให้เองผ่าน startDevServer)
//
// ลองทำดู:
//   1) เรียกเซิร์ฟเวอร์ด้วย @langchain/langgraph-sdk: สร้าง thread และรัน
//   2) สตรีมผลจากเซิร์ฟเวอร์
//   3) อ่าน state ของ thread

import { fileURLToPath } from "node:url";
import { Client } from "@langchain/langgraph-sdk";
import { startDevServer } from "@src/devServer";

// เขียนโค้ดของคุณตรงนี้

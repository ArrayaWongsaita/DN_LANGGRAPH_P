// Playground ของบท 5-26: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 5-26   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 5-26 --watch)
// เริ่มใหม่: pnpm play 5-26 --reset
//
// ต้องใช้: langgraph dev (เริ่มให้เองผ่าน startDevServer)
//
// ลองทำดู:
//   1) ต่อฟอร์มกับ graph ด้วย useStream
//   2) แสดงสถานะของ stream ในหน้าจอ
//   3) จัดการตอนที่ graph หยุดรอคำตอบ (interrupt)

import { fileURLToPath } from "node:url";
import React from "react";
import { JSDOM } from "jsdom";
import { useStream } from "@langchain/langgraph-sdk/react";
import { startDevServer } from "@src/devServer";

// เขียนโค้ดของคุณตรงนี้

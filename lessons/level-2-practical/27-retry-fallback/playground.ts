// Playground ของบท 2-27: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-27   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-27 --watch)
// เริ่มใหม่: pnpm play 2-27 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ใส่ withRetry ให้โมเดลหลัก
//   2) เพิ่มตัวสำรองด้วย withFallbacks
//   3) จำลองโมเดลหลักที่ล้มแล้วดูว่าสลับไปตัวสำรอง

import type { AIMessageChunk } from "@langchain/core/messages";
import { RunnableLambda } from "@langchain/core/runnables";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

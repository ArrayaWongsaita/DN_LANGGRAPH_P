// Playground ของบท 5-09: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 5-09   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 5-09 --watch)
// เริ่มใหม่: pnpm play 5-09 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) เปิดเซิร์ฟเวอร์ Express ที่ส่งความคืบหน้าแบบ SSE
//   2) เรียกด้วย curl แล้วดูสตรีม
//   3) จัดการตอนที่ client ตัดการเชื่อมต่อ

import type { Server } from "node:http";
import { tool } from "@langchain/core/tools";
import express from "express";
import { createAgent } from "langchain";
import { z } from "zod";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

// Playground ของบท 5-18: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 5-18   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 5-18 --watch)
// เริ่มใหม่: pnpm play 5-18 --reset
//
// ลองทำดู:
//   1) เชื่อมต่อ MCP server ผ่าน HTTP พร้อมส่งหัวข้อ Authorization
//   2) ลองโทเคนผิดแล้วดู error
//   3) เรียก tool ของ server ผ่าน client

import { createHash, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import type { Server } from "node:http";
import { Readable } from "node:stream";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

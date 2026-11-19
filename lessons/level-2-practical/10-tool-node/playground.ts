// Playground ของบท 2-10: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-10   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-10 --watch)
// เริ่มใหม่: pnpm play 2-10 --reset
//
// ลองทำดู:
//   1) สร้าง ToolNode จาก tools ของคุณ
//   2) ส่งข้อความที่มี tool call เข้า node แล้วดู ToolMessage
//   3) ลองส่ง tool call ที่ชื่อไม่มี

import { AIMessage, ToolMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { makeAddTool, makeWeatherTool } from "@src/sampleTools";

// เขียนโค้ดของคุณตรงนี้

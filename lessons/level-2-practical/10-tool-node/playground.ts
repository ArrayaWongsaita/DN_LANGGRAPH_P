// Playground ของบท 2-10: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-10   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-10 --watch)
// เริ่มใหม่: pnpm play 2-10 --reset
//
// ลองทำดู:
//   1) เทียบผลจาก tool call หนึ่งรายการ สองรายการ และรายการว่าง
//   2) สลับลำดับ tool call แล้วเทียบ tool_call_id

import { AIMessage, type ToolMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { makeAddTool, makeWeatherTool } from "@src/sampleTools";

// เขียนโค้ดของคุณตรงนี้

// Playground ของบท 2-13: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-13   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-13 --watch)
// เริ่มใหม่: pnpm play 2-13 --reset
//
// ลองทำดู:
//   1) เขียน tool ที่ throw error ในบางกรณี แล้วดูว่า agent รับมืออย่างไร
//   2) ใช้ ToolNode กับ handleToolErrors เพื่อส่ง error กลับให้ LLM
//   3) นับ ToolMessage ที่เป็น error

import { AIMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

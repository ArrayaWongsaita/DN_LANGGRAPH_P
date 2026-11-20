// Playground ของบท 2-11: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-11   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-11 --watch)
// เริ่มใหม่: pnpm play 2-11 --reset
//
// ลองทำดู:
//   1) เทียบเส้นทางของ 12 + 30 กับ สวัสดี
//   2) พิมพ์ชื่อ tool ที่ agent ขอเรียก
//   3) พิมพ์ชนิดข้อความหลังกลับจาก ToolNode

import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { makeAddTool } from "@src/sampleTools";

// เขียนโค้ดของคุณตรงนี้

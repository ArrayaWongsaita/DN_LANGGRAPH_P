// Playground ของบท 2-12: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-12   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-12 --watch)
// เริ่มใหม่: pnpm play 2-12 --reset
//
// ลองทำดู:
//   1) เทียบ recursionLimit 5, 6 และ 7
//   2) คำนวณงบสำหรับ tool 3 รอบ
//   3) แยกการจัดการ GraphRecursionError จาก error อื่น

import { AIMessage } from "@langchain/core/messages";
import { END, GraphRecursionError, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { makeAddTool } from "@src/sampleTools";

// เขียนโค้ดของคุณตรงนี้

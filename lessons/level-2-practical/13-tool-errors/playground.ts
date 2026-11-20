// Playground ของบท 2-13: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-13   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-13 --watch)
// เริ่มใหม่: pnpm play 2-13 --reset
//
// ลองทำดู:
//   1) แก้ตัวหารจาก 0 เป็น 2 แล้วดู status
//   2) เทียบ handleToolErrors ที่ true และ false

import { AIMessage, type ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

// Playground ของบท 2-05: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-05   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-05 --watch)
// เริ่มใหม่: pnpm play 2-05 --reset
//
// ลองทำดู:
//   1) ลองตั้ง maxTokens เป็น 1, 3 และ 5 แล้วดูว่าเหลือข้อความไหน
//   2) สลับ strategy ระหว่าง first กับ last แล้วเทียบผล
//   3) ลองเก็บ SystemMessage ด้วย includeSystem: true

import { AIMessage, HumanMessage, SystemMessage, trimMessages } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";

// เขียนโค้ดของคุณตรงนี้

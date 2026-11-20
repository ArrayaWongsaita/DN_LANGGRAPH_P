// Playground ของบท 2-16: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-16   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-16 --watch)
// เริ่มใหม่: pnpm play 2-16 --reset
//
// ลองทำดู:
//   1) เปลี่ยน thread_id ของรอบสองแล้วดูประวัติ
//   2) พิมพ์ข้อความชนิด tool จากผลลัพธ์
//   3) เปลี่ยน systemPrompt แล้วดูข้อความแรกที่โมเดลได้รับ

import { HumanMessage, type BaseMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createAgent } from "langchain";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { makeWeatherTool } from "@src/sampleTools";

// เขียนโค้ดของคุณตรงนี้

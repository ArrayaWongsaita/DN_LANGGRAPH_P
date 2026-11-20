// Playground ของบท 2-06: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-06   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-06 --watch)
// เริ่มใหม่: pnpm play 2-06 --reset
//
// ลองทำดู:
//   1) เปลี่ยน MAX_MESSAGES เป็น 2 หรือ 6 แล้วดูว่ารอบไหนเริ่มสรุป
//   2) เปลี่ยน KEEP_LAST เป็น 4 แล้วนับข้อความหลังสรุป
//   3) พิมพ์ข้อความที่ส่งเข้าโมเดลจำลองในรอบถัดไป

import { HumanMessage, RemoveMessage, SystemMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { fakeLLM } from "@src/fakeLLM";
import { fakeToolLLM } from "@src/fakeToolLLM";

// เขียนโค้ดของคุณตรงนี้

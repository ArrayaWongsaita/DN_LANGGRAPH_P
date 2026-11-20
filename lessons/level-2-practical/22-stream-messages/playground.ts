// Playground ของบท 2-22: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-22   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-22 --watch)
// เริ่มใหม่: pnpm play 2-22 --reset
//
// ลองทำดู:
//   1) กรองข้อความจาก node draft หรือ polish
//   2) เทียบผลเมื่อต่อทุก chunk กับต่อเฉพาะ node เดียว

import { AIMessageChunk, HumanMessage } from "@langchain/core/messages";
import { FakeStreamingChatModel } from "@langchain/core/utils/testing";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";

// เขียนโค้ดของคุณตรงนี้

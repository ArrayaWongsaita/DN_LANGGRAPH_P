// Playground ของบท 1-13: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-13   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-13 --watch)
// เริ่มใหม่: pnpm play 1-13 --reset
//
// ลองทำดู:
//   1) เปลี่ยนข้อความตอบใน fakeToolLLM แล้วดู answer
//   2) ลองใช้ llm จากบท 1-02 ใน node เดิม

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";

// เขียนโค้ดของคุณตรงนี้

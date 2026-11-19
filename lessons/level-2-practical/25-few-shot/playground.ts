// Playground ของบท 2-25: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-25   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-25 --watch)
// เริ่มใหม่: pnpm play 2-25 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) สร้างรายการตัวอย่าง (few-shot) เป็นคู่ Human/AI แล้วส่งก่อนคำถามจริง
//   2) เทียบผลมีและไม่มีตัวอย่าง
//   3) เพิ่มตัวอย่างที่เป็นกรณีขอบ

import { AIMessage, type BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

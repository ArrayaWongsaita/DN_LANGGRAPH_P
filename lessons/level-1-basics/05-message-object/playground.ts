// Playground ของบท 1-05: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-05   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-05 --watch)
// เริ่มใหม่: pnpm play 1-05 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ส่ง HumanMessage แล้วพิมพ์ reply.type, reply.text และ reply.usage_metadata
//   2) เทียบ usage_metadata ของคำถามสั้นกับคำถามยาว
//   3) ลองส่ง string ตรง ๆ แทน HumanMessage แล้วดูว่าผลเหมือนกันไหม

import { HumanMessage } from "@langchain/core/messages";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้

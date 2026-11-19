// Playground ของบท 5-12: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 5-12   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 5-12 --watch)
// เริ่มใหม่: pnpm play 5-12 --reset
//
// ลองทำดู:
//   1) เขียน workflow ด้วย entrypoint, task และ previous state
//   2) สตรีมผลของ workflow
//   3) ลอง invoke ซ้ำใน thread เดียว

import { type BaseCheckpointSaver, Command, MemorySaver, entrypoint, getPreviousState, getWriter, interrupt, task } from "@langchain/langgraph";

// เขียนโค้ดของคุณตรงนี้

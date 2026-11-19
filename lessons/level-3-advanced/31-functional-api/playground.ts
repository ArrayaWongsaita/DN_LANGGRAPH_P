// Playground ของบท 3-31: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-31   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-31 --watch)
// เริ่มใหม่: pnpm play 3-31 --reset
//
// ลองทำดู:
//   1) เขียน workflow ด้วย entrypoint และ task
//   2) ให้ task ทำงานขนานกันแล้วรอผลรวม
//   3) เพิ่ม checkpointer แล้ว invoke ซ้ำใน thread เดียว

import { MemorySaver, entrypoint, task } from "@langchain/langgraph";

// เขียนโค้ดของคุณตรงนี้

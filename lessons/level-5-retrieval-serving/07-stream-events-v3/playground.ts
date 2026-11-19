// Playground ของบท 5-07: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 5-07   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 5-07 --watch)
// เริ่มใหม่: pnpm play 5-07 --reset
//
// ลองทำดู:
//   1) เรียก streamEvents แล้วพิมพ์ชนิดเหตุการณ์ทั้งหมดที่เกิดขึ้น
//   2) กรองเฉพาะเหตุการณ์ของโมเดล
//   3) เทียบเหตุการณ์ของ graph ที่ซับซ้อนขึ้น

import type { ProtocolEvent } from "@langchain/langgraph";
import { recordDemoEvents } from "@src/streamDemo";

// เขียนโค้ดของคุณตรงนี้

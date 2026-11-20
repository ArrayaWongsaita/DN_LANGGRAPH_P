// Playground ของบท 2-27: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-27   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-27 --watch)
// เริ่มใหม่: pnpm play 2-27 --reset
//
// ลองทำดู:
//   1) เปลี่ยนจำนวนครั้งที่ให้ตัวหลักลอง
//   2) ให้ตัวหลักสำเร็จในการเรียกครั้งที่สองแล้วดู calls
//   3) ลองกำหนดรายการตัวสำรองหลายตัว

import { AIMessage } from "@langchain/core/messages";
import { RunnableLambda, type Runnable } from "@langchain/core/runnables";

// เขียนโค้ดของคุณตรงนี้

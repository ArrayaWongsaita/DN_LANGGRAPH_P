// Playground ของบท 4-17: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-17   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-17 --watch)
// เริ่มใหม่: pnpm play 4-17 --reset
//
// ลองทำดู:
//   1) แบ่งเอกสารยาวเป็นชิ้นด้วยขนาดและ overlap ต่าง ๆ
//   2) เปรียบเทียบจำนวนชิ้น
//   3) ลองแบ่งตามย่อหน้า

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { Chunk } from "@src/rag";

// เขียนโค้ดของคุณตรงนี้

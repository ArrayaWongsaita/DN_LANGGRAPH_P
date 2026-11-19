// Playground ของบท 3-07: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-07   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-07 --watch)
// เริ่มใหม่: pnpm play 3-07 --reset
//
// ลองทำดู:
//   1) ใส่ cachePolicy พร้อม InMemoryCache แล้ว invoke ซ้ำ input เดิม
//   2) ดูว่า node ทำงานกี่ครั้ง
//   3) ลอง input ต่างกันและรอให้ ttl หมด

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { InMemoryCache } from "@langchain/langgraph-checkpoint";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้

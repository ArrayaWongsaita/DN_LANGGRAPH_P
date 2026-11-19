// Playground ของบท 5-17: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 5-17   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 5-17 --watch)
// เริ่มใหม่: pnpm play 5-17 --reset
//
// ต้องใช้: langgraph dev (เริ่มให้เองผ่าน startDevServer)
//
// ลองทำดู:
//   1) เรียกกราฟบนเซิร์ฟเวอร์เป็น node ด้วย RemoteGraph
//   2) ประกอบกราฟท้องถิ่นที่เรียกกราฟระยะไกลหนึ่งตัว
//   3) สตรีมผลผ่าน gateway

import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { END, MemorySaver, START, StateGraph, StateSchema } from "@langchain/langgraph";
import type { BaseCheckpointSaver, LangGraphRunnableConfig } from "@langchain/langgraph";
import { RemoteGraph } from "@langchain/langgraph/remote";
import { z } from "zod";
import { startDevServer } from "@src/devServer";

// เขียนโค้ดของคุณตรงนี้

import type { AIMessageChunk } from "@langchain/core/messages";
import { todo } from "@src/todo";
import { llm } from "../02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 08  ดูตัวอักษรทยอยขึ้นเหมือนแชตจริง

const chunks: string[] = [];

// 👉 ข้อ 1: เปิด stream จาก LLM (ใช้ .stream แทน .invoke)
// แนวทาง: await llm.stream("เล่านิทานสั้น ๆ สามประโยค")
const stream: AsyncIterable<AIMessageChunk> = todo(1);

// 👉 ข้อ 2: วนอ่านทีละชิ้นด้วย for await แล้วเก็บ chunk.text ลง chunks พร้อมพิมพ์ออกจอทันที
// แนวทาง: chunks.push(chunk.text);  process.stdout.write(chunk.text);
for await (const chunk of stream) {
  todo(2);
}
process.stdout.write("\n");

check("ได้ข้อความหลายชิ้น (ไม่ใช่ก้อนเดียว)", chunks.length > 1, "ต้องใช้ llm.stream และวนอ่านด้วย for await");
check("ต่อทุกชิ้นแล้วได้ข้อความไม่ว่าง", chunks.join("").length > 0, "อย่าลืมเก็บ chunk.text ลง chunks");

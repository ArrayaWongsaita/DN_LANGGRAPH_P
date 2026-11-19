import type { AIMessage } from "@langchain/core/messages";
import { todo } from "@src/todo";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-26
// ทุกคำตอบของ LLM มี usage_metadata บอกจำนวน token ที่ใช้ (เงินที่จ่ายคิดจากตรงนี้): ติดตามเพื่อคุมค่าใช้จ่าย

// token ทั้งหมดของคำตอบหนึ่งข้อความ (ไม่มีข้อมูลให้เป็น 0)
function totalTokens(message: AIMessage): number {
  // 👉 ข้อ 1: คืน message.usage_metadata?.total_tokens ถ้าไม่มีให้คืน 0
  // แนวทาง: return message.usage_metadata?.total_tokens ?? 0;
  return todo(1);
}

const questions = ["ทักทายหนึ่งประโยค", "บอกสีหนึ่งสี", "นับ 1 ถึง 3"];
const answers: string[] = [];
const perCall: number[] = [];
let tokens = 0;
for (const q of questions) {
  const reply = (await llm.invoke(q)) as AIMessage;
  answers.push(reply.text);
  perCall.push(totalTokens(reply));
  // 👉 ข้อ 2: บวก totalTokens(reply) เข้า tokens
  todo(2);
}
console.log({ answers, perCall, tokens });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("totalTokens อ่านค่าจาก usage_metadata ได้ (มากกว่า 0)", perCall.every((n) => n > 0), "ใช้ message.usage_metadata?.total_tokens");
check("totalTokens ของข้อความที่ไม่มี usage ได้ 0", totalTokens({ usage_metadata: undefined } as unknown as AIMessage) === 0);
check("tokens รวมเท่ากับผลรวมของทุกครั้ง", tokens === perCall.reduce((a, b) => a + b, 0) && tokens > 0, "บวกทุกรอบเข้า tokens");

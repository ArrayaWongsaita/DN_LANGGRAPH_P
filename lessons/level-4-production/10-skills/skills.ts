import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { todo } from "@src/todo";
import { z } from "zod";

export interface Skill {
  description: string; // สั้น ๆ ใส่ใน prompt
  content: string; // เต็ม ๆ โหลดเมื่อต้องใช้
}

export const SKILLS: Record<string, Skill> = {
  sql: { description: "เขียน query ฐานข้อมูล", content: "คู่มือ SQL: ใช้ SELECT ... FROM ... WHERE เสมอ ห้าม DROP" },
  refund: { description: "นโยบายคืนเงิน", content: "นโยบายคืนเงิน: คืนได้ภายใน 7 วัน พร้อมใบเสร็จ" },
};

// ข้อความรายการ skill สำหรับ system prompt (มีชื่อและคำอธิบายสั้น ห้ามมีเนื้อหาเต็ม)
export function skillIndex(skills: Record<string, Skill>): string {
  // 👉 ข้อ 1: แต่ละ skill เป็นบรรทัด `- ${ชื่อ}: ${description}` ต่อกันด้วย "\n"
  //          แล้วขึ้นต้นด้วย "skills ที่ใช้ได้ (ใช้ load_skill เพื่ออ่านรายละเอียด):\n"
  return todo(1);
}

export function makeLoadSkillTool(skills: Record<string, Skill>) {
  return tool(
    async ({ name }: { name: string }) => {
      // 👉 ข้อ 2: ถ้ามี skills[name] คืน .content ไม่เช่นนั้นคืน `ไม่พบ skill: ${name}`
      return todo(2);
    },
    { name: "load_skill", description: "โหลดเนื้อหาเต็มของ skill", schema: z.object({ name: z.string() }) },
  );
}

export function buildSkillAgent(llm: BaseChatModel) {
  return createAgent({
    model: llm,
    tools: [makeLoadSkillTool(SKILLS)],
    systemPrompt: `คุณคือผู้ช่วย\n${skillIndex(SKILLS)}`,
  });
}

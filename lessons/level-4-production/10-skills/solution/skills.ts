import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { z } from "zod";

export interface Skill {
  description: string;
  content: string;
}

export const SKILLS: Record<string, Skill> = {
  sql: { description: "เขียน query ฐานข้อมูล", content: "คู่มือ SQL: ใช้ SELECT ... FROM ... WHERE เสมอ ห้าม DROP" },
  refund: { description: "นโยบายคืนเงิน", content: "นโยบายคืนเงิน: คืนได้ภายใน 7 วัน พร้อมใบเสร็จ" },
};

export function skillIndex(skills: Record<string, Skill>): string {
  const lines = Object.entries(skills).map(([name, skill]) => `- ${name}: ${skill.description}`);
  return `skills ที่ใช้ได้ (ใช้ load_skill เพื่ออ่านรายละเอียด):\n${lines.join("\n")}`;
}

export function makeLoadSkillTool(skills: Record<string, Skill>) {
  return tool(
    async ({ name }: { name: string }) => {
      return skills[name] ? skills[name].content : `ไม่พบ skill: ${name}`;
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

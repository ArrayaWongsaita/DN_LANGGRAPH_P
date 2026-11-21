import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { todo } from "@src/todo";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-10
// skills: ใส่ใน prompt แค่ "รายการ" (ชื่อ + คำอธิบายสั้น) ให้ agent โหลดเนื้อหาเต็มเองเมื่อจำเป็น ประหยัดบริบทกว่ายัดทุกอย่างลง prompt
interface Skill {
  description: string; // สั้น ๆ ใส่ใน prompt
  content: string; // เต็ม ๆ โหลดเมื่อต้องใช้
}

const SKILLS: Record<string, Skill> = {
  sql: { description: "เขียน query ฐานข้อมูล", content: "คู่มือ SQL: ใช้ SELECT ... FROM ... WHERE เสมอ ห้าม DROP" },
  refund: { description: "นโยบายคืนเงิน", content: "นโยบายคืนเงิน: คืนได้ภายใน 7 วัน พร้อมใบเสร็จ" },
};

// ข้อความรายการ skill สำหรับ system prompt (มีชื่อและคำอธิบายสั้น ห้ามมีเนื้อหาเต็ม)
function skillIndex(skills: Record<string, Skill>): string {
  const lines = Object.entries(skills).map(([name, skill]) => `- ${name}: ${skill.description}`);
  return "skills ที่ใช้ได้ (ใช้ load_skill เพื่ออ่านรายละเอียด):\n" + lines.join("\n");
}

function makeLoadSkillTool(skills: Record<string, Skill>) {
  return tool(
    async ({ name }: { name: string }) => {
      // 👉 ข้อ 1 ถ้ามี skills[name] คืน .content ไม่เช่นนั้นคืน `ไม่พบ skill: ${name}`
      // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
      //   return skills[name] ? skills[name].content : `ไม่พบ skill: ${name}`;
      return todo(1);
    },
    { name: "load_skill", description: "โหลดเนื้อหาเต็มของ skill", schema: z.object({ name: z.string() }) },
  );
}

function buildSkillAgent(model: BaseChatModel) {
  return createAgent({
    model,
    tools: [makeLoadSkillTool(SKILLS)],
    systemPrompt: `คุณคือผู้ช่วย\n${skillIndex(SKILLS)}`,
  });
}

// ส่วนที่ 1: โมเดลปลอมที่สั่งโหลด skill sql แล้วตอบ: ดูว่าอะไรเข้าไปใน prompt ตอนไหน
const index = skillIndex(SKILLS);
const load = makeLoadSkillTool(SKILLS);
const found = String(await load.invoke({ name: "refund" }));
const missing = String(await load.invoke({ name: "xyz" }));
const fake = fakeToolLLM([{ toolCalls: [{ name: "load_skill", args: { name: "sql" }, id: "s1" }] }, "ใช้ SELECT"]);
const r = await buildSkillAgent(fake).invoke({ messages: [new HumanMessage("เขียน query ให้หน่อย")] });
const firstSystem = fake.calls[0]?.[0];
const secondCall = (fake.calls[1] ?? []).map((m) => m.text).join("\n");

// ส่วนที่ 2: โมเดลจริง: ถามเรื่องคืนเงิน ต้องโหลด skill refund เองแล้วตอบจากเนื้อหา
const real = await buildSkillAgent(llm).invoke({ messages: [new HumanMessage("ลูกค้าขอคืนเงินได้ภายในกี่วัน ดูจาก skill ที่มี")] });
console.log("โมเดลจริงตอบ:", real.messages.at(-1)?.text);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("รายการ skill มีชื่อและคำอธิบายสั้น แต่ไม่มีเนื้อหาเต็ม", index.includes("- sql: เขียน query ฐานข้อมูล") && index.includes("- refund: นโยบายคืนเงิน") && !index.includes("ห้าม DROP"));
check("load_skill: คืนเนื้อหาเต็มเมื่อมี และข้อความชัดเจนเมื่อไม่มี", found.includes("คืนได้ภายใน 7 วัน") && missing === "ไม่พบ skill: xyz");
check("prompt รอบแรกไม่มีเนื้อหาเต็ม", firstSystem?.type === "system" && !firstSystem.text.includes("ห้าม DROP"));
check("โหลด skill แล้วเนื้อหาเต็มเข้ามารอบถัดไป โดย skill ที่ไม่ได้โหลดไม่เข้ามา", r.messages.at(-1)?.text === "ใช้ SELECT" && secondCall.includes("ห้าม DROP") && !secondCall.includes("คืนได้ภายใน 7 วัน"));
check("โมเดลจริงโหลด skill แล้วตอบว่า 7 วัน", (real.messages.at(-1)?.text ?? "").includes("7"));

import { HumanMessage } from "@langchain/core/messages";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { SKILLS, buildSkillAgent, makeLoadSkillTool, skillIndex } from "./skills";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("รายการ skill มีชื่อและคำอธิบายสั้น แต่ไม่มีเนื้อหาเต็ม", () => {
  const index = skillIndex(SKILLS);
  expect(index).toContain("- sql: เขียน query ฐานข้อมูล");
  expect(index).toContain("- refund: นโยบายคืนเงิน");
  expect(index).not.toContain("ห้าม DROP");
});

test("load_skill: คืนเนื้อหาเต็มเมื่อมี และข้อความชัดเจนเมื่อไม่มี", async () => {
  const load = makeLoadSkillTool(SKILLS);
  expect(await load.invoke({ name: "refund" })).toContain("คืนได้ภายใน 7 วัน");
  expect(await load.invoke({ name: "xyz" })).toBe("ไม่พบ skill: xyz");
});

test("agent: prompt มีเฉพาะรายการ พอโหลด skill แล้วเนื้อหาเต็มเข้ามาในรอบถัดไป", async () => {
  const llm = fakeToolLLM([{ toolCalls: [{ name: "load_skill", args: { name: "sql" }, id: "s1" }] }, "ใช้ SELECT"]);
  const r = await buildSkillAgent(llm).invoke({ messages: [new HumanMessage("เขียน query ให้หน่อย")] });
  expect(r.messages.at(-1)?.text).toBe("ใช้ SELECT");

  const firstSystem = llm.calls[0][0];
  expect(firstSystem.type).toBe("system");
  expect(firstSystem.text).not.toContain("ห้าม DROP");

  const secondCall = llm.calls[1].map((m) => m.text).join("\n");
  expect(secondCall).toContain("ห้าม DROP");
  expect(secondCall).not.toContain("คืนได้ภายใน 7 วัน"); // skill ที่ไม่ได้โหลดไม่เข้ามา
});

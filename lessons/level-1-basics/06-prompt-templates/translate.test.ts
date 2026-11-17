import { fakeLLM } from "@src/fakeLLM";
import { buildTranslatePrompt, translate } from "./translate";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("แม่แบบสร้างข้อความ system และ human โดยเติมค่าลงช่อง {language} {text}", async () => {
  const messages = await buildTranslatePrompt().formatMessages({ language: "อังกฤษ", text: "สวัสดี" });
  expect(messages).toHaveLength(2);
  expect(messages[0].type).toBe("system");
  expect(String(messages[0].content)).toContain("อังกฤษ");
  expect(messages[1].type).toBe("human");
  expect(String(messages[1].content)).toBe("สวัสดี");
});

test("translate คืนข้อความที่ LLM ตอบ", async () => {
  expect(await translate(fakeLLM(["Hello"]), "อังกฤษ", "สวัสดี")).toBe("Hello");
});

test("translate ส่งข้อความที่เติมช่องแล้วไปให้ LLM", async () => {
  const llm = fakeLLM(["x"]);
  const generate = vi.spyOn(llm as unknown as { _generate: (...a: unknown[]) => unknown }, "_generate");
  await translate(llm, "ญี่ปุ่น", "ขอบคุณ");
  const sent = generate.mock.calls[0][0] as { type: string; content: string }[];
  expect(sent.map((m) => m.type)).toEqual(["system", "human"]);
  expect(sent[0].content).toContain("ญี่ปุ่น");
  expect(sent[1].content).toBe("ขอบคุณ");
});

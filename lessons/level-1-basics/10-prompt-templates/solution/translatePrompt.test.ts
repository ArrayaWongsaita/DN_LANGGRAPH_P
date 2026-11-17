import { fakeLLM } from "../../../../src/fakeLLM";
import { translatePrompt } from "./translatePrompt";

test("ใส่ตัวแปร language และ text ลงในข้อความ", async () => {
  const msgs = await translatePrompt.formatMessages({ language: "อังกฤษ", text: "สวัสดี" });
  const all = msgs.map((m) => String(m.content)).join(" ");
  expect(all).toContain("อังกฤษ");
  expect(all).toContain("สวัสดี");
});

test("ขาดตัวแปรต้อง reject", async () => {
  await expect(translatePrompt.formatMessages({ language: "อังกฤษ" })).rejects.toThrow();
});

test("pipe เข้า LLM แล้วได้คำตอบ", async () => {
  const chain = translatePrompt.pipe(fakeLLM(["Hello"]));
  const result = await chain.invoke({ language: "อังกฤษ", text: "สวัสดี" });
  expect(result.content).toBe("Hello");
});

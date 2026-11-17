import { AIMessage } from "@langchain/core/messages";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { askAll, totalTokens } from "./usage";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) LLM ปลอมนับ token ให้: input = จำนวนข้อความ, output = ความยาวคำตอบ
test("totalTokens อ่าน total_tokens", () => {
  const m = new AIMessage({ content: "x", usage_metadata: { input_tokens: 3, output_tokens: 4, total_tokens: 7 } });
  expect(totalTokens(m)).toBe(7);
});

test("totalTokens: ไม่มี usage_metadata ได้ 0", () => {
  expect(totalTokens(new AIMessage("x"))).toBe(0);
});

test("askAll รวม token ของทุกคำถาม", async () => {
  // คำตอบ "ab" = 1+2 = 3 token, "cde" = 1+3 = 4 token
  const result = await askAll(fakeToolLLM(["ab", "cde"]), ["ก", "ข"]);
  expect(result.answers).toEqual(["ab", "cde"]);
  expect(result.tokens).toBe(7);
});

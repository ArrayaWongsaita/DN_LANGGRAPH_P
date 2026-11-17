import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildChain } from "./chain";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("ร่างยาวพอ: ผ่านด่านไปขัดเกลา และ prompt ขัดเกลามีร่างอยู่ข้างใน", async () => {
  const llm = fakeToolLLM(["ร่างที่ยาวพอสมควร", "ฉบับขัดเกลา"]);
  const r = await buildChain(llm).invoke({ topic: "ทะเล" });
  expect(r.final).toBe("ฉบับขัดเกลา");
  expect(llm.calls[0][0].text).toContain("ทะเล");
  expect(llm.calls[1][0].text).toContain("ร่างที่ยาวพอสมควร");
});

test("ร่างสั้นเกินไป: หยุดที่ด่าน ไม่เรียก LLM ขั้นขัดเกลา", async () => {
  const llm = fakeToolLLM(["สั้น"]);
  const r = await buildChain(llm).invoke({ topic: "ทะเล" });
  expect(r.final).toBe("ร่างสั้นเกินไป");
  expect(llm.calls).toHaveLength(1);
});

test("เส้นแบ่งที่ 10 ตัวอักษรพอดี", async () => {
  const llm = fakeToolLLM(["1234567890", "ok"]);
  expect((await buildChain(llm).invoke({ topic: "x" })).final).toBe("ok");
});

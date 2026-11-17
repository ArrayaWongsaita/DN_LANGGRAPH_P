import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildFewShot, classify } from "./fewshot";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const examples = [
  { input: "อาหารอร่อยมาก", output: "บวก" },
  { input: "รอนานเกินไป", output: "ลบ" },
];

test("โครงข้อความ: system, คู่ตัวอย่างสลับ human/ai, แล้วคำถามจริง", () => {
  const msgs = buildFewShot(examples, "บริการดี");
  expect(msgs.map((m) => m.type)).toEqual(["system", "human", "ai", "human", "ai", "human"]);
  expect(msgs.slice(1).map((m) => m.text)).toEqual(["อาหารอร่อยมาก", "บวก", "รอนานเกินไป", "ลบ", "บริการดี"]);
});

test("ไม่มีตัวอย่าง: เหลือ system กับคำถาม", () => {
  expect(buildFewShot([], "x").map((m) => m.type)).toEqual(["system", "human"]);
});

test("classify ส่งข้อความ few-shot ให้ LLM และตัดช่องว่างของคำตอบ", async () => {
  const llm = fakeToolLLM(["  บวก \n"]);
  expect(await classify(llm, examples, "บริการดี")).toBe("บวก");
  expect(llm.calls[0]).toHaveLength(6);
});

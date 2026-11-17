import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildOptimizer } from "./optimizer";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) สคริปต์สลับ: เขียน, ตรวจ, เขียน, ตรวจ, ...
const reject = (f: string) => JSON.stringify({ approved: false, feedback: f });
const accept = JSON.stringify({ approved: true, feedback: "" });

test("ผ่านตั้งแต่รอบแรก: หยุดทันที", async () => {
  const r = await buildOptimizer(fakeToolLLM(["ร่าง1", accept])).invoke({ topic: "ทะเล" });
  expect(r.round).toBe(1);
  expect(r.draft).toBe("ร่าง1");
  expect(r.approved).toBe(true);
});

test("ไม่ผ่านรอบแรก: เขียนใหม่โดยใส่ข้อติลงใน prompt แล้วผ่านรอบสอง", async () => {
  const llm = fakeToolLLM(["ร่าง1", reject("สั้นไป"), "ร่าง2", accept]);
  const r = await buildOptimizer(llm).invoke({ topic: "ทะเล" });
  expect(r.round).toBe(2);
  expect(r.draft).toBe("ร่าง2");
  expect(llm.calls[0][0].text).not.toContain("สั้นไป");
  expect(llm.calls[2][0].text).toContain("สั้นไป");
});

test("ไม่ผ่านตลอด: หยุดที่เพดาน 3 รอบ และคืนร่างล่าสุด", async () => {
  const llm = fakeToolLLM(["ร่าง1", reject("ก"), "ร่าง2", reject("ข"), "ร่าง3", reject("ค"), "ไม่ควรถึง"]);
  const r = await buildOptimizer(llm).invoke({ topic: "x" });
  expect(r.round).toBe(3);
  expect(r.draft).toBe("ร่าง3");
  expect(r.approved).toBe(false);
  expect(llm.calls).toHaveLength(6);
});

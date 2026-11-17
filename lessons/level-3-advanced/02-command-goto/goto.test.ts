import { buildGotoGraph } from "./goto";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("ยอดสูง: ไป premium และ update ถูกนำไปใช้", async () => {
  expect((await buildGotoGraph().invoke({ amount: 5000 })).log).toBe("triage>premium");
});

test("ยอดต่ำ: ไป basic", async () => {
  expect((await buildGotoGraph().invoke({ amount: 10 })).log).toBe("triage>basic");
});

test("เส้นแบ่งอยู่ที่ 1000 พอดี", async () => {
  expect((await buildGotoGraph().invoke({ amount: 1000 })).log).toBe("triage>premium");
  expect((await buildGotoGraph().invoke({ amount: 999 })).log).toBe("triage>basic");
});

test("ประกาศ ends แล้ว graph วาดเส้นทางครบ (premium และ basic)", async () => {
  const mermaid = (await buildGotoGraph().getGraphAsync()).drawMermaid();
  expect(mermaid).toContain("triage -.-> premium");
  expect(mermaid).toContain("triage -.-> basic");
});

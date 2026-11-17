import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildSwarm, talk } from "./swarm";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const say = (reply: string, handoffTo?: string) => JSON.stringify({ reply, ...(handoffTo ? { handoffTo } : {}) });

test("เริ่มที่ alice และตอบเองถ้าไม่ต้องส่งต่อ", async () => {
  const r = await talk(buildSwarm(fakeToolLLM([say("สนใจรุ่นไหนคะ")])), "อยากซื้อ");
  expect(r).toEqual({ reply: "สนใจรุ่นไหนคะ", active: "alice" });
});

test("alice ส่งต่อให้ bob: bob ตอบ และ active กลายเป็น bob", async () => {
  const llm = fakeToolLLM([say("ขอส่งต่อฝ่ายซัพพอร์ต", "bob"), say("bob ช่วยแก้ให้ครับ")]);
  const r = await talk(buildSwarm(llm), "สินค้าพัง");
  expect(r.active).toBe("bob");
  expect(r.reply).toBe("bob ช่วยแก้ให้ครับ");
  expect(llm.calls[1][0].text).toContain("bob");
});

test("ข้อความถัดไปของผู้ใช้ไปหา bob โดยตรง (จำ active ข้ามรอบ)", async () => {
  const llm = fakeToolLLM([say("ส่งต่อ", "bob"), say("bob รับเรื่อง"), say("bob ตอบต่อ")]);
  const g = buildSwarm(llm);
  await talk(g, "สินค้าพัง");
  const r = await talk(g, "ยังไม่หาย");
  expect(r.active).toBe("bob");
  expect(llm.calls[2][0].text).toContain("คุณคือ bob");
});

test("ส่งต่อให้ตัวเองถือว่าตอบเอง ไม่วน", async () => {
  const r = await talk(buildSwarm(fakeToolLLM([say("ฉันเอง", "alice")])), "x");
  expect(r.active).toBe("alice");
});

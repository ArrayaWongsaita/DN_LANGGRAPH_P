import { fakeFetch } from "@src/fakeFetch";
import { appendTurn, chat } from "./chat";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const reply = (text: string) => ({ body: { choices: [{ message: { role: "assistant", content: text } }] } });

const base = (fetchFn: typeof fetch) => ({
  fetchFn,
  url: "https://llm.test/v1/chat/completions",
  apiKey: "k",
  model: "m",
  system: "ตอบสั้น ๆ",
});

test("messages เรียงเป็น system, ประวัติ, แล้วคำถามใหม่", async () => {
  const f = fakeFetch([reply("มาลี")]);
  const history = [
    { role: "user" as const, content: "ฉันชื่อมาลี" },
    { role: "assistant" as const, content: "ยินดีที่ได้รู้จัก" },
  ];
  await chat({ ...base(f), history, question: "ฉันชื่ออะไร" });
  const body = JSON.parse(String(f.calls[0].init?.body));
  expect(body.messages).toEqual([
    { role: "system", content: "ตอบสั้น ๆ" },
    { role: "user", content: "ฉันชื่อมาลี" },
    { role: "assistant", content: "ยินดีที่ได้รู้จัก" },
    { role: "user", content: "ฉันชื่ออะไร" },
  ]);
});

test("ไม่มีประวัติ: ส่งแค่ system กับคำถาม และคืนข้อความคำตอบ", async () => {
  const f = fakeFetch([reply("สวัสดี")]);
  const answer = await chat({ ...base(f), history: [], question: "ทัก" });
  expect(answer).toBe("สวัสดี");
  const body = JSON.parse(String(f.calls[0].init?.body));
  expect(body.messages.map((m: { role: string }) => m.role)).toEqual(["system", "user"]);
});

test("appendTurn คืนประวัติใหม่ที่ต่อท้ายด้วยคำถาม (user) และคำตอบ (assistant)", () => {
  const history = [{ role: "user" as const, content: "a" }];
  const next = appendTurn(history, "b", "c");
  expect(next).toEqual([
    { role: "user", content: "a" },
    { role: "user", content: "b" },
    { role: "assistant", content: "c" },
  ]);
});

test("appendTurn ไม่แก้ array ประวัติเดิม", () => {
  const history = [{ role: "user" as const, content: "a" }];
  appendTurn(history, "b", "c");
  expect(history).toHaveLength(1);
});

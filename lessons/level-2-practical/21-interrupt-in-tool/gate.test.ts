import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildMailAgent, request, respond } from "./gate";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const script = () => [{ toolCalls: [{ name: "sendEmail", args: { to: "a@b.c" } }] }, "จัดการเรียบร้อย"];

test("agent จะส่งอีเมล: หยุดรออนุมัติก่อน ยังไม่ส่งจริง", async () => {
  const sent: string[] = [];
  const agent = buildMailAgent(fakeToolLLM(script()), sent);
  expect(await request(agent, "t", "ส่งเมลหา a@b.c")).toBe(true);
  expect(sent).toEqual([]);
});

test("อนุมัติ: ส่งจริงหนึ่งครั้ง และ agent ตอบต่อ", async () => {
  const sent: string[] = [];
  const llm = fakeToolLLM(script());
  const agent = buildMailAgent(llm, sent);
  await request(agent, "t", "ส่งเมลหา a@b.c");
  expect(await respond(agent, "t", true)).toBe("จัดการเรียบร้อย");
  expect(sent).toEqual(["a@b.c"]);
  expect(llm.calls[1].at(-1)?.text).toBe("ส่งอีเมลถึง a@b.c แล้ว");
});

test("ปฏิเสธ: ไม่ส่ง และ LLM เห็นข้อความยกเลิก", async () => {
  const sent: string[] = [];
  const llm = fakeToolLLM(script());
  const agent = buildMailAgent(llm, sent);
  await request(agent, "t", "ส่งเมลหา a@b.c");
  await respond(agent, "t", false);
  expect(sent).toEqual([]);
  expect(llm.calls[1].at(-1)?.text).toBe("ยกเลิกแล้ว");
});

test("LLM ถูกเรียกแค่ 2 ครั้ง (ขอเรียก tool + สรุป) แม้ resume ทำให้ tool รันใหม่", async () => {
  const llm = fakeToolLLM(script());
  const agent = buildMailAgent(llm, []);
  await request(agent, "t", "ส่งเมล");
  await respond(agent, "t", true);
  expect(llm.calls).toHaveLength(2);
});

import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildGuardedAgent, decide, request } from "./hitl";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const script = () => [{ toolCalls: [{ name: "sendEmail", args: { to: "a@b.c" } }] }, "เรียบร้อย"];

test("agent จะส่งอีเมล: หยุดรออนุมัติ ยังไม่ส่งจริง (ทั้งที่ตัว tool ไม่มี interrupt)", async () => {
  const sent: string[] = [];
  const agent = buildGuardedAgent(fakeToolLLM(script()), sent);
  expect(await request(agent, "t", "ส่งเมล")).toBe(true);
  expect(sent).toEqual([]);
});

test("อนุมัติ: ส่งจริงหนึ่งครั้ง และ agent ตอบต่อ", async () => {
  const sent: string[] = [];
  const agent = buildGuardedAgent(fakeToolLLM(script()), sent);
  await request(agent, "t", "ส่งเมล");
  expect(await decide(agent, "t", true)).toBe("เรียบร้อย");
  expect(sent).toEqual(["a@b.c"]);
});

test("ปฏิเสธ: ไม่ส่ง และโมเดลเห็นเหตุผลที่ปฏิเสธ", async () => {
  const sent: string[] = [];
  const llm = fakeToolLLM(script());
  const agent = buildGuardedAgent(llm, sent);
  await request(agent, "t", "ส่งเมล");
  await decide(agent, "t", false);
  expect(sent).toEqual([]);
  expect(llm.calls[1].at(-1)?.text).toContain("ไม่อนุมัติ");
});

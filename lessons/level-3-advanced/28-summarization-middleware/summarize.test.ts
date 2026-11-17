import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildSummarizingAgent, say } from "./summarize";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) โมเดลสรุปแยกเป็นอีกตัว จึงรู้แน่ว่าคำสรุปมาจากไหน
const chatScript = () => ["a", "b", "c", "d", "e", "f", "g"];
const summary = () => fakeToolLLM(["SUMMARY-TEXT", "SUMMARY-TEXT", "SUMMARY-TEXT"]);

test("แชตสั้น ยังไม่ถึงเกณฑ์: ประวัติครบ และไม่เรียกโมเดลสรุป", async () => {
  const s = summary();
  const agent = buildSummarizingAgent(fakeToolLLM(chatScript()), s);
  await say(agent, "1");
  const r = await say(agent, "2");
  expect(r.messages).toHaveLength(4);
  expect(s.calls).toHaveLength(0);
});

test("แชตยาวเกินเกณฑ์: เรียกโมเดลสรุป และประวัติสั้นลง", async () => {
  const s = summary();
  const agent = buildSummarizingAgent(fakeToolLLM(chatScript()), s);
  let r;
  for (const t of ["1", "2", "3", "4"]) r = await say(agent, t);
  expect(s.calls.length).toBeGreaterThan(0);
  expect(r!.messages.length).toBeLessThan(8);
});

test("ข้อความสรุปอยู่ในประวัติ", async () => {
  const agent = buildSummarizingAgent(fakeToolLLM(chatScript()), summary());
  let r;
  for (const t of ["1", "2", "3", "4"]) r = await say(agent, t);
  expect(r!.messages.some((m) => m.text.includes("SUMMARY-TEXT"))).toBe(true);
});

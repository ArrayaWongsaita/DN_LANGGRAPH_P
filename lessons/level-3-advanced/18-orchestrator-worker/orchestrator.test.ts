import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildOrchestrator } from "./orchestrator";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) สคริปต์: แผน (JSON) → คนงานต่อ task → สังเคราะห์
test("วางแผน แตกงาน คนงานทำครบ แล้วสังเคราะห์เป็นรายงาน", async () => {
  const llm = fakeToolLLM(['{"tasks":["หาข้อมูล","เขียนสรุป"]}', "ผลงาน1", "ผลงาน2", "รายงานฉบับเต็ม"]);
  const r = await buildOrchestrator(llm).invoke({ goal: "ทำรายงาน" });
  expect(r.tasks).toEqual(["หาข้อมูล", "เขียนสรุป"]);
  expect([...r.results].sort()).toEqual(["ผลงาน1", "ผลงาน2"]);
  expect(r.report).toBe("รายงานฉบับเต็ม");
});

test("คนงานแต่ละตัวได้งานของตัวเอง", async () => {
  const llm = fakeToolLLM(['{"tasks":["ก","ข"]}', "x", "y", "รวม"]);
  await buildOrchestrator(llm).invoke({ goal: "g" });
  const workerPrompts = [llm.calls[1][0].text, llm.calls[2][0].text].sort();
  expect(workerPrompts).toEqual(["ทำงานย่อย: ก", "ทำงานย่อย: ข"]);
});

test("ขั้นสังเคราะห์เห็นผลของคนงานทั้งหมด", async () => {
  const llm = fakeToolLLM(['{"tasks":["ก","ข"]}', "ผลก", "ผลข", "รวม"]);
  await buildOrchestrator(llm).invoke({ goal: "g" });
  const prompt = llm.calls[3][0].text;
  expect(prompt).toContain("ผลก");
  expect(prompt).toContain("ผลข");
});

test("จำกัดงานย่อยไม่เกิน 5 ชิ้น แม้ LLM แตกมาเยอะ", async () => {
  const many = JSON.stringify({ tasks: Array.from({ length: 9 }, (_, i) => `t${i}`) });
  const llm = fakeToolLLM([many, ...Array(5).fill("ok"), "รวม"]);
  const r = await buildOrchestrator(llm).invoke({ goal: "g" });
  expect(r.tasks).toHaveLength(5);
  expect(r.results).toHaveLength(5);
});

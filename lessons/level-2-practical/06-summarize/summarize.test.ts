import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildSummarizingChat, chat } from "./summarize";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
// สคริปต์ LLM ปลอม: รอบที่ 1-3 ตอบแชต, ครั้งที่ 4 คือการสรุป, ครั้งที่ 5 ตอบแชตรอบที่ 4
const script = ["r1", "r2", "r3", "สรุป: ผู้ใช้ชื่อมาลี", "r4"];

test("ยังไม่ยาวเกินเกณฑ์: ไม่สรุป ข้อความครบ", async () => {
  const llm = fakeToolLLM(script);
  const graph = buildSummarizingChat(llm);
  await chat(graph, "1");
  const result = await chat(graph, "2");
  expect(result.messages).toHaveLength(4);
  expect(result.summary).toBe("");
  expect(llm.calls).toHaveLength(2);
});

test("ยาวเกินเกณฑ์: สรุป เก็บข้อความล่าสุด 2 ข้อความ", async () => {
  const graph = buildSummarizingChat(fakeToolLLM(script));
  await chat(graph, "1");
  await chat(graph, "2");
  const result = await chat(graph, "3");
  expect(result.summary).toBe("สรุป: ผู้ใช้ชื่อมาลี");
  expect(result.messages.map((m) => m.text)).toEqual(["3", "r3"]);
});

test("การเรียกสรุปส่งประวัติทั้งหมดให้ LLM", async () => {
  const llm = fakeToolLLM(script);
  const graph = buildSummarizingChat(llm);
  for (const t of ["1", "2", "3"]) await chat(graph, t);
  expect(llm.calls[3].length).toBeGreaterThanOrEqual(7);
});

test("รอบถัดไป LLM เห็นสรุปเป็น SystemMessage นำหน้า", async () => {
  const llm = fakeToolLLM(script);
  const graph = buildSummarizingChat(llm);
  for (const t of ["1", "2", "3", "4"]) await chat(graph, t);
  const lastCall = llm.calls[4];
  expect(lastCall[0].type).toBe("system");
  expect(lastCall[0].text).toContain("สรุป: ผู้ใช้ชื่อมาลี");
  expect(lastCall.slice(1).map((m) => m.text)).toEqual(["3", "r3", "4"]);
});

test("สรุปรอบที่สองต้องรวมสรุปรอบแรกเข้าไปด้วย (เนื้อหาเก่าไม่หาย)", async () => {
  const llm = fakeToolLLM(["r1", "r2", "r3", "S1", "r4", "r5", "S2"]);
  const graph = buildSummarizingChat(llm);
  for (const t of ["1", "2", "3", "4", "5"]) await chat(graph, t);
  const secondSummaryCall = llm.calls[6];
  expect(secondSummaryCall.some((m) => m.text.includes("S1"))).toBe(true);
});

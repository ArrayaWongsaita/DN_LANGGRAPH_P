import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildTrimmedChat, chat } from "./trim";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("ประวัติสั้นกว่างบ: ส่งให้ LLM ครบ", async () => {
  const llm = fakeToolLLM(["ก", "ข"]);
  const graph = buildTrimmedChat(llm, 5);
  await chat(graph, "1");
  await chat(graph, "2");
  expect(llm.calls[1].map((m) => m.text)).toEqual(["1", "ก", "2"]);
});

test("ประวัติยาวกว่างบ: LLM เห็นแค่ข้อความล่าสุด และขึ้นต้นด้วยข้อความผู้ใช้", async () => {
  const llm = fakeToolLLM(["ก", "ข", "ค", "ง"]);
  const graph = buildTrimmedChat(llm, 3);
  for (const t of ["1", "2", "3", "4"]) await chat(graph, t);
  expect(llm.calls[3].map((m) => m.text)).toEqual(["3", "ค", "4"]);
  expect(llm.calls[3][0].type).toBe("human");
});

test("State ยังเก็บข้อความครบทุกข้อความ ไม่ถูกตัด", async () => {
  const llm = fakeToolLLM(["ก", "ข", "ค", "ง"]);
  const graph = buildTrimmedChat(llm, 3);
  let result;
  for (const t of ["1", "2", "3", "4"]) result = await chat(graph, t);
  expect(result!.messages).toHaveLength(8);
});

test("งบเป็นเลขที่ตัดกลางคู่: ผลต้องขึ้นต้นด้วยข้อความผู้ใช้เสมอ (ไม่ใช่แค่ตัดท้าย)", async () => {
  const llm = fakeToolLLM(["ก", "ข", "ค"]);
  const graph = buildTrimmedChat(llm, 4);
  for (const t of ["1", "2", "3"]) await chat(graph, t);
  expect(llm.calls[2].map((m) => m.text)).toEqual(["2", "ข", "3"]);
});

import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildMemoryChat, chat } from "./memory";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("รอบสอง LLM เห็นประวัติรอบแรก (ข้อความของผู้ใช้ + คำตอบ + ข้อความใหม่)", async () => {
  const llm = fakeToolLLM(["สวัสดีมาลี", "ชื่อมาลี"]);
  const graph = buildMemoryChat(llm);
  await chat(graph, "ฉันชื่อมาลี");
  await chat(graph, "ฉันชื่ออะไร");
  expect(llm.calls[1].map((m) => m.text)).toEqual(["ฉันชื่อมาลี", "สวัสดีมาลี", "ฉันชื่ออะไร"]);
});

test("ผ่านไปหลายรอบ ประวัติสะสมต่อเนื่อง", async () => {
  const llm = fakeToolLLM(["1", "2", "3"]);
  const graph = buildMemoryChat(llm);
  for (const t of ["a", "b", "c"]) await chat(graph, t);
  expect(llm.calls[2]).toHaveLength(5);
});

test("คืนคำตอบล่าสุดเป็นสตริง", async () => {
  const graph = buildMemoryChat(fakeToolLLM(["โอเค"]));
  expect(await chat(graph, "x")).toBe("โอเค");
});

import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildChat, chat, makeThreadId } from "./threads";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("makeThreadId ประกอบรหัสจากผู้ใช้และหัวข้อ", () => {
  expect(makeThreadId("mali", "งาน")).toBe("mali:งาน");
});

test("thread เดียวกันจำประวัติ", async () => {
  const llm = fakeToolLLM(["a", "b"]);
  const graph = buildChat(llm);
  await chat(graph, "t1", "หนึ่ง");
  await chat(graph, "t1", "สอง");
  expect(llm.calls[1]).toHaveLength(3);
});

test("thread คนละอัน ประวัติแยกกัน", async () => {
  const llm = fakeToolLLM(["a", "b", "c"]);
  const graph = buildChat(llm);
  await chat(graph, "mali", "ฉันชื่อมาลี");
  await chat(graph, "somchai", "ฉันชื่อสมชาย");
  expect(llm.calls[1].map((m) => m.text)).toEqual(["ฉันชื่อสมชาย"]);
  await chat(graph, "mali", "ฉันชื่ออะไร");
  expect(llm.calls[2].map((m) => m.text)).toEqual(["ฉันชื่อมาลี", "a", "ฉันชื่ออะไร"]);
});

test("ผู้ใช้คนเดียวกันคนละหัวข้อ แยก thread กัน", async () => {
  const llm = fakeToolLLM(["a", "b"]);
  const graph = buildChat(llm);
  await chat(graph, makeThreadId("mali", "งาน"), "เรื่องงาน");
  await chat(graph, makeThreadId("mali", "เที่ยว"), "เรื่องเที่ยว");
  expect(llm.calls[1]).toHaveLength(1);
});

import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildChat, chat, deleteMessage, getHistory } from "./state";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("getHistory คืนข้อความทั้งหมดของ thread ตามลำดับ", async () => {
  const graph = buildChat(fakeToolLLM(["ก", "ข"]));
  await chat(graph, "t", "1");
  await chat(graph, "t", "2");
  const history = await getHistory(graph, "t");
  expect(history.map((m) => m.text)).toEqual(["1", "ก", "2", "ข"]);
});

test("getHistory ของ thread ที่ยังไม่เคยคุย คืนรายการว่าง", async () => {
  const graph = buildChat(fakeToolLLM(["x"]));
  expect(await getHistory(graph, "ใหม่")).toEqual([]);
});

test("deleteMessage ลบข้อความตาม index ออกจาก State", async () => {
  const graph = buildChat(fakeToolLLM(["ก", "ข"]));
  await chat(graph, "t", "1");
  await chat(graph, "t", "2");
  await deleteMessage(graph, "t", 0);
  expect((await getHistory(graph, "t")).map((m) => m.text)).toEqual(["ก", "2", "ข"]);
});

test("ข้อความที่ถูกลบ LLM ไม่เห็นในรอบถัดไป", async () => {
  const llm = fakeToolLLM(["ก", "ข", "ค"]);
  const graph = buildChat(llm);
  await chat(graph, "t", "ความลับ");
  await deleteMessage(graph, "t", 0);
  await chat(graph, "t", "ต่อ");
  expect(llm.calls[1].map((m) => m.text)).toEqual(["ก", "ต่อ"]);
});

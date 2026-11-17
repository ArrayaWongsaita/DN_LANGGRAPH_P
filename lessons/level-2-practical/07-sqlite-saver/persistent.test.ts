import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildPersistentChat, chat, makeSaver } from "./persistent";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "lg-sqlite-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

test("ความจำทำงานตามปกติภายในโปรแกรมเดียวกัน", async () => {
  const llm = fakeToolLLM(["ก", "ข"]);
  const graph = buildPersistentChat(llm, makeSaver(join(dir, "m.db")));
  await chat(graph, "1");
  await chat(graph, "2");
  expect(llm.calls[1]).toHaveLength(3);
});

test("'รีสตาร์ต': สร้าง saver และ graph ใหม่จากไฟล์เดิม ยังจำบทสนทนาเดิมได้", async () => {
  const file = join(dir, "m.db");
  await chat(buildPersistentChat(fakeToolLLM(["สวัสดีมาลี"]), makeSaver(file)), "ฉันชื่อมาลี");

  const llm2 = fakeToolLLM(["ชื่อมาลี"]);
  await chat(buildPersistentChat(llm2, makeSaver(file)), "ฉันชื่ออะไร");
  expect(llm2.calls[0].map((m) => m.text)).toEqual(["ฉันชื่อมาลี", "สวัสดีมาลี", "ฉันชื่ออะไร"]);
});

test("คนละไฟล์ = คนละความจำ", async () => {
  await chat(buildPersistentChat(fakeToolLLM(["ก"]), makeSaver(join(dir, "a.db"))), "ข้อความใน a");
  const llm = fakeToolLLM(["ข"]);
  await chat(buildPersistentChat(llm, makeSaver(join(dir, "b.db"))), "ข้อความใน b");
  expect(llm.calls[0]).toHaveLength(1);
});

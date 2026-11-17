import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { InMemoryStore, MemorySaver } from "@langchain/langgraph";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildApp, decide, start } from "./app";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "lg-capstone-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

test("เริ่มงาน: ส่งความคืบหน้าตามลำดับ และหยุดรออนุมัติพร้อมรายงาน", async () => {
  const app = buildApp(fakeToolLLM(["รายงานเรื่องทะเล"]), new MemorySaver(), new InMemoryStore());
  const r = await start(app, "t", "u1", "ทะเล");
  expect(r.stages).toEqual(["prepare", "draft"]);
  expect(r.waiting).toBe(true);
  expect(r.report).toBe("รายงานเรื่องทะเล");
});

test("อนุมัติ: เผยแพร่รายงาน", async () => {
  const app = buildApp(fakeToolLLM(["รายงาน"]), new MemorySaver(), new InMemoryStore());
  await start(app, "t", "u1", "x");
  expect(await decide(app, "t", "u1", true)).toBe("เผยแพร่แล้ว: รายงาน");
});

test("ไม่อนุมัติ: ไม่เผยแพร่", async () => {
  const app = buildApp(fakeToolLLM(["รายงาน"]), new MemorySaver(), new InMemoryStore());
  await start(app, "t", "u1", "x");
  expect(await decide(app, "t", "u1", false)).toBe("ไม่เผยแพร่");
});

test("ภาษาที่ชอบมาจาก Store: ใช้ภาษาที่ผู้ใช้ตั้ง และใช้ th ถ้าไม่ได้ตั้ง", async () => {
  const store = new InMemoryStore();
  await store.put(["prefs", "u2"], "lang", { lang: "en" });
  const llm = fakeToolLLM(["r1", "r2"]);
  const app = buildApp(llm, new MemorySaver(), store);
  await start(app, "a", "u2", "x");
  await start(app, "b", "u1", "x");
  expect(llm.calls[0][0].text).toContain("ภาษา en");
  expect(llm.calls[1][0].text).toContain("ภาษา th");
});

test("หยุดรออนุมัติ แล้ว 'รีสตาร์ต': สร้างแอปใหม่จากไฟล์เดิมและอนุมัติต่อได้", async () => {
  const file = join(dir, "c.db");
  const store = new InMemoryStore();
  const first = buildApp(fakeToolLLM(["รายงานก่อนปิด"]), SqliteSaver.fromConnString(file), store);
  await start(first, "t", "u1", "x");

  const llm2 = fakeToolLLM([]);
  const second = buildApp(llm2, SqliteSaver.fromConnString(file), store);
  expect(await decide(second, "t", "u1", true)).toBe("เผยแพร่แล้ว: รายงานก่อนปิด");
  expect(llm2.calls).toHaveLength(0);
});

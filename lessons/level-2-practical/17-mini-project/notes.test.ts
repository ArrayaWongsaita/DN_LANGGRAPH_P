import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildNoteAssistant, makeNoteTools, say } from "./notes";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "lg-notes-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

test("addNote เก็บโน้ตลง store และคืนข้อความยืนยัน", async () => {
  const store: string[] = [];
  const [addNote] = makeNoteTools(store);
  expect(await addNote.invoke({ text: "ประชุมสิบโมง" })).toBe("บันทึกแล้ว: ประชุมสิบโมง");
  expect(store).toEqual(["ประชุมสิบโมง"]);
});

test("listNotes: ว่างและมีโน้ต", async () => {
  const store: string[] = [];
  const [, listNotes] = makeNoteTools(store);
  expect(await listNotes.invoke({})).toBe("ยังไม่มีโน้ต");
  store.push("ก", "ข");
  expect(await listNotes.invoke({})).toBe("1. ก\n2. ข");
});

test("agent จดโน้ตผ่าน tool แล้วตอบผู้ใช้", async () => {
  const store: string[] = [];
  const llm = fakeToolLLM([
    { toolCalls: [{ name: "addNote", args: { text: "ซื้อนม" } }] },
    "จดให้แล้วครับ",
  ]);
  const agent = buildNoteAssistant(llm, store, SqliteSaver.fromConnString(join(dir, "m.db")));
  expect(await say(agent, "จดว่าซื้อนม")).toBe("จดให้แล้วครับ");
  expect(store).toEqual(["ซื้อนม"]);
  expect(llm.boundToolNames).toEqual(["addNote", "listNotes"]);
});

test("รีสตาร์ต: agent ใหม่จากไฟล์เดิมยังจำบทสนทนาเดิม", async () => {
  const file = join(dir, "m.db");
  await say(buildNoteAssistant(fakeToolLLM(["สวัสดีมาลี"]), [], SqliteSaver.fromConnString(file)), "ฉันชื่อมาลี");
  const llm2 = fakeToolLLM(["ชื่อมาลี"]);
  await say(buildNoteAssistant(llm2, [], SqliteSaver.fromConnString(file)), "ฉันชื่ออะไร");
  expect(llm2.calls[0].map((m) => m.text)).toContain("ฉันชื่อมาลี");
});

test("system prompt ถูกส่งให้ LLM", async () => {
  const llm = fakeToolLLM(["x"]);
  await say(buildNoteAssistant(llm, [], SqliteSaver.fromConnString(join(dir, "m.db"))), "x");
  expect(llm.calls[0][0].type).toBe("system");
});

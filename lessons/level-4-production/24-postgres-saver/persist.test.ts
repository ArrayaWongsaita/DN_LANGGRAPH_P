import { MemorySaver } from "@langchain/langgraph";
import { MAX_THREAD_ID, buildChatApp, makePostgresSaver, safeThreadId } from "./persist";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) ไม่ต้องมีฐานข้อมูล ใช้ MemorySaver แทน Postgres ผ่านอินเทอร์เฟซเดียวกัน
const cfg = (threadId: string) => ({ configurable: { thread_id: threadId } });

test("makePostgresSaver สร้างได้โดยไม่เชื่อมต่อ และมี setup/end ให้เรียกทีหลัง", async () => {
  const saver = makePostgresSaver("postgresql://u:p@localhost:59999/none");
  expect(typeof saver.setup).toBe("function");
  expect(typeof saver.end).toBe("function");
  await saver.end();
});

test("แอปรับ checkpointer: จำประวัติข้ามการเรียก", async () => {
  const app = buildChatApp(new MemorySaver());
  await app.invoke({ messages: [{ role: "user", content: "สวัสดี" }] }, cfg("a"));
  const r = await app.invoke({ messages: [{ role: "user", content: "อีกที" }] }, cfg("a"));
  expect(r.messages.at(-1)?.text).toBe("ฉันจำได้ 3 ข้อความ");
});

test("thread แยกกัน", async () => {
  const app = buildChatApp(new MemorySaver());
  await app.invoke({ messages: [{ role: "user", content: "x" }] }, cfg("a"));
  const r = await app.invoke({ messages: [{ role: "user", content: "y" }] }, cfg("b"));
  expect(r.messages.at(-1)?.text).toBe("ฉันจำได้ 1 ข้อความ");
});

test("safeThreadId: สั้นพอคงเดิม ยาวเกินย่อด้วย hash ที่คงที่และไม่เกินขีดจำกัด", () => {
  expect(safeThreadId("user-1")).toBe("user-1");
  const long = "x".repeat(MAX_THREAD_ID + 50);
  const short = safeThreadId(long);
  expect(short.length).toBeLessThanOrEqual(MAX_THREAD_ID);
  expect(short.startsWith("t_")).toBe(true);
  expect(safeThreadId(long)).toBe(short);
  expect(safeThreadId(long + "y")).not.toBe(short);
});

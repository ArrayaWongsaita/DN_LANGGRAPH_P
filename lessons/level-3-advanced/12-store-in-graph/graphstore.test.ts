import { InMemoryStore } from "@langchain/langgraph";
import { buildMemoryGraph, say } from "./graphstore";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) ไม่มี checkpointer เลย: ความจำมาจาก Store ล้วน ๆ
test("เก็บชื่อแล้วเรียกคืนได้ในการเรียกครั้งใหม่", async () => {
  const graph = buildMemoryGraph(new InMemoryStore());
  expect(await say(graph, "u1", "จำชื่อ:มาลี")).toBe("ยินดีที่รู้จัก มาลี");
  expect(await say(graph, "u1", "ฉันชื่ออะไร")).toBe("คุณชื่อ มาลี");
});

test("ยังไม่เคยบอกชื่อ: ตอบว่ายังไม่รู้จัก", async () => {
  const graph = buildMemoryGraph(new InMemoryStore());
  expect(await say(graph, "u1", "ฉันชื่ออะไร")).toBe("ยังไม่รู้จักชื่อคุณ");
});

test("ผู้ใช้คนละคน ความจำแยกกัน", async () => {
  const graph = buildMemoryGraph(new InMemoryStore());
  await say(graph, "u1", "จำชื่อ:มาลี");
  expect(await say(graph, "u2", "ฉันชื่ออะไร")).toBe("ยังไม่รู้จักชื่อคุณ");
});

test("graph ตัวใหม่ที่ใช้ Store เดิมก็ยังจำได้", async () => {
  const store = new InMemoryStore();
  await say(buildMemoryGraph(store), "u1", "จำชื่อ:สมชาย");
  expect(await say(buildMemoryGraph(store), "u1", "ฉันชื่ออะไร")).toBe("คุณชื่อ สมชาย");
});

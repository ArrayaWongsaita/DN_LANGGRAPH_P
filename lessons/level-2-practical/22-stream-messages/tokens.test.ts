import { fakeLLM } from "@src/fakeLLM";
import { buildTwoStepGraph, collectAll, collectFrom } from "./tokens";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) fakeLLM ปล่อยข้อความออกมาทีละชิ้นเหมือนตัวจริง
test("collectAll รวมข้อความของทุก node", async () => {
  const graph = buildTwoStepGraph(fakeLLM(["ร่าง", "ฉบับสวย"]));
  expect(await collectAll(graph, "x")).toBe("ร่างฉบับสวย");
});

test("collectFrom เก็บเฉพาะ node polish", async () => {
  const graph = buildTwoStepGraph(fakeLLM(["ร่าง", "ฉบับสวย"]));
  expect(await collectFrom(graph, "x", "polish")).toBe("ฉบับสวย");
});

test("collectFrom เก็บเฉพาะ node draft", async () => {
  const graph = buildTwoStepGraph(fakeLLM(["ร่าง", "ฉบับสวย"]));
  expect(await collectFrom(graph, "x", "draft")).toBe("ร่าง");
});

test("ข้อความมาเป็นชิ้นย่อยหลายชิ้น (ไม่ใช่ก้อนเดียว)", async () => {
  const graph = buildTwoStepGraph(fakeLLM(["สวัสดีครับ"]));
  const { HumanMessage } = await import("@langchain/core/messages");
  let n = 0;
  for await (const _ of await graph.stream({ messages: [new HumanMessage("x")] }, { streamMode: "messages" })) n++;
  expect(n).toBeGreaterThan(3);
});

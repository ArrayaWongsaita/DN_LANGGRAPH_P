import { HumanMessage } from "@langchain/core/messages";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { ask, buildChatGraph } from "./chat";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("ผลลัพธ์มีข้อความของผู้ใช้ตามด้วยคำตอบของ AI", async () => {
  const graph = buildChatGraph(fakeToolLLM(["สวัสดีครับ"]));
  const result = await graph.invoke({ messages: [new HumanMessage("สวัสดี")] });
  expect(result.messages.map((m) => m.type)).toEqual(["human", "ai"]);
  expect(result.messages[1].text).toBe("สวัสดีครับ");
});

test("LLM ได้รับประวัติข้อความทั้งหมดใน state", async () => {
  const llm = fakeToolLLM(["ตอบ"]);
  await buildChatGraph(llm).invoke({ messages: [new HumanMessage("a"), new HumanMessage("b")] });
  expect(llm.calls[0].map((m) => m.text)).toEqual(["a", "b"]);
});

test("ask คืนข้อความตอบกลับเป็นสตริง", async () => {
  const graph = buildChatGraph(fakeToolLLM(["เจอกัน"]));
  expect(await ask(graph, "ไง")).toBe("เจอกัน");
});

test("ไม่มี checkpointer: ถามรอบสอง LLM ไม่เห็นรอบแรก", async () => {
  const llm = fakeToolLLM(["หนึ่ง", "สอง"]);
  const graph = buildChatGraph(llm);
  await ask(graph, "ฉันชื่อมาลี");
  await ask(graph, "ฉันชื่ออะไร");
  expect(llm.calls[1].map((m) => m.text)).toEqual(["ฉันชื่ออะไร"]);
});

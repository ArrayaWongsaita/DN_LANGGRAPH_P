import { fakeLLM } from "@src/fakeLLM";
import { buildAskGraph } from "./askGraph";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("graph ตอบคำถามด้วยคำตอบของ LLM", async () => {
  const graph = buildAskGraph(fakeLLM(["กรุงเทพฯ"]));
  const result = await graph.invoke({ question: "เมืองหลวงไทยคือ?" });
  expect(result.answer).toBe("กรุงเทพฯ");
  expect(result.question).toBe("เมืองหลวงไทยคือ?");
});

test("node ส่ง question จาก state ไปให้ LLM", async () => {
  const llm = fakeLLM(["x"]);
  const generate = vi.spyOn(llm as unknown as { _generate: (...a: unknown[]) => unknown }, "_generate");
  await buildAskGraph(llm).invoke({ question: "คำถามพิเศษ" });
  const sent = generate.mock.calls[0][0] as { content: string }[];
  expect(sent.map((m) => m.content).join(" ")).toContain("คำถามพิเศษ");
});

test("graph ใช้ซ้ำได้หลายครั้ง", async () => {
  const graph = buildAskGraph(fakeLLM(["หนึ่ง", "สอง"]));
  expect((await graph.invoke({ question: "a" })).answer).toBe("หนึ่ง");
  expect((await graph.invoke({ question: "b" })).answer).toBe("สอง");
});

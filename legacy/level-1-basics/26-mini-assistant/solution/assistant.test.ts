import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { fakeLLM } from "../../../../src/fakeLLM";
import { buildAssistantGraph } from "./assistant";

test("classify แยกคำถามสั้น/ยาวที่ 20 ตัวอักษร", async () => {
  const graph = buildAssistantGraph(fakeLLM(["x"]));
  expect((await graph.invoke({ question: "a".repeat(20) })).kind).toBe("short");
  expect((await graph.invoke({ question: "a".repeat(21) })).kind).toBe("long");
});

test("ส่ง SystemMessage ก่อน แล้วตามด้วย HumanMessage ที่เป็นคำถาม", async () => {
  const llm = fakeLLM(["x"]);
  const spy = vi.spyOn(llm, "invoke");
  await buildAssistantGraph(llm).invoke({ question: "ถามอะไรหน่อย" });
  const messages = spy.mock.calls[0][0] as unknown[];
  expect(messages[0]).toBeInstanceOf(SystemMessage);
  expect(messages[messages.length - 1]).toBeInstanceOf(HumanMessage);
  expect((messages[messages.length - 1] as HumanMessage).content).toBe("ถามอะไรหน่อย");
});

test("format ต่อท้ายคำตอบด้วยลายเซ็นผู้ช่วย", async () => {
  const result = await buildAssistantGraph(fakeLLM(["คำตอบ"])).invoke({ question: "ถาม" });
  expect(result.answer).toBe("คำตอบ\n— ตอบโดยผู้ช่วย LangGraph");
});

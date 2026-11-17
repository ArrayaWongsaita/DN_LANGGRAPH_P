import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { fakeLLM } from "@src/fakeLLM";
import { askWithHistory } from "./askWithHistory";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
function recordMessages(llm: ReturnType<typeof fakeLLM>) {
  const generate = vi.spyOn(llm as unknown as { _generate: (...a: unknown[]) => unknown }, "_generate");
  return () => generate.mock.calls[0][0] as { type: string; content: string }[];
}

test("ลำดับข้อความต้องเป็น system, ประวัติ, แล้วคำถามใหม่", async () => {
  const llm = fakeLLM(["ตอบ"]);
  const sent = recordMessages(llm);
  const history = [new HumanMessage("ฉันชื่อมาลี"), new AIMessage("ยินดีที่ได้รู้จักมาลี")];
  await askWithHistory(llm, "ตอบสั้น ๆ", history, "ฉันชื่ออะไร");
  expect(sent().map((m) => m.type)).toEqual(["system", "human", "ai", "human"]);
  expect(sent()[0].content).toBe("ตอบสั้น ๆ");
  expect(sent()[3].content).toBe("ฉันชื่ออะไร");
});

test("คืนข้อความที่ LLM ตอบ", async () => {
  const result = await askWithHistory(fakeLLM(["มาลี"]), "sys", [], "q");
  expect(result).toBe("มาลี");
});

test("ไม่มีประวัติก็ใช้ได้ (system + คำถาม)", async () => {
  const llm = fakeLLM(["x"]);
  const sent = recordMessages(llm);
  await askWithHistory(llm, "sys", [], "q");
  expect(sent().map((m) => m.type)).toEqual(["system", "human"]);
});

test("ไม่แก้ array ประวัติของผู้เรียก", async () => {
  const history = [new SystemMessage("x")].slice(1);
  await askWithHistory(fakeLLM(["x"]), "sys", history, "q");
  expect(history).toHaveLength(0);
});

import { END } from "@langchain/langgraph";
import { fakeLLM } from "@src/fakeLLM";
import { buildAssistantGraph, pickRoute } from "./assistant";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
// LLM ปลอมตอบตามลำดับ: ครั้งที่ 1 = ผลจัดประเภท (JSON), ครั้งที่ 2 = คำตอบจริง

test("pickRoute: ทักทาย -> smallTalk, อย่างอื่น -> respond", () => {
  expect(pickRoute({ category: "greeting" })).toBe("smallTalk");
  expect(pickRoute({ category: "question" })).toBe("respond");
});

test("ทักทาย: ตอบด้วยข้อความสำเร็จรูป และไม่เรียก LLM ครั้งที่สอง", async () => {
  const llm = fakeLLM(['{"category":"greeting"}', "ไม่ควรถูกใช้"]);
  const generate = vi.spyOn(llm as unknown as { _generate: (...a: unknown[]) => unknown }, "_generate");
  const result = await buildAssistantGraph(llm).invoke({ question: "สวัสดี" });
  expect(result.category).toBe("greeting");
  expect(result.answer).toContain("สวัสดี");
  expect(generate).toHaveBeenCalledTimes(1);
});

test("คำถามทั่วไป: ตอบด้วยคำตอบของ LLM", async () => {
  const llm = fakeLLM(['{"category":"question"}', "คำตอบจาก LLM"]);
  const result = await buildAssistantGraph(llm).invoke({ question: "LangGraph คืออะไร" });
  expect(result.category).toBe("question");
  expect(result.answer).toBe("คำตอบจาก LLM");
});

test("คำถามจริงถูกส่งไปให้ LLM ทั้งตอนจัดประเภทและตอนตอบ", async () => {
  const llm = fakeLLM(['{"category":"question"}', "x"]);
  const generate = vi.spyOn(llm as unknown as { _generate: (...a: unknown[]) => unknown }, "_generate");
  await buildAssistantGraph(llm).invoke({ question: "คำถามพิเศษ" });
  for (const call of generate.mock.calls) {
    const text = (call[0] as { content: string }[]).map((m) => m.content).join(" ");
    expect(text).toContain("คำถามพิเศษ");
  }
  expect(generate).toHaveBeenCalledTimes(2);
});

test("ใช้ END เป็นจุดจบ (graph จบได้ทั้งสองทาง)", async () => {
  expect(END).toBeDefined();
  const a = await buildAssistantGraph(fakeLLM(['{"category":"greeting"}'])).invoke({ question: "hi" });
  const b = await buildAssistantGraph(fakeLLM(['{"category":"question"}', "ok"])).invoke({ question: "q" });
  expect(a.answer).not.toBe("");
  expect(b.answer).not.toBe("");
});

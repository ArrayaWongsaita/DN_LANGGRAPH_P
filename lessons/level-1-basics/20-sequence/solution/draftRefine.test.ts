import { fakeLLM } from "../../../../src/fakeLLM";
import { buildDraftRefineGraph } from "./draftRefine";

test("ขั้นสุดท้ายได้คำตอบจากการเรียกครั้งที่สอง", async () => {
  const result = await buildDraftRefineGraph(fakeLLM(["ร่าง", "ฉบับสุดท้าย"])).invoke({ topic: "ฝน" });
  expect(result.final).toBe("ฉบับสุดท้าย");
});

test("draft ยังอยู่ใน state", async () => {
  const result = await buildDraftRefineGraph(fakeLLM(["ร่าง", "ฉบับสุดท้าย"])).invoke({ topic: "ฝน" });
  expect(result.draft).toBe("ร่าง");
});

test("LLM ถูกเรียกสองครั้ง", async () => {
  const llm = fakeLLM(["a", "b"]);
  const spy = vi.spyOn(llm, "invoke");
  await buildDraftRefineGraph(llm).invoke({ topic: "ฝน" });
  expect(spy).toHaveBeenCalledTimes(2);
});

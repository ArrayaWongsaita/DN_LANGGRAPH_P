import { fakeToolLLM } from "@src/fakeToolLLM";
import { acceptDraft, buildReviewGraph, startReview, submitReview } from "./review";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("startReview คืนร่างที่ LLM เขียน (graph หยุดรอ)", async () => {
  const llm = fakeToolLLM(["เรียนคุณลูกค้า ... "]);
  const graph = buildReviewGraph(llm);
  expect(await startReview(graph, "t", "นัดประชุม")).toBe("เรียนคุณลูกค้า ... ");
  expect(llm.calls[0][0].text).toContain("นัดประชุม");
});

test("มนุษย์แก้ร่าง: ฉบับสุดท้ายคือฉบับที่แก้", async () => {
  const graph = buildReviewGraph(fakeToolLLM(["ร่างเดิม"]));
  await startReview(graph, "t", "x");
  expect(await submitReview(graph, "t", "ฉบับที่คนแก้")).toBe("ฉบับที่คนแก้");
});

test("มนุษย์ไม่แก้ (ว่าง): ใช้ตามร่าง", async () => {
  const graph = buildReviewGraph(fakeToolLLM(["ร่างเดิม"]));
  await startReview(graph, "t", "x");
  expect(await acceptDraft(graph, "t")).toBe("ร่างเดิม");
});

test("LLM ถูกเรียกครั้งเดียว แม้ resume (ร่างไม่ถูกเขียนใหม่)", async () => {
  const llm = fakeToolLLM(["ร่างเดิม"]);
  const graph = buildReviewGraph(llm);
  await startReview(graph, "t", "x");
  await acceptDraft(graph, "t");
  expect(llm.calls).toHaveLength(1);
});

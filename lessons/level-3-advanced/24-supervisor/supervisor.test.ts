import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildSupervisorTeam } from "./supervisor";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) สคริปต์คือการตัดสินใจของหัวหน้าทีละรอบ
const pick = (next: string) => JSON.stringify({ next });

test("หัวหน้ามอบงานตามลำดับที่ตัดสินใจ แล้วจบเมื่อ FINISH", async () => {
  const llm = fakeToolLLM([pick("researcher"), pick("writer"), pick("FINISH")]);
  const r = await buildSupervisorTeam(llm).invoke({ task: "ทำรายงาน" });
  expect(r.work).toBe("[ค้นข้อมูล][เขียนสรุป]");
  expect(llm.calls).toHaveLength(3);
});

test("หัวหน้าเห็นผลงานสะสมในรอบถัดไป", async () => {
  const llm = fakeToolLLM([pick("researcher"), pick("FINISH")]);
  await buildSupervisorTeam(llm).invoke({ task: "x" });
  expect(llm.calls[1][0].text).toContain("[ค้นข้อมูล]");
});

test("สั่ง FINISH ทันที: ไม่มีใครทำงาน", async () => {
  const r = await buildSupervisorTeam(fakeToolLLM([pick("FINISH")])).invoke({ task: "x" });
  expect(r.work).toBe("");
});

test("ลูกทีมคนเดิมถูกเรียกซ้ำได้หลายรอบ", async () => {
  const llm = fakeToolLLM([pick("writer"), pick("writer"), pick("FINISH")]);
  const r = await buildSupervisorTeam(llm).invoke({ task: "x" });
  expect(r.work).toBe("[เขียนสรุป][เขียนสรุป]");
});

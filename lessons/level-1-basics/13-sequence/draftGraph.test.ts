import { fakeLLM } from "@src/fakeLLM";
import { buildDraftGraph } from "./draftGraph";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)  LLM ปลอมตอบตามลำดับ: ครั้งที่ 1 = ร่าง, ครั้งที่ 2 = ฉบับปรับปรุง
test("ผลลัพธ์สุดท้ายมาจาก LLM ครั้งที่ 2 และเก็บร่างไว้ด้วย", async () => {
  const graph = buildDraftGraph(fakeLLM(["ร่างแรก", "ฉบับสวย"]));
  const result = await graph.invoke({ topic: "แมว" });
  expect(result.draft).toBe("ร่างแรก");
  expect(result.final).toBe("ฉบับสวย");
});

test("ขั้นแรกได้หัวข้อ topic ไปให้ LLM", async () => {
  const llm = fakeLLM(["d", "f"]);
  const generate = vi.spyOn(llm as unknown as { _generate: (...a: unknown[]) => unknown }, "_generate");
  await buildDraftGraph(llm).invoke({ topic: "หัวข้อพิเศษ" });
  const first = generate.mock.calls[0][0] as { content: string }[];
  expect(first.map((m) => m.content).join(" ")).toContain("หัวข้อพิเศษ");
});

test("ขั้นที่สองได้ร่างจากขั้นแรกไปให้ LLM (ข้อมูลไหลผ่าน state)", async () => {
  const llm = fakeLLM(["ร่างลับ", "f"]);
  const generate = vi.spyOn(llm as unknown as { _generate: (...a: unknown[]) => unknown }, "_generate");
  await buildDraftGraph(llm).invoke({ topic: "t" });
  const second = generate.mock.calls[1][0] as { content: string }[];
  expect(second.map((m) => m.content).join(" ")).toContain("ร่างลับ");
});

import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildRouter } from "./router";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) สคริปต์: classify(JSON) → คำตอบของแต่ละแหล่ง → รวมคำตอบ
const pick = (sources: string[]) => JSON.stringify({ sources });

test("คำถามเกี่ยวกับสองแหล่ง: ถามทั้งสองและรวมคำตอบ", async () => {
  const llm = fakeToolLLM([pick(["hr", "it"]), "ตอบ hr", "ตอบ it", "รวมแล้ว"]);
  const r = await buildRouter(llm).invoke({ question: "ลาป่วยแล้วขอ VPN ได้ไหม" });
  expect([...r.answers].sort()).toEqual(["[hr] ตอบ hr", "[it] ตอบ it"].sort());
  expect(r.final).toBe("รวมแล้ว");
});

test("ขั้นรวมเห็นคำตอบของทุกแหล่ง", async () => {
  const llm = fakeToolLLM([pick(["hr", "it"]), "ก", "ข", "รวม"]);
  await buildRouter(llm).invoke({ question: "q" });
  const synth = llm.calls[3][0].text;
  expect(synth).toContain("[hr]");
  expect(synth).toContain("[it]");
});

test("แหล่งเดียว: ถามแค่แหล่งนั้น", async () => {
  const llm = fakeToolLLM([pick(["it"]), "ตอบ it", "รวม"]);
  const r = await buildRouter(llm).invoke({ question: "q" });
  expect(r.answers).toEqual(["[it] ตอบ it"]);
  expect(llm.calls).toHaveLength(3);
});

test("classify ไม่เลือกแหล่งไหนเลย: ใช้ general เป็นทางสำรอง ไม่ล่ม", async () => {
  const llm = fakeToolLLM([pick([]), "ตอบทั่วไป", "รวม"]);
  const r = await buildRouter(llm).invoke({ question: "q" });
  expect(r.answers).toEqual(["[general] ตอบทั่วไป"]);
  expect(r.final).toBe("รวม");
});

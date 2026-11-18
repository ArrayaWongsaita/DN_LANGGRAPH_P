import { Command, MemorySaver } from "@langchain/langgraph";
import { buildOrderFlow, buildProgress, buildRetryFlow, buildTotals, calls, resetCalls } from "./workflow";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) ใช้ Functional API จริงกับ MemorySaver
beforeEach(() => resetCalls());
const cfg = (id: string) => ({ configurable: { thread_id: id } });

test("totals: สะสมข้ามรอบใน thread เดิม และคืนเฉพาะ value (ไม่ใช่ { value, save })", async () => {
  const wf = buildTotals(new MemorySaver());
  expect(await wf.invoke(5, cfg("a"))).toBe(5);
  expect(await wf.invoke(2, cfg("a"))).toBe(7);
  expect(await wf.invoke(1, cfg("a"))).toBe(8);
});

test("totals: thread ต่างกันไม่ปนกัน", async () => {
  const wf = buildTotals(new MemorySaver());
  await wf.invoke(5, cfg("a"));
  expect(await wf.invoke(1, cfg("b"))).toBe(1);
  expect(await wf.invoke(1, cfg("a"))).toBe(6);
});

test("order: หยุดรออนุมัติหลังจอง (ยังไม่ส่งของ)", async () => {
  const wf = buildOrderFlow(new MemorySaver());
  const r = (await wf.invoke({ item: "หูฟัง" }, cfg("o1"))) as { __interrupt__?: { value: { question: string; reserved: string } }[] };
  expect(r.__interrupt__?.[0].value.reserved).toBe("จอง:หูฟัง");
  expect(r.__interrupt__?.[0].value.question).toContain("จอง:หูฟัง");
  expect(calls).toMatchObject({ reserve: 1, ship: 0 });
});

test("order: อนุมัติแล้วส่งของ และ task จองไม่รันซ้ำตอน resume", async () => {
  const wf = buildOrderFlow(new MemorySaver());
  await wf.invoke({ item: "หูฟัง" }, cfg("o2"));
  expect(await wf.invoke(new Command({ resume: true }), cfg("o2"))).toBe("ส่งของ(จอง:หูฟัง)");
  expect(calls).toMatchObject({ reserve: 1, ship: 1 });
});

test("order: ไม่อนุมัติ → ยกเลิก ไม่ส่งของ", async () => {
  const wf = buildOrderFlow(new MemorySaver());
  await wf.invoke({ item: "หูฟัง" }, cfg("o3"));
  expect(await wf.invoke(new Command({ resume: false }), cfg("o3"))).toBe("ยกเลิก");
  expect(calls).toMatchObject({ reserve: 1, ship: 0 });
});

test("progress: custom stream ได้เริ่ม/เสร็จตามลำดับ และผลลัพธ์ถูก", async () => {
  const wf = buildProgress();
  const custom: unknown[] = [];
  const updates: unknown[] = [];
  for await (const [mode, chunk] of await wf.stream(21, { streamMode: ["custom", "updates"] })) {
    (mode === "custom" ? custom : updates).push(chunk);
  }
  expect(custom).toEqual([{ progress: "เริ่ม" }, { progress: "เสร็จ" }]);
  expect(JSON.stringify(updates)).toContain("42");
  expect(await wf.invoke(5)).toBe(10);
});

test("retry: task ล้ม 2 ครั้งแล้วสำเร็จภายใน 3 ครั้ง", async () => {
  expect(await buildRetryFlow().invoke(0)).toBe("สำเร็จ");
  expect(calls.flaky).toBe(3);
});

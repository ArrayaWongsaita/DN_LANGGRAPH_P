import { fakeToolLLM } from "@src/fakeToolLLM";
import { makeAddTool } from "@src/sampleTools";
import { limitFor, safeRun } from "./limit";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const tools = [makeAddTool()];
const callAdd = { toolCalls: [{ name: "add", args: { a: 1, b: 1 } }] };

test("limitFor: 2 * รอบ + 2", () => {
  expect(limitFor(3)).toBe(8);
  expect(limitFor(0)).toBe(2);
});

test("งานปกติ (ไม่ใช้ tool) ผ่าน", async () => {
  const result = await safeRun(fakeToolLLM(["สวัสดี"]), tools, "ทัก", 3);
  expect(result).toEqual({ ok: true, answer: "สวัสดี" });
});

test("ใช้ tool ครบจำนวนรอบที่อนุญาตแล้วตอบ ยังผ่าน", async () => {
  const llm = fakeToolLLM([callAdd, callAdd, callAdd, "เสร็จ"]);
  expect(await safeRun(llm, tools, "x", 3)).toEqual({ ok: true, answer: "เสร็จ" });
});

test("LLM ติดลูปเรียก tool ไม่หยุด: ได้ ok:false ไม่ใช่ exception", async () => {
  const llm = fakeToolLLM(Array(60).fill(callAdd));
  const result = await safeRun(llm, tools, "x", 3);
  expect(result).toEqual({ ok: false, reason: "agent วนเกินกำหนด" });
});

test("ตั้ง limit จริง: LLM ถูกเรียกไม่เกินเพดาน (ไม่ใช่ 25 step ของค่าเริ่มต้น)", async () => {
  const llm = fakeToolLLM(Array(60).fill(callAdd));
  await safeRun(llm, tools, "x", 3);
  expect(llm.calls.length).toBeLessThanOrEqual(6);
});

test("error อื่นที่ไม่ใช่ recursion ถูกโยนต่อ", async () => {
  const llm = fakeToolLLM([]); // สคริปต์ว่าง: LLM ปลอม throw
  await expect(safeRun(llm, tools, "x", 3)).rejects.toThrow("fakeToolLLM");
});

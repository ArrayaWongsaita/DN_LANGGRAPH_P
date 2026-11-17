import { fakeToolLLM } from "@src/fakeToolLLM";
import { makeAddTool } from "@src/sampleTools";
import { askWithTools, runToolCall } from "./bind";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) ใช้ tool add จากบทก่อนหน้า
const add = makeAddTool();

test("askWithTools ผูก tool ให้ LLM", async () => {
  const llm = fakeToolLLM(["ตอบ"]);
  await askWithTools(llm, [add], "2+3");
  expect(llm.boundToolNames).toEqual(["add"]);
});

test("askWithTools คืน AIMessage ที่ขอเรียก tool", async () => {
  const llm = fakeToolLLM([{ toolCalls: [{ name: "add", args: { a: 2, b: 3 } }] }]);
  const reply = await askWithTools(llm, [add], "2+3");
  expect(reply.tool_calls?.[0]).toMatchObject({ name: "add", args: { a: 2, b: 3 } });
});

test("askWithTools ส่งคำถามของผู้ใช้ให้ LLM", async () => {
  const llm = fakeToolLLM(["ตอบ"]);
  await askWithTools(llm, [add], "คำถาม");
  expect(llm.calls[0].map((m) => m.text)).toEqual(["คำถาม"]);
});

test("runToolCall รัน tool ตามชื่อและ args", async () => {
  expect(await runToolCall([add], { name: "add", args: { a: 4, b: 5 } })).toBe("9");
});

test("runToolCall: ไม่มี tool ชื่อนั้น throw ข้อความชัดเจน", async () => {
  await expect(runToolCall([add], { name: "nope", args: {} })).rejects.toThrow("ไม่มี tool ชื่อ nope");
});

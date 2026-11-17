import { HumanMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { z } from "zod";
import { fakeToolLLM } from "./fakeToolLLM";

const add = tool(({ a, b }: { a: number; b: number }) => String(a + b), {
  name: "add",
  description: "บวกเลข",
  schema: z.object({ a: z.number(), b: z.number() }),
});

describe("fakeToolLLM", () => {
  test("ตอบข้อความตามสคริปต์ทีละขั้น", async () => {
    const llm = fakeToolLLM(["หนึ่ง", "สอง"]);
    expect((await llm.invoke("a")).text).toBe("หนึ่ง");
    expect((await llm.invoke("b")).text).toBe("สอง");
  });

  test("ขั้นที่เป็น toolCalls คืน AIMessage ที่มี tool_calls ครบ (name, args, id)", async () => {
    const llm = fakeToolLLM([{ toolCalls: [{ name: "add", args: { a: 2, b: 3 } }] }]);
    const reply = await llm.invoke("บวก");
    expect(reply.tool_calls).toHaveLength(1);
    expect(reply.tool_calls?.[0]).toMatchObject({ name: "add", args: { a: 2, b: 3 } });
    expect(typeof reply.tool_calls?.[0].id).toBe("string");
  });

  test("คำตอบมี usage_metadata ที่นับจากข้อความ (ไว้สอนการอ่าน token)", async () => {
    const reply = await fakeToolLLM(["สวัสดี"]).invoke("ทัก");
    expect(reply.usage_metadata).toEqual({ input_tokens: 1, output_tokens: 6, total_tokens: 7 });
  });

  test("เรียกเกินจำนวนขั้นในสคริปต์: throw ข้อความชัดเจน (ไม่วนซ้ำ)", async () => {
    const llm = fakeToolLLM(["x"]);
    await llm.invoke("a");
    await expect(llm.invoke("b")).rejects.toThrow("fakeToolLLM: ไม่มีขั้นเหลือในสคริปต์แล้ว (เรียกครั้งที่ 2)");
  });

  test("calls จดข้อความที่ถูกส่งเข้ามาในแต่ละครั้ง", async () => {
    const llm = fakeToolLLM(["x", "y"]);
    await llm.invoke([new HumanMessage("คำถามแรก")]);
    await llm.invoke("คำถามสอง");
    expect(llm.calls).toHaveLength(2);
    expect(llm.calls[0].map((m) => m.content).join(" ")).toContain("คำถามแรก");
  });

  test("bindTools จดชื่อ tool ที่ผูกไว้ และใช้สคริปต์เดียวกันต่อ", async () => {
    const llm = fakeToolLLM(["a", "b"]);
    await llm.invoke("1");
    const bound = llm.bindTools!([add]);
    expect(llm.boundToolNames).toEqual(["add"]);
    expect((await bound.invoke("2")).text).toBe("b");
  });

  test("withStructuredOutput: อ่านข้อความเป็น JSON แล้วตรวจกับ zod schema", async () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const ok = await fakeToolLLM(['{"name":"มาลี","age":25}']).withStructuredOutput(schema).invoke("x");
    expect(ok).toEqual({ name: "มาลี", age: 25 });
    await expect(fakeToolLLM(['{"name":"มาลี","age":"ยี่สิบ"}']).withStructuredOutput(schema).invoke("x")).rejects.toThrow();
  });

  test("ใช้กับ createAgent ได้: เรียก tool แล้วตอบสรุป", async () => {
    const llm = fakeToolLLM([
      { toolCalls: [{ name: "add", args: { a: 2, b: 3 } }] },
      "ผลบวกคือ 5",
    ]);
    const agent = createAgent({ model: llm, tools: [add] });
    const result = await agent.invoke({ messages: [new HumanMessage("2+3")] });
    const last = result.messages[result.messages.length - 1];
    expect(last.text).toBe("ผลบวกคือ 5");
    const toolMessage = result.messages.find((m: unknown) => ToolMessage.isInstance(m)) as ToolMessage;
    expect(toolMessage.content).toBe("5");
  });
});

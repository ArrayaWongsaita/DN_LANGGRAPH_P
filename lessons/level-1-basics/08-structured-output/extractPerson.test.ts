import { fakeLLM } from "@src/fakeLLM";
import { extractPerson, personSchema } from "./extractPerson";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
// หมายเหตุ: LLM ปลอมตอบข้อความ JSON ที่เราเขียนไว้ แล้ว withStructuredOutput แปลงเป็น object ให้

test("ได้ object { name, age } ตามที่ LLM ตอบ", async () => {
  const llm = fakeLLM(['{"name":"มาลี","age":25}']);
  expect(await extractPerson(llm, "มาลี อายุ 25")).toEqual({ name: "มาลี", age: 25 });
});

test("ต้องใช้ llm.withStructuredOutput กับ personSchema", async () => {
  const llm = fakeLLM(['{"name":"มาลี","age":25}']);
  const spy = vi.spyOn(llm, "withStructuredOutput");
  await extractPerson(llm, "มาลี อายุ 25");
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy.mock.calls[0][0]).toBe(personSchema);
});

test("ข้อความที่ส่งให้ LLM ต้องมีข้อความต้นฉบับ", async () => {
  const llm = fakeLLM(['{"name":"มาลี","age":25}']);
  const generate = vi.spyOn(llm as unknown as { _generate: (...a: unknown[]) => unknown }, "_generate");
  await extractPerson(llm, "ข้อความต้นฉบับของฉัน");
  const messages = generate.mock.calls[0][0] as { content: string }[];
  expect(messages.map((m) => m.content).join(" ")).toContain("ข้อความต้นฉบับของฉัน");
});

test("ถ้า LLM ไม่ตอบเป็น JSON ต้อง reject", async () => {
  await expect(extractPerson(fakeLLM(["ไม่ใช่ json"]), "x")).rejects.toThrow();
});

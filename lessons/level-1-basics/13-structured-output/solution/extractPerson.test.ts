import { fakeLLM } from "../../../../src/fakeLLM";
import { extractPerson } from "./extractPerson";

test("คำตอบ JSON ที่ถูกต้องได้ Person", async () => {
  const llm = fakeLLM(['{"name":"มาลี","age":25}']);
  expect(await extractPerson(llm, "มาลี อายุ 25")).toEqual({ name: "มาลี", age: 25 });
});

test("คำตอบที่ไม่ใช่ JSON ต้อง throw ข้อความที่พูดถึง JSON", async () => {
  await expect(extractPerson(fakeLLM(["ไม่ใช่ json"]), "x")).rejects.toThrow(/JSON/);
});

test("JSON ที่รูปร่างไม่ตรง schema ต้อง throw ข้อความที่พูดถึงรูปแบบ", async () => {
  const llm = fakeLLM(['{"name":"มาลี","age":"ยี่สิบ"}']);
  await expect(extractPerson(llm, "x")).rejects.toThrow(/รูปแบบ/);
});

test("โมเดลห่อ JSON ด้วย code fence และมีข้อความนำหน้าก็อ่านได้", async () => {
  const llm = fakeLLM(['นี่คือผลลัพธ์:\n```json\n{"name":"มาลี","age":25}\n```']);
  expect(await extractPerson(llm, "x")).toEqual({ name: "มาลี", age: 25 });
});

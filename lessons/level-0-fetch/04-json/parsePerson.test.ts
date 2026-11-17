import { fakeFetch } from "@src/fakeFetch";
import { extractPerson, parsePerson, stripFence } from "./parsePerson";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("stripFence: JSON ล้วนคงเดิม", () => {
  expect(stripFence('{"a":1}')).toBe('{"a":1}');
});

test("stripFence: ลอกรั้วโค้ด ```json ... ``` ออก", () => {
  expect(stripFence('```json\n{"a":1}\n```')).toBe('{"a":1}');
});

test("stripFence: รั้วโค้ดที่ไม่มีคำว่า json ก็ลอกได้ และตัดช่องว่างหัวท้าย", () => {
  expect(stripFence('  ```\n{"a":1}\n```  ')).toBe('{"a":1}');
});

test("parsePerson: JSON ล้วนที่ถูกต้องผ่าน", () => {
  expect(parsePerson('{"name":"สมชาย","age":42}')).toEqual({ name: "สมชาย", age: 42 });
});

test("parsePerson: JSON ที่ห่อด้วยรั้วโค้ดก็ผ่าน", () => {
  expect(parsePerson('```json\n{"name":"สมชาย","age":42}\n```')).toEqual({ name: "สมชาย", age: 42 });
});

test("parsePerson: ไม่ใช่ JSON ต้อง throw ข้อความไทยที่พูดถึง JSON", () => {
  expect(() => parsePerson("ขอโทษครับ ตอบไม่ได้")).toThrow("JSON");
});

test("parsePerson: เป็น JSON แต่ชนิดข้อมูลผิด (age เป็นข้อความ) ต้อง throw", () => {
  expect(() => parsePerson('{"name":"สมชาย","age":"สี่สิบสอง"}')).toThrow();
});

test("parsePerson: ขาด field ต้อง throw", () => {
  expect(() => parsePerson('{"name":"สมชาย"}')).toThrow();
});

test("extractPerson: เรียก LLM แล้วแปลงคำตอบที่ห่อรั้วโค้ดได้ (คำตอบจำลอง)", async () => {
  const content = '```json\n{"name":"มาลี","age":30}\n```';
  const f = fakeFetch([{ body: { choices: [{ message: { role: "assistant", content } }] } }]);
  const person = await extractPerson({
    fetchFn: f,
    url: "https://llm.test/v1/chat/completions",
    apiKey: "k",
    model: "m",
    text: "คุณมาลี อายุ 30 ปี",
  });
  expect(person).toEqual({ name: "มาลี", age: 30 });
  const body = JSON.parse(String(f.calls[0].init?.body));
  expect(JSON.stringify(body.messages)).toContain("คุณมาลี อายุ 30 ปี");
});

import { HumanMessage } from "@langchain/core/messages";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { makeWeatherTool } from "@src/sampleTools";
import { buildFinalGraph, makeAnswerSchema } from "./final";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const json = '{"city":"เชียงใหม่","tempC":22,"summary":"อากาศเย็น"}';
const input = { messages: [new HumanMessage("อากาศเชียงใหม่")] };

test("makeAnswerSchema รับข้อมูลถูกต้อง และปฏิเสธชนิดผิด", () => {
  const s = makeAnswerSchema();
  expect(s.parse(JSON.parse(json))).toEqual({ city: "เชียงใหม่", tempC: 22, summary: "อากาศเย็น" });
  expect(() => s.parse({ city: "x", tempC: "เย็น", summary: "y" })).toThrow();
});

test("หลัง agent ตอบ ได้ answer เป็นอ็อบเจ็กต์ตาม schema", async () => {
  const llm = fakeToolLLM(["เชียงใหม่ 22 องศา เย็นสบาย", json]);
  const result = await buildFinalGraph(llm, [makeWeatherTool()]).invoke(input);
  expect(result.answer).toEqual({ city: "เชียงใหม่", tempC: 22, summary: "อากาศเย็น" });
});

test("agent ใช้ tool ก่อน แล้วค่อยแปลงเป็น answer", async () => {
  const llm = fakeToolLLM([
    { toolCalls: [{ name: "getWeather", args: { city: "เชียงใหม่" } }] },
    "อากาศเย็น 22 องศา",
    json,
  ]);
  const result = await buildFinalGraph(llm, [makeWeatherTool()]).invoke(input);
  expect(result.messages.map((m) => m.type)).toEqual(["human", "ai", "tool", "ai"]);
  expect(result.answer?.tempC).toBe(22);
});

test("LLM ตอบข้อมูลผิดชนิด: graph ปฏิเสธ (ไม่ปล่อยข้อมูลเสียผ่านไป)", async () => {
  const llm = fakeToolLLM(["ตอบ", '{"city":"x","tempC":"เย็น","summary":"y"}']);
  await expect(buildFinalGraph(llm, [makeWeatherTool()]).invoke(input)).rejects.toThrow();
});

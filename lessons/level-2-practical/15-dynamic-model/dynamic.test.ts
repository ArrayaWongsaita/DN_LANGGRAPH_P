import { fakeToolLLM } from "@src/fakeToolLLM";
import { makeAddTool, makeWeatherTool } from "@src/sampleTools";
import { ask, buildDynamicGraph, pickModel, pickTools } from "./dynamic";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const tools = [makeAddTool(), makeWeatherTool()];

test("pickModel: คำถามสั้นใช้ cheap, คำถามยาวใช้ strong", () => {
  const cheap = fakeToolLLM([]);
  const strong = fakeToolLLM([]);
  expect(pickModel("สั้น ๆ", { cheap, strong })).toBe(cheap);
  expect(pickModel("ช่วยอธิบายหลักการทำงานของ LangGraph ให้ละเอียดหน่อย", { cheap, strong })).toBe(strong);
});

test("pickTools: ไม่มีคำว่าอากาศ ตัด getWeather ออก แต่เก็บ add", () => {
  expect(pickTools("2+3", tools).map((t) => t.name)).toEqual(["add"]);
});

test("pickTools: มีคำว่าอากาศ ได้ครบทุก tool", () => {
  expect(pickTools("อากาศเป็นอย่างไร", tools).map((t) => t.name)).toEqual(["add", "getWeather"]);
});

test("graph ใช้โมเดลที่เหมาะกับคำถาม และผูกเฉพาะ tool ที่เลือก", async () => {
  const cheap = fakeToolLLM(["จากตัวเล็ก"]);
  const strong = fakeToolLLM(["จากตัวใหญ่"]);
  const graph = buildDynamicGraph({ cheap, strong }, tools);
  expect(await ask(graph, "2+3")).toBe("จากตัวเล็ก");
  expect(cheap.boundToolNames).toEqual(["add"]);
  expect(strong.calls).toHaveLength(0);
  expect(await ask(graph, "ช่วยบอกอากาศของเชียงใหม่พร้อมเหตุผลที่ละเอียดหน่อย")).toBe("จากตัวใหญ่");
  expect(strong.boundToolNames).toEqual(["add", "getWeather"]);
});

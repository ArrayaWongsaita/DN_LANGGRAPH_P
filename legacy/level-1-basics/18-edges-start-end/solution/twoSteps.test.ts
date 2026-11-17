import { buildTwoStepGraph, buildBrokenGraph } from "./twoSteps";

test("node ทำงานตามลำดับของ edge", async () => {
  const log: string[] = [];
  await buildTwoStepGraph(log).invoke({});
  expect(log).toEqual(["first", "second"]);
});

test("state สุดท้ายมาจาก node สุดท้าย", async () => {
  expect(await buildTwoStepGraph([]).invoke({})).toEqual({ result: "second" });
});

test("ถ้า START ไม่ต่อไปไหน compile ต้อง error", () => {
  expect(() => buildBrokenGraph()).toThrow(/not reachable/);
});

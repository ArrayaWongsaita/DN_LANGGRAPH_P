import { buildDiamond, findNameClashes, groupSupersteps, isConcurrentUpdateError, maxParallelism, recordDebug, userChannels } from "./pregel";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) รัน graph จริงของ LangGraph กับ node ปลอม ไม่ใช้เครือข่าย
test("diamond มี 3 รอบ และ b กับ c อยู่รอบเดียวกัน", async () => {
  const steps = groupSupersteps(await recordDebug(buildDiamond(true)));
  expect(steps.map((s) => s.nodes)).toEqual([["a"], ["b", "c"], ["d"]]);
  const numbers = steps.map((s) => s.step);
  expect(numbers).toEqual([...numbers].sort((x, y) => x - y));
  expect(new Set(numbers).size).toBe(3);
});

test("มี reducer: ผลของ node ขนานถูกรวมครบ", async () => {
  const out = await buildDiamond(true).invoke({});
  expect([...out.log].sort()).toEqual(["a", "b", "c", "d"]);
  expect(out.log[0]).toBe("a");
  expect(out.log[3]).toBe("d");
});

test("ไม่มี reducer: สอง node เขียนฟิลด์เดียวกันในรอบเดียว → error ความขนาน", async () => {
  let caught: unknown;
  try {
    await buildDiamond(false).invoke({});
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeDefined();
  expect(isConcurrentUpdateError(caught)).toBe(true);
});

test("groupSupersteps: เรียงรอบ, เรียงชื่อ, ข้าม event ที่ไม่ใช่ task และ task ที่ไม่มีชื่อ", () => {
  const events = [
    { type: "checkpoint", step: 0 },
    { type: "task", step: 2, payload: { name: "z" } },
    { type: "task", step: 1, payload: { name: "a" } },
    { type: "task_result", step: 1, payload: { name: "a" } },
    { type: "task", step: 2, payload: { name: "m" } },
    { type: "task", step: 3, payload: {} },
    { type: "task", step: 3 },
  ];
  expect(groupSupersteps(events)).toEqual([
    { step: 1, nodes: ["a"] },
    { step: 2, nodes: ["m", "z"] },
  ]);
  expect(groupSupersteps([])).toEqual([]);
});

test("maxParallelism", () => {
  expect(maxParallelism([])).toBe(0);
  expect(maxParallelism([{ nodes: ["a"] }, { nodes: ["b", "c", "d"] }, { nodes: ["e", "f"] }])).toBe(3);
});

test("findNameClashes: เจอชื่อซ้ำ ไม่ซ้ำกันเอง ตามลำดับ node", () => {
  expect(findNameClashes(["plan", "log", "n", "log"], ["n", "log", "other"])).toEqual(["log", "n"]);
  expect(findNameClashes(["a", "b"], ["x"])).toEqual([]);
  expect(findNameClashes([], ["x"])).toEqual([]);
});

test("isConcurrentUpdateError: รู้จักด้วยรหัสหรือข้อความ และไม่หลงทางกับ error อื่น", () => {
  expect(isConcurrentUpdateError(Object.assign(new Error("x"), { lc_error_code: "INVALID_CONCURRENT_GRAPH_UPDATE" }))).toBe(true);
  expect(isConcurrentUpdateError(new Error('Invalid update for channel "log": LastValue can only receive one value per step.'))).toBe(true);
  expect(isConcurrentUpdateError(new Error("อื่น"))).toBe(false);
  expect(isConcurrentUpdateError(Object.assign(new Error("x"), { lc_error_code: "GRAPH_RECURSION_LIMIT" }))).toBe(false);
  for (const v of [null, undefined, "string", 42]) expect(isConcurrentUpdateError(v)).toBe(false);
});

test("userChannels: ตัด channel ภายในของ runtime", () => {
  expect(userChannels(["log", "n", "__start__", "__pregel_tasks", "branch:to:a", "join:b+c:d", "start:a"])).toEqual(["log", "n"]);
  expect(userChannels(["branchy", "starter"])).toEqual(["branchy", "starter"]);
});

test("channel จริงของ graph: ฟิลด์ของเรามีอยู่ และมี channel ภายในปนอยู่", () => {
  const names = Object.keys((buildDiamond(true) as unknown as { channels: Record<string, unknown> }).channels);
  expect(userChannels(names)).toEqual(["log"]);
  expect(names.length).toBeGreaterThan(1);
});

// ---- proposed kill tests (22) ----
test("[K22c] groupSupersteps sorts steps numerically (10 after 2)", () => {
  const events = [
    { type: "task", step: 10, payload: { name: "late" } },
    { type: "task", step: 2, payload: { name: "early" } },
  ];
  expect(groupSupersteps(events).map((s) => s.step)).toEqual([2, 10]);
});

test("[K22e] userChannels only strips internal PREFIXES", () => {
  expect(userChannels(["notes__old", "restart:flag"])).toEqual(["notes__old", "restart:flag"]);
});

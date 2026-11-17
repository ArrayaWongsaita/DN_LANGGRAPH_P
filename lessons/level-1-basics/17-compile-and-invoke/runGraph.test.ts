import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { buildCounter, runWithLimit } from "./runGraph";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const State = new StateSchema({ n: z.number().default(0) });

// graph ที่วนไม่จบ: node inc ชี้กลับตัวเองตลอด
function neverEnding() {
  return new StateGraph(State)
    .addNode("inc", (s) => ({ n: s.n + 1 }))
    .addEdge(START, "inc")
    .addConditionalEdges("inc", () => "inc", ["inc", END])
    .compile();
}

test("buildCounter: คอมไพล์แล้ว invoke ได้ผลลัพธ์เป็น state สุดท้าย", async () => {
  const result = await buildCounter().invoke({ n: 1 });
  expect(result).toEqual({ n: 2 });
});

test("runWithLimit: graph ที่จบปกติ ได้ status ok พร้อม state", async () => {
  const outcome = await runWithLimit(buildCounter(), { n: 5 }, 10);
  expect(outcome).toEqual({ status: "ok", state: { n: 6 } });
});

test("runWithLimit: graph วนไม่จบ ถูกหยุดที่ limit และได้ status limit (ไม่ throw)", async () => {
  const outcome = await runWithLimit(neverEnding(), {}, 5);
  expect(outcome.status).toBe("limit");
});

test("runWithLimit: error อื่นที่ไม่ใช่ limit ต้องโยนต่อ ไม่กลืนทิ้ง", async () => {
  await expect(runWithLimit(buildCounter(), { n: "x" } as never, 5)).rejects.toThrow();
});

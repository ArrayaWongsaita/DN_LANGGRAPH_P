import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { buildJob, runJob } from "./timeout";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("ทำงานเร็วกว่าเพดาน: สำเร็จ", async () => {
  expect(await runJob(buildJob(10, 1000))).toEqual({ ok: true, log: "เสร็จ" });
});

test("ทำงานช้ากว่าเพดาน: ได้ผลหมดเวลาพร้อมชื่อ node (ไม่ใช่ exception)", async () => {
  expect(await runJob(buildJob(400, 50))).toEqual({ ok: false, node: "slow" });
});

test("หมดเวลาแล้วกลับมาเร็ว ไม่รอจนงานเสร็จ", async () => {
  const start = Date.now();
  await runJob(buildJob(2000, 50));
  expect(Date.now() - start).toBeLessThan(1000);
});

test("error ชนิดอื่นต้องไม่ถูกแปลงเป็น \"หมดเวลา\" (โยนต่อให้ผู้เรียก)", async () => {
  const broken = new StateGraph(new StateSchema({ log: z.string().default("") }))
    .addNode("boom", () => {
      throw new Error("db down");
    })
    .addEdge(START, "boom")
    .addEdge("boom", END)
    .compile();
  await expect(runJob(broken as never)).rejects.toThrow("db down");
});

function buildNamed(name: string, run: () => Promise<{ log: string }>, timeoutMs: number) {
  return new StateGraph(new StateSchema({ log: z.string().default("") }))
    .addNode(name, run, { timeout: timeoutMs } as never)
    .addEdge(START, name as never)
    .addEdge(name as never, END)
    .compile();
}

test("ชื่อ node ในผลหมดเวลามาจาก error จริง (node ชื่ออื่นก็ได้ชื่อของมัน)", async () => {
  const job = buildNamed("fetchData", () => new Promise((r) => setTimeout(() => r({ log: "x" }), 400)), 50);
  expect(await runJob(job as never)).toEqual({ ok: false, node: "fetchData" });
});

test("error ที่แค่มีข้อความว่า timed out ไม่ใช่ timeout ของ node: ต้องโยนต่อ", async () => {
  const job = buildNamed("api", async () => {
    throw new Error("upstream request timed out");
  }, 1000);
  await expect(runJob(job as never)).rejects.toThrow("upstream request timed out");
});

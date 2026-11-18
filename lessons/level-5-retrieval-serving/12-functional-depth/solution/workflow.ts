import {
  type BaseCheckpointSaver,
  entrypoint,
  getPreviousState,
  getWriter,
  interrupt,
  task,
} from "@langchain/langgraph";

export const calls = { reserve: 0, ship: 0, flaky: 0, double: 0 };
export const resetCalls = () => Object.assign(calls, { reserve: 0, ship: 0, flaky: 0, double: 0 });

const reserve = task("reserve", async (item: string) => {
  calls.reserve++;
  return `จอง:${item}`;
});
const ship = task("ship", async (reserved: string) => {
  calls.ship++;
  return `ส่งของ(${reserved})`;
});
const double = task("double", async (n: number) => {
  calls.double++;
  return n * 2;
});

export function buildTotals(checkpointer: BaseCheckpointSaver) {
  return entrypoint({ name: "totals", checkpointer }, async (inc: number) => {
    const total = (getPreviousState<number>() ?? 0) + inc;
    return entrypoint.final({ value: total, save: total });
  });
}

export function buildOrderFlow(checkpointer: BaseCheckpointSaver) {
  return entrypoint({ name: "order", checkpointer }, async (input: { item: string }) => {
    const reserved = await reserve(input.item);
    const approved = interrupt({ question: `อนุมัติส่ง ${reserved} ไหม`, reserved });
    if (!approved) return "ยกเลิก";
    return await ship(reserved);
  });
}

export function buildProgress() {
  return entrypoint({ name: "progress" }, async (n: number) => {
    const write = getWriter() ?? (() => {});
    write({ progress: "เริ่ม" });
    const r = await double(n);
    write({ progress: "เสร็จ" });
    return r;
  });
}

export function makeFlakyTask() {
  return task({ name: "flaky", retry: { maxAttempts: 3, initialInterval: 1 } } as never, async () => {
    calls.flaky++;
    if (calls.flaky < 3) throw new Error("ล้มชั่วคราว");
    return "สำเร็จ";
  });
}

export function buildRetryFlow() {
  const flaky = makeFlakyTask();
  return entrypoint({ name: "retry-flow" }, async (_n: number) => await flaky());
}

import { MemorySaver, entrypoint, task } from "@langchain/langgraph";

export const runs = { double: 0 };

export const double = task("double", async (n: number) => {
  runs.double++;
  return n * 2;
});

export function buildWorkflow() {
  return entrypoint({ name: "wf", checkpointer: new MemorySaver() }, async (n: number) => {
    const a = await double(n);
    const [b, c] = await Promise.all([double(a), double(a + 1)]);
    return b + c;
  });
}

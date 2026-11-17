import { MemorySaver, entrypoint, task } from "@langchain/langgraph";
import { todo } from "@src/todo";

export const runs = { double: 0 };

export const double = task("double", async (n: number) => {
  runs.double++;
  // 👉 ข้อ 1: คืน n * 2
  return todo(1);
});

export function buildWorkflow() {
  // 👉 ข้อ 2: คืน entrypoint({ name: "wf", checkpointer: new MemorySaver() }, async (n: number) => { ... })
  //          ข้างใน: a = await double(n); แล้วรัน double(a) กับ double(a + 1) "ขนานกัน" ด้วย Promise.all
  //          คืนผลบวกของสองค่านั้น
  return todo(2);
}

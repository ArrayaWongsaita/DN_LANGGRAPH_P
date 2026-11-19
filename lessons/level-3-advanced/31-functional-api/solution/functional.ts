import { MemorySaver, entrypoint, task } from "@langchain/langgraph";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-31  (ไม่ใช้ LLM)
// Functional API: เขียน workflow เป็นฟังก์ชันธรรมดา (entrypoint) ที่เรียก task ต่อกันหรือขนานกัน แทนการประกาศ node/edge
const runs = { double: 0 };

const double = task("double", async (n: number) => {
  runs.double++;
  // ข้อ 1: คืน n * 2
  return n * 2;
});

// ข้อ 2: สร้าง workflow: entrypoint({ name: "wf", checkpointer: new MemorySaver() }, async (n: number) => { ... })
//        ข้างใน: const a = await double(n); แล้วรัน double(a) กับ double(a + 1) "ขนานกัน" ด้วย Promise.all
//        คืนผลบวกของสองค่านั้น
const workflow = entrypoint({ name: "wf", checkpointer: new MemorySaver() }, async (n: number) => {
  const a = await double(n);
  const [x, y] = await Promise.all([double(a), double(a + 1)]);
  return x + y;
});

const result = await workflow.invoke(3, { configurable: { thread_id: "t" } });
console.log("ผลลัพธ์:", result, "task double ถูกรัน", runs.double, "ครั้ง");

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ผลลัพธ์ถูก: a=6, double(6)=12, double(7)=14 รวม 26", result === 26, "ใช้ Promise.all กับ double(a) และ double(a + 1)");
check("task double ถูกเรียก 3 ครั้ง", runs.double === 3);

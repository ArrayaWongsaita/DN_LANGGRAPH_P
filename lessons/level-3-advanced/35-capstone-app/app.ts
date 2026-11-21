import { Command, END, InMemoryStore, MemorySaver, START, StateGraph, StateSchema, interrupt } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-35
// โปรเจกต์ปิด Level 3: แอปเขียนรายงานที่ "จำความชอบผู้ใช้ (store) + รายงานความคืบหน้า (custom stream) + ขออนุมัติก่อนเผยแพร่ (interrupt) + ทำต่อได้ (checkpointer)"
// บทนี้รวมของที่เรียนมา: store (3-10..3-12), context (3-05), stream custom (2-23), interrupt (2-18), checkpointer
const State = new StateSchema({
  question: z.string().default(""),
  lang: z.string().default("th"),
  report: z.string().default(""),
  approved: z.boolean().default(false),
  result: z.string().default(""),
});

const store = new InMemoryStore();
await store.put(["prefs", "me"], "lang", { lang: "th" }); // ความชอบที่จำไว้ของผู้ใช้ "me"

const builder = new StateGraph(State, { context: z.object({ userId: z.string() }) })
  .addNode("prepare", async (_state, runtime) => {
    const item = await runtime.store!.get(["prefs", runtime.context!.userId], "lang");
    const lang = (item?.value.lang as string | undefined) ?? "th";
    runtime.writer?.({ stage: "prepare" });
    return { lang };
  })
  .addNode("draft", async (state, runtime) => {
    runtime.writer?.({ stage: "draft" });
    const reply = await llm.invoke(`เขียนรายงานสั้น ๆ สองประโยคเรื่อง ${state.question} เป็นภาษา ${state.lang}`);
    return { report: reply.text };
  })
  .addNode("approve", (state) => {
    // 👉 ข้อ 1 ขออนุมัติ: const ok = interrupt({ report: state.report }); คืน { approved: ok === true }
    // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
    //   const ok = interrupt({ report: state.report });
    //   return { approved: ok === true };
    return todo(1);
  })
  .addNode("publish", (state) => ({
    result: state.approved ? `เผยแพร่แล้ว: ${state.report}` : "ไม่เผยแพร่",
  }))
  .addEdge(START, "prepare")
  .addEdge("prepare", "draft")
  .addEdge("draft", "approve")
  .addEdge("approve", "publish")
  .addEdge("publish", END);

// 👉 ข้อ 2 compile พร้อม checkpointer และ store: builder.compile({ checkpointer: new MemorySaver(), store })
// แนวทาง (เอา // ออกแล้วแทนที่ todo(2) ได้เลย):
//   const app = builder.compile({ checkpointer: new MemorySaver(), store });
const app: ReturnType<typeof builder.compile> = todo(2);

// เริ่มงาน: ฟังความคืบหน้า (custom) และ state (values) ไปพร้อมกัน จนกว่า graph จะหยุดรออนุมัติ
const config = { configurable: { thread_id: "run-1" }, context: { userId: "me" } };
const stages: string[] = [];
let report = "";
// 👉 ข้อ 3 เปิด stream ด้วย streamMode ["custom", "values"]: app.stream({ question: "ประโยชน์ของการนอนหลับ" }, { ...config, streamMode: ["custom", "values"] })
//        แต่ละชิ้นเป็น [mode, data]: ถ้า mode เป็น "custom" push (data as { stage: string }).stage ลง stages
//        ถ้าเป็น "values" เก็บ (data as { report?: string }).report ลง report (ถ้ามี)
// แนวทาง (เอา // ออกแล้วแทนที่ todo(3) ได้เลย):
//   for await (const [mode, data] of await app.stream(
//     { question: "ประโยชน์ของการนอนหลับ" },
//     { ...config, streamMode: ["custom", "values"] },
//   )) {
//     if (mode === "custom") stages.push((data as { stage: string }).stage);
//     if (mode === "values") report = (data as { report?: string }).report || report;
//   }
todo(3);
const waiting = (await app.getState({ configurable: { thread_id: "run-1" } })).next.includes("approve");
console.log({ stages, waiting });
console.log("รายงานที่รออนุมัติ:", report);

// ผู้ใช้กดอนุมัติ แล้วงานทำต่อจนเผยแพร่
const finished = await app.invoke(new Command({ resume: true }), config);
console.log(finished.result);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ส่งความคืบหน้าตามขั้น: prepare แล้ว draft", JSON.stringify(stages) === '["prepare","draft"]', "writer ใน prepare และ stream custom");
check("ได้รายงานจาก LLM และหยุดรออนุมัติ", report.length > 0 && waiting, "approve ต้องเรียก interrupt และมี checkpointer");
check("อนุมัติแล้วเผยแพร่ (ผลขึ้นต้นด้วย 'เผยแพร่แล้ว')", finished.result.startsWith("เผยแพร่แล้ว:"), "resume ด้วย true ทำให้ approved = true");

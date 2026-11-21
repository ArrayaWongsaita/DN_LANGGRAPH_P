import { Command, END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-24
// supervisor: LLM "หัวหน้า" เลือกว่าใครทำต่อ ลูกทีมทำเสร็จแล้วกลับมาที่หัวหน้า จนหัวหน้าสั่ง FINISH
const Next = z.enum(["researcher", "writer", "FINISH"]);

const State = new StateSchema({
  task: z.string().default(""),
  work: z.string().default(""),
});

const builder = new StateGraph(State)
  .addNode(
    "supervisor",
    async (state) => {
      const structured = llm.withStructuredOutput(z.object({ next: Next }), { method: "functionCalling" });
      const out = await structured.invoke(
        `งาน: ${state.task}\nผลงานตอนนี้: ${state.work || "(ยังไม่มี)"}\nลูกทีม: researcher (ค้นข้อมูล) ต้องทำก่อน แล้ว writer (เขียนสรุป) ตามหลัง เมื่อมีทั้ง [ค้นข้อมูล] และ [เขียนสรุป] ในผลงานแล้วให้ FINISH ใครทำต่อ (researcher/writer/FINISH)?`,
      );
      return new Command({ goto: out.next === "FINISH" ? END : out.next });
    },
    { ends: ["researcher", "writer", END] },
  )
  .addNode("researcher", (state) => ({ work: `${state.work}[ค้นข้อมูล]` }))
  .addNode("writer", (state) => ({ work: `${state.work}[เขียนสรุป]` }))
  .addEdge(START, "supervisor");

builder.addEdge("researcher", "supervisor");
builder.addEdge("writer", "supervisor");

const graph = builder.compile();
const result = await graph.invoke({ task: "สรุปข้อดีของการอ่านหนังสือ" }, { recursionLimit: 15 });
console.log("ผลงาน:", result.work);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ลูกทีมทั้งสองทำงาน", result.work.includes("[ค้นข้อมูล]") && result.work.includes("[เขียนสรุป]"), "ลูกทีมต้องกลับมาที่ supervisor เพื่อให้ตัดสินต่อ");
check("researcher ทำก่อน writer", result.work.indexOf("[ค้นข้อมูล]") < result.work.indexOf("[เขียนสรุป]"));

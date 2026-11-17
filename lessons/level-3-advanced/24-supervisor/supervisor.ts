import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { Command, END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";

const Next = z.enum(["researcher", "writer", "FINISH"]);

const State = new StateSchema({
  task: z.string().default(""),
  work: z.string().default(""),
});

export function buildSupervisorTeam(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode(
      "supervisor",
      async (state) => {
        // 👉 ข้อ 1: ใช้ llm.withStructuredOutput(z.object({ next: Next })) เรียก invoke ด้วย
        //          `งาน: ${state.task}\nผลงานตอนนี้: ${state.work}\nใครทำต่อ (researcher/writer/FINISH)?`
        //          แล้ว goto: ผล.next === "FINISH" ? END : ผล.next  คืนเป็น new Command({ goto })
        return todo(1);
      },
      { ends: ["researcher", "writer", END] },
    )
    .addNode("researcher", (state) => ({ work: `${state.work}[ค้นข้อมูล]` }))
    .addNode("writer", (state) => ({ work: `${state.work}[เขียนสรุป]` }))
    .addEdge(START, "supervisor")
    // 👉 ข้อ 2: ลูกทีมทุกคนต้องกลับมาที่ supervisor: addEdge("researcher", "supervisor") และ addEdge("writer", "supervisor")
    //          (ใส่ต่อโซ่นี้ด้านล่าง)
    .compile();
}

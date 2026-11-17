import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { Command, END, START, StateGraph, StateSchema } from "@langchain/langgraph";
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
        const decision = await llm
          .withStructuredOutput(z.object({ next: Next }))
          .invoke(`งาน: ${state.task}\nผลงานตอนนี้: ${state.work}\nลูกทีม: researcher (ค้นข้อมูล) ต้องทำก่อน แล้ว writer (เขียนสรุป) ตามหลัง เมื่อมีทั้งสองอย่างในผลงานแล้วให้ FINISH ใครทำต่อ (researcher/writer/FINISH)?`);
        return new Command({ goto: decision.next === "FINISH" ? END : decision.next });
      },
      { ends: ["researcher", "writer", END] },
    )
    .addNode("researcher", (state) => ({ work: `${state.work}[ค้นข้อมูล]` }))
    .addNode("writer", (state) => ({ work: `${state.work}[เขียนสรุป]` }))
    .addEdge(START, "supervisor")
    .addEdge("researcher", "supervisor")
    .addEdge("writer", "supervisor")
    .compile();
}

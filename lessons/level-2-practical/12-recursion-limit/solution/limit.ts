// รันด้วย pnpm exec tsx lessons/level-2-practical/12-recursion-limit/solution/limit.ts
import { AIMessage } from "@langchain/core/messages";
import { END, GraphRecursionError, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { makeAddTool } from "@src/sampleTools";
import { check } from "@src/check";

const State = new StateSchema({ messages: MessagesValue, wantedRounds: z.number() });
const graph = new StateGraph(State)
  .addNode("agent", (state) => {
    const rounds = state.messages.filter((message) => message.type === "tool").length;
    const reply = rounds < state.wantedRounds
      ? new AIMessage({
          content: "",
          tool_calls: [
            { name: "add", args: { a: 1, b: 1 }, id: `c${rounds}`, type: "tool_call" },
          ],
        })
      : new AIMessage("เสร็จแล้ว");
    return { messages: [reply] };
  })
  .addNode("tools", new ToolNode([makeAddTool()]))
  .addEdge(START, "agent")
  .addConditionalEdges("agent", toolsCondition, ["tools", END])
  .addEdge("tools", "agent")
  .compile();

const maxToolRounds = 2;
const recursionLimit = 2 * maxToolRounds + 2;
console.log("recursionLimit =", recursionLimit);

const outcomes: string[] = [];
for (const wantedRounds of [2, 100]) {
  let outcome: string;
  try {
    const result = await graph.invoke({ messages: [], wantedRounds }, { recursionLimit });
    outcome = result.messages.at(-1)?.text ?? "";
  } catch (error) {
    if (!(error instanceof GraphRecursionError)) throw error;
    outcome = error.name;
  }
  outcomes.push(outcome);
  console.log(`ขอ tool ${wantedRounds} รอบ → ${outcome}`);
}

// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
check("งบครบสำหรับ 2 รอบ", recursionLimit === 6, "ใช้ 2 * maxToolRounds + 2");
check("ทำงานครบได้ 2 รอบ", outcomes[0] === "เสร็จแล้ว");
check("หยุดเมื่อจะทำ 100 รอบ", outcomes[1] === "GraphRecursionError");

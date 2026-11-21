// รันด้วย pnpm exec tsx lessons/level-2-practical/11-react-loop/solution/agent.ts
import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { makeAddTool } from "@src/sampleTools";
import { check } from "@src/check";

const State = new StateSchema({ messages: MessagesValue });
const graph = new StateGraph(State)
  .addNode("agent", (state) => {
    const last = state.messages.at(-1);
    if (ToolMessage.isInstance(last)) {
      return { messages: [new AIMessage(`ผลบวกคือ ${last.text}`)] };
    }
    // จำลองคำตอบของโมเดลจากข้อความล่าสุด
    if (last?.text === "12 + 30") {
      return { messages: [new AIMessage({
        content: "",
        tool_calls: [
          { name: "add", args: { a: 12, b: 30 }, id: "sum", type: "tool_call" },
        ],
      })] };
    }
    return { messages: [new AIMessage("สวัสดี")] };
  })
  .addNode("tools", new ToolNode([makeAddTool()]))
  .addEdge(START, "agent")
  .addConditionalEdges("agent", toolsCondition, ["tools", END])
  .addEdge("tools", "agent")
  .compile();

const result = await graph.invoke({ messages: [new HumanMessage("12 + 30")] });
for (const message of result.messages) {
  const toolNames = AIMessage.isInstance(message)
    ? message.tool_calls?.map((call) => call.name).join(", ")
    : "";
  console.log(`[${message.type}]`, message.text || `ขอเรียก ${toolNames}`);
}












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ได้ผลบวกจาก tool ใน State", result.messages[2]?.type === "tool" && result.messages[2].text === "42");
check("agent อ่านผลแล้วตอบ", result.messages.at(-1)?.text === "ผลบวกคือ 42");

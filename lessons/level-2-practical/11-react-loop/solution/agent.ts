import { HumanMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { makeAddTool, makeWeatherTool } from "@src/sampleTools";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-11
// ReAct loop: agent (LLM) -> ถ้าขอ tool ก็ไป tools -> กลับมา agent อีกรอบ ... วนจนกว่า LLM จะตอบเองโดยไม่ขอ tool
const State = new StateSchema({ messages: MessagesValue });
const tools = [makeAddTool(), makeWeatherTool()];
const llmWithTools = llm.bindTools!(tools);

const builder = new StateGraph(State)
  .addNode("agent", async (state) => {
    // ข้อ 1: เรียก llmWithTools.invoke(state.messages) แล้วคืนผลเข้า messages
    return { messages: [await llmWithTools.invoke(state.messages)] };
  })
  .addNode("tools", new ToolNode(tools))
  .addEdge(START, "agent");

// ข้อ 2: เพิ่ม conditional edge จาก "agent" ใช้ toolsCondition (มี tool call ไป "tools" ไม่มีไป END)
builder.addConditionalEdges("agent", toolsCondition, ["tools", END]);

// ข้อ 3: เพิ่ม edge จาก "tools" กลับไป "agent" เพื่อปิดวง
builder.addEdge("tools", "agent");

const graph = builder.compile();
const result = await graph.invoke({
  messages: [new HumanMessage("ใช้ tool บวก 12 กับ 30 และบอกอากาศที่เชียงใหม่ด้วย")],
});
for (const m of result.messages) console.log(`[${m.type}]`, m.text || JSON.stringify((m as { tool_calls?: unknown }).tool_calls));

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
const toolMessages = result.messages.filter((m) => m.type === "tool");
const last = result.messages[result.messages.length - 1];
check("agent เรียก tool อย่างน้อยหนึ่งครั้ง", toolMessages.length >= 1, "ต้องต่อ agent -> tools ด้วย conditional edge");
check("ผล add (42) ปรากฏในข้อความของ tool", toolMessages.some((m) => m.text === "42"), "ต้องต่อ tools กลับ agent");
check("ข้อความสุดท้ายเป็นคำตอบของ AI (ไม่ใช่การขอ tool)", last.type === "ai" && last.text.length > 0);

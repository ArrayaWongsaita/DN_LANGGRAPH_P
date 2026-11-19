import { HumanMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { makeWeatherTool } from "@src/sampleTools";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-14
// agent ที่ตอบเป็นข้อความอิสระ เอาไปใช้ต่อในโปรแกรมยาก: ขั้นสุดท้ายให้ LLM "จัดคำตอบเป็นโครงสร้าง" ตาม schema
// ข้อ 1: schema ของคำตอบสุดท้าย { city: string, tempC: number, summary: string }
const AnswerSchema = z.object({ city: z.string(), tempC: z.number(), summary: z.string() });

const State = new StateSchema({ messages: MessagesValue, answer: AnswerSchema.optional() });
const tools = [makeWeatherTool()];
const llmWithTools = llm.bindTools!(tools);

const graph = new StateGraph(State)
  .addNode("agent", async (state) => ({ messages: [await llmWithTools.invoke(state.messages)] }))
  .addNode("tools", new ToolNode(tools))
  .addNode("format", async (state) => {
    // ข้อ 2: ใช้ llm.withStructuredOutput(AnswerSchema, { method: "functionCalling" }) แล้วเรียก .invoke(state.messages)
    //        คืน { answer: ผลที่ได้ }
    const structured = llm.withStructuredOutput(AnswerSchema, { method: "functionCalling" });
    return { answer: await structured.invoke(state.messages) };
  })
  .addEdge(START, "agent")
  .addConditionalEdges(
    "agent",
    (state) => {
      const last = state.messages[state.messages.length - 1];
      return "tool_calls" in last && Array.isArray(last.tool_calls) && last.tool_calls.length > 0 ? "tools" : "format";
    },
    ["tools", "format"],
  )
  .addEdge("tools", "agent")
  .addEdge("format", END)
  .compile();

const result = await graph.invoke({ messages: [new HumanMessage("อากาศที่เชียงใหม่เป็นอย่างไร")] });
console.log("answer:", result.answer);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ได้ answer ที่เป็น object", typeof result.answer === "object" && result.answer !== null, "node format ต้องคืน { answer }");
check("city เป็นข้อความที่ไม่ว่าง", typeof result.answer?.city === "string" && result.answer.city.length > 0);
check("tempC เป็นตัวเลข 22 (มาจาก tool)", result.answer?.tempC === 22, "tempC ต้องเป็นตัวเลข ไม่ใช่ข้อความ");
check("summary เป็นข้อความที่ไม่ว่าง", typeof result.answer?.summary === "string" && result.answer.summary.length > 0);

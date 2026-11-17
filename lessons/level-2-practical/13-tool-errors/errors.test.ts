import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { countToolErrors, makeDivideTool } from "./errors";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
// agent แบบ ReAct (เหมือนบท 2-11) ใช้ประกอบการตรวจ
const AgentState = new StateSchema({ messages: MessagesValue });
function buildAgent(llm: BaseChatModel, tools: StructuredToolInterface[]) {
  const withTools = llm.bindTools!(tools);
  return new StateGraph(AgentState)
    .addNode("agent", async (state) => ({ messages: [await withTools.invoke(state.messages)] }))
    .addNode("tools", new ToolNode(tools))
    .addEdge(START, "agent")
    .addConditionalEdges("agent", toolsCondition, ["tools", END])
    .addEdge("tools", "agent")
    .compile();
}
async function runAgent(graph: ReturnType<typeof buildAgent>, question: string) {
  return (await graph.invoke({ messages: [new HumanMessage(question)] })).messages;
}

const callDivide = (a: number, b: number) => ({ toolCalls: [{ name: "divide", args: { a, b } }] });

test("divide: หารปกติ", async () => {
  expect(await makeDivideTool().invoke({ a: 6, b: 3 })).toBe("2");
});

test("divide: หารด้วยศูนย์ throw ข้อความที่บอกสาเหตุ", async () => {
  await expect(makeDivideTool().invoke({ a: 1, b: 0 })).rejects.toThrow("หารด้วยศูนย์ไม่ได้");
});

test("agent ไม่ล่มเมื่อ tool พัง: LLM เห็นข้อความ error แล้วตอบต่อได้", async () => {
  const llm = fakeToolLLM([callDivide(1, 0), "หารด้วยศูนย์ไม่ได้ครับ"]);
  const messages = await runAgent(buildAgent(llm, [makeDivideTool()]), "1 หาร 0");
  expect(llm.calls[1].at(-1)?.text).toContain("หารด้วยศูนย์ไม่ได้");
  expect(messages.at(-1)?.text).toBe("หารด้วยศูนย์ไม่ได้ครับ");
});

test("countToolErrors นับเฉพาะ tool message ที่เป็น error", async () => {
  const llm = fakeToolLLM([callDivide(1, 0), callDivide(4, 2), "จบ"]);
  const messages = await runAgent(buildAgent(llm, [makeDivideTool()]), "ลองสองครั้ง");
  expect(countToolErrors(messages)).toBe(1);
  expect(countToolErrors([new HumanMessage("x")])).toBe(0);
});

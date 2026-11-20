// รันด้วย pnpm exec tsx lessons/level-2-practical/10-tool-node/solution/toolNode.ts
import { AIMessage, type ToolMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { makeAddTool, makeWeatherTool } from "@src/sampleTools";
import { check } from "@src/check";

const tools = [makeAddTool(), makeWeatherTool()];
const node = new ToolNode(tools);

const request = new AIMessage({
  content: "",
  tool_calls: [
    { name: "add", args: { a: 1, b: 1 }, id: "x", type: "tool_call" },
  ],
});

const { messages }: { messages: ToolMessage[] } = await node.invoke({ messages: [request] });
console.log(JSON.stringify(messages.map((message) => ({
  tool_call_id: message.tool_call_id,
  content: message.content,
}))));

// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
check("ได้ผล 1 ข้อความสำหรับ 1 คำขอ", messages.length === 1);
check("คำขอ x ได้ผลบวก 2", messages[0]?.tool_call_id === "x" && messages[0].text === "2");

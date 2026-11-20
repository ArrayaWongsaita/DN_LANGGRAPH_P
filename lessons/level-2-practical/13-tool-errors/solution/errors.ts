// รันด้วย pnpm exec tsx lessons/level-2-practical/13-tool-errors/solution/errors.ts
import { AIMessage, type ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { check } from "@src/check";

const divide = tool(({ a, b }) => {
  if (b === 0) throw new Error("หารด้วยศูนย์ไม่ได้");
  return String(a / b);
}, {
  name: "divide",
  description: "หาร a ด้วย b",
  schema: z.object({ a: z.number(), b: z.number() }),
});

const request = new AIMessage({
  content: "",
  tool_calls: [
    { name: "divide", args: { a: 6, b: 3 }, id: "ok", type: "tool_call" },
    { name: "divide", args: { a: 1, b: 0 }, id: "bad", type: "tool_call" },
  ],
});

const node = new ToolNode([divide]);
const { messages }: { messages: ToolMessage[] } = await node.invoke({ messages: [request] });
for (const message of messages) {
  console.log(JSON.stringify({
    tool_call_id: message.tool_call_id,
    status: message.status,
    content: message.content,
  }));
}

// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
check("หาร 6 ด้วย 3 ได้ 2", messages[0]?.status === "success" && messages[0].text === "2");
check("หารด้วยศูนย์ได้ข้อความ error", messages[1]?.status === "error" && messages[1].text.includes("หารด้วยศูนย์ไม่ได้"));

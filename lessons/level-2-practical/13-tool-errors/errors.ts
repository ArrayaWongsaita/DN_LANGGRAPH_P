// รันด้วย pnpm lesson 2-13
import { AIMessage, type ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { check } from "@src/check";
import { todo } from "@src/todo";

const divide = tool(({ a, b }) => {
  // 👉 ข้อ 1 ให้ throw new Error("หารด้วยศูนย์ไม่ได้") เมื่อ b เป็น 0
  // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
  //   if (b === 0) throw new Error("หารด้วยศูนย์ไม่ได้");
  if (b === 0) todo(1);
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












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("หาร 6 ด้วย 3 ได้ 2", messages[0]?.status === "success" && messages[0].text === "2");
check("หารด้วยศูนย์ได้ข้อความ error", messages[1]?.status === "error" && messages[1].text.includes("หารด้วยศูนย์ไม่ได้"));

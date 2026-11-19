import { AIMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-13  (ไม่ใช้ LLM)
// tool ที่ throw error ไม่ควรทำให้ agent ล้มทั้งตัว: ToolNode จับ error แล้วส่งกลับเป็น ToolMessage ที่ status = "error"
// เพื่อให้ LLM อ่านแล้วแก้ตัวเองได้ (เช่นลองใหม่ด้วยค่าอื่น)
const divide = tool(
  ({ a, b }: { a: number; b: number }) => {
    // ข้อ 1: ถ้า b เป็น 0 ให้ throw new Error("หารด้วยศูนย์ไม่ได้")
    // ข้อ 2: ไม่เช่นนั้นคืน String(a / b)
    if (b === 0) throw new Error("หารด้วยศูนย์ไม่ได้");
    return String(a / b);
  },
  {
    name: "divide",
    description: "หารเลข a ด้วย b",
    schema: z.object({ a: z.number(), b: z.number() }),
  },
);

// AIMessage ที่ขอหารสองครั้ง: ครั้งแรกปกติ ครั้งที่สองหารด้วยศูนย์
const request = new AIMessage({
  content: "",
  tool_calls: [
    { name: "divide", args: { a: 6, b: 3 }, id: "ok", type: "tool_call" },
    { name: "divide", args: { a: 1, b: 0 }, id: "bad", type: "tool_call" },
  ],
});
const out = (await new ToolNode([divide]).invoke({ messages: [request] })).messages as ToolMessage[];
console.log(out.map((m) => ({ id: m.tool_call_id, status: m.status, content: m.content })));

// ข้อ 3: นับ ToolMessage ที่เป็น error ใน out
const errorCount: number = out.filter((m) => ToolMessage.isInstance(m) && m.status === "error").length;

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("หารปกติได้ '2'", out[0]?.content === "2", "คืน String(a / b)");
check("หารด้วยศูนย์ไม่ crash ได้ ToolMessage ที่มีข้อความ error", String(out[1]?.content).includes("หารด้วยศูนย์ไม่ได้"), 'throw new Error("หารด้วยศูนย์ไม่ได้") เมื่อ b เป็น 0');
check("นับ error ได้ 1", errorCount === 1, 'นับข้อความที่ status === "error"');

import { type BaseMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { todo } from "@src/todo";
import { z } from "zod";

export function makeDivideTool() {
  return tool(
    ({ a, b }: { a: number; b: number }) => {
      // 👉 ข้อ 1: ถ้า b เป็น 0 ให้ throw new Error("หารด้วยศูนย์ไม่ได้")
      // 👉 ข้อ 2: ไม่เช่นนั้นคืน String(a / b)
      return todo(2);
    },
    {
      name: "divide",
      description: "หารเลข a ด้วย b",
      schema: z.object({ a: z.number(), b: z.number() }),
    },
  );
}

// นับจำนวน ToolMessage ที่เป็น error ในประวัติข้อความ
export function countToolErrors(messages: BaseMessage[]): number {
  // 👉 ข้อ 3: นับข้อความที่ ToolMessage.isInstance(m) และ m.status === "error"
  return todo(3);
}

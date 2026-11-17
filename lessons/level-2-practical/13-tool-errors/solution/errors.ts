import { type BaseMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export function makeDivideTool() {
  return tool(
    ({ a, b }: { a: number; b: number }) => {
      if (b === 0) throw new Error("หารด้วยศูนย์ไม่ได้");
      return String(a / b);
    },
    {
      name: "divide",
      description: "หารเลข a ด้วย b",
      schema: z.object({ a: z.number(), b: z.number() }),
    },
  );
}

export function countToolErrors(messages: BaseMessage[]): number {
  return messages.filter((m) => ToolMessage.isInstance(m) && m.status === "error").length;
}

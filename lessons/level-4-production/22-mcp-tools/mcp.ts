import { fileURLToPath } from "node:url";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createAgent } from "langchain";
import { todo } from "@src/todo";

const SERVER_PATH = fileURLToPath(new URL("./server.mts", import.meta.url));

export function makeClient() {
  // 👉 ข้อ 1: คืน new MultiServerMCPClient({ mcpServers: { calc: { transport: "stdio", command: "node", args: ["--import", "tsx", SERVER_PATH] } } })
  return todo(1);
}

export async function askWithMcp(llm: BaseChatModel, question: string) {
  const client = makeClient();
  try {
    // 👉 ข้อ 2: tools = await client.getTools(); agent = createAgent({ model: llm, tools })
    //          แล้ว invoke ด้วย { messages: [new HumanMessage(question)] } และคืน { answer: ข้อความสุดท้าย, toolNames: tools.map((t) => t.name) }
    return await todo(2);
  } finally {
    // 👉 ข้อ 3: await client.close()
    todo(3);
  }
}

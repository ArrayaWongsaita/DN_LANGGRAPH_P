import { fileURLToPath } from "node:url";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createAgent } from "langchain";

const SERVER_PATH = fileURLToPath(new URL("./server.mts", import.meta.url));

export function makeClient() {
  return new MultiServerMCPClient({
    mcpServers: { calc: { transport: "stdio", command: "node", args: ["--import", "tsx", SERVER_PATH] } },
  });
}

export async function askWithMcp(llm: BaseChatModel, question: string) {
  const client = makeClient();
  try {
    const tools = await client.getTools();
    const agent = createAgent({ model: llm, tools });
    const result = await agent.invoke({ messages: [new HumanMessage(question)] });
    return { answer: result.messages[result.messages.length - 1].text, toolNames: tools.map((t) => t.name) };
  } finally {
    await client.close();
  }
}

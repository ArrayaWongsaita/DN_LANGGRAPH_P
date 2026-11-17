import { createHash } from "node:crypto";
import type { BaseCheckpointSaver } from "@langchain/langgraph";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

export const MAX_THREAD_ID = 255;

export function makePostgresSaver(connectionString: string): PostgresSaver {
  return PostgresSaver.fromConnString(connectionString);
}

const State = new StateSchema({ messages: MessagesValue });

export function buildChatApp(checkpointer: BaseCheckpointSaver) {
  const builder = new StateGraph(State)
    .addNode("reply", (state) => ({ messages: [{ role: "assistant", content: `ฉันจำได้ ${state.messages.length} ข้อความ` }] }))
    .addEdge(START, "reply")
    .addEdge("reply", END);
  return builder.compile({ checkpointer });
}

export function safeThreadId(id: string): string {
  if (id.length <= MAX_THREAD_ID) return id;
  return `t_${createHash("sha256").update(id).digest("hex")}`;
}

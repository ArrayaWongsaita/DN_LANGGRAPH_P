import { AIMessage, HumanMessage, type BaseMessage } from "@langchain/core/messages";

export interface Turn {
  role: "user" | "assistant";
  text: string;
}

// แปลงประวัติการคุยเป็น message ตามลำดับ
export function buildConversation(turns: Turn[]): BaseMessage[] {
  return turns.map((t) => (t.role === "user" ? new HumanMessage(t.text) : new AIMessage(t.text)));
}

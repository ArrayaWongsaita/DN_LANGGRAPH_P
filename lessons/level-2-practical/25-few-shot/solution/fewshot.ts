import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AIMessage, type BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";

export interface Example {
  input: string;
  output: string;
}

const SYSTEM = "จัดประเภทความรู้สึกของข้อความ ตอบคำเดียว: บวก หรือ ลบ";

export function buildFewShot(examples: Example[], input: string): BaseMessage[] {
  return [
    new SystemMessage(SYSTEM),
    ...examples.flatMap((e) => [new HumanMessage(e.input), new AIMessage(e.output)]),
    new HumanMessage(input),
  ];
}

export async function classify(llm: BaseChatModel, examples: Example[], input: string): Promise<string> {
  const reply = await llm.invoke(buildFewShot(examples, input));
  return reply.text.trim();
}

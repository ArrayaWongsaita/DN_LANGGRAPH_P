import { AIMessage, HumanMessage, type BaseMessage } from "@langchain/core/messages";

export interface Example {
  input: string;
  output: string;
}

// few-shot = ใส่ตัวอย่างถาม-ตอบก่อน เพื่อให้ LLM ทำตามแบบ
export function buildFewShot(examples: Example[], input: string): BaseMessage[] {
  return [
    ...examples.flatMap((e) => [new HumanMessage(e.input), new AIMessage(e.output)]),
    new HumanMessage(input),
  ];
}

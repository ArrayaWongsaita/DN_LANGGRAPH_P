import type { AIMessage } from "@langchain/core/messages";

export interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

// token = หน่วยที่ LLM คิดปริมาณงาน/โควตา อ่านได้จาก usage_metadata
export function getTokenUsage(msg: AIMessage): TokenUsage {
  const input = msg.usage_metadata?.input_tokens ?? 0;
  const output = msg.usage_metadata?.output_tokens ?? 0;
  return { input, output, total: input + output };
}

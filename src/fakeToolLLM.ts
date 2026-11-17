import { BaseChatModel, type BaseChatModelParams } from "@langchain/core/language_models/chat_models";
import { AIMessage, type BaseMessage } from "@langchain/core/messages";
import type { ChatResult } from "@langchain/core/outputs";
import { type Runnable, RunnableLambda } from "@langchain/core/runnables";
import type { StructuredToolInterface } from "@langchain/core/tools";
import type { ZodType } from "zod";

/**
 * LLM ปลอมสำหรับ test ของ Level 2 (ที่ต้องมี tool call)
 * ตอบตาม "สคริปต์" ทีละขั้นตามลำดับ แต่ละขั้นเป็นข้อความ หรือ { toolCalls: [...] } ที่สั่งให้เรียก tool
 * ต่างจาก fakeLLM ตรงที่ "ไม่วนซ้ำ": เรียกเกินสคริปต์จะ throw จะได้รู้ว่า agent วนมากกว่าที่คิด
 */
export type ScriptStep = string | { text?: string; toolCalls: { name: string; args: Record<string, unknown>; id?: string }[] };

export class FakeToolLLM extends BaseChatModel {
  /** ข้อความที่ถูกส่งเข้ามาในแต่ละครั้งที่เรียก (ไว้ตรวจใน test) */
  calls: BaseMessage[][] = [];
  /** ชื่อ tool ที่ถูก bindTools ล่าสุด */
  boundToolNames: string[] = [];
  private readonly script: ScriptStep[];

  constructor(script: ScriptStep[], params: BaseChatModelParams = {}) {
    super(params);
    this.script = script;
  }

  _llmType() {
    return "fake-tool-llm";
  }

  async _generate(messages: BaseMessage[]): Promise<ChatResult> {
    this.calls.push(messages);
    const step = this.script[this.calls.length - 1];
    if (step === undefined) {
      throw new Error(`fakeToolLLM: ไม่มีขั้นเหลือในสคริปต์แล้ว (เรียกครั้งที่ ${this.calls.length})`);
    }
    const message =
      typeof step === "string"
        ? new AIMessage(step)
        : new AIMessage({
            content: step.text ?? "",
            tool_calls: step.toolCalls.map((c, i) => ({
              name: c.name,
              args: c.args,
              id: c.id ?? `call_${this.calls.length}_${i}`,
              type: "tool_call" as const,
            })),
          });
    return { generations: [{ text: message.text, message }] };
  }

  // ไม่สร้างตัวใหม่: ใช้สคริปต์และตัวนับเดียวกัน (agent เรียก bindTools ครั้งเดียวแล้วใช้ต่อ)
  bindTools(tools: (StructuredToolInterface | Record<string, unknown>)[]): this {
    this.boundToolNames = tools.map((t) => ("name" in t ? String(t.name) : "?"));
    return this;
  }

  // อ่านข้อความของขั้นปัจจุบันเป็น JSON แล้วตรวจกับ schema (เหมือนตัวจริงที่ตรวจ zod)
  withStructuredOutput<T = Record<string, unknown>>(schema: ZodType): Runnable<unknown, T> {
    return this.pipe(
      new RunnableLambda({
        func: (message: AIMessage) => {
          let data: unknown;
          try {
            data = JSON.parse(message.text);
          } catch {
            throw new Error(`fakeToolLLM: ข้อความไม่ใช่ JSON: ${message.text}`);
          }
          return schema.parse(data);
        },
      }),
    ) as unknown as Runnable<unknown, T>;
  }
}

export function fakeToolLLM(script: ScriptStep[]): FakeToolLLM {
  return new FakeToolLLM(script);
}

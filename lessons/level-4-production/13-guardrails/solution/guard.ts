import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AIMessage } from "@langchain/core/messages";
import { createAgent, createMiddleware } from "langchain";

export const BANNED = ["สร้างอาวุธ", "เจาะระบบ"];
export const SECRET = "รหัสลับ-777";

type State = { messages: { text: string; id?: string }[] };

export function makeInputGuard() {
  return createMiddleware({
    name: "inputGuard",
    beforeModel: {
      canJumpTo: ["end"],
      hook: async (state: State) => {
        const last = state.messages[state.messages.length - 1]?.text ?? "";
        if (BANNED.some((word) => last.includes(word))) {
          return { messages: [new AIMessage("ขออภัย ช่วยเรื่องนี้ไม่ได้")], jumpTo: "end" };
        }
        return undefined;
      },
    },
  } as never);
}

export function makeOutputGuard() {
  return createMiddleware({
    name: "outputGuard",
    afterModel: {
      canJumpTo: ["end"],
      hook: async (state: State) => {
        const leaked = state.messages[state.messages.length - 1];
        if (leaked?.text.includes(SECRET)) {
          return { messages: [new AIMessage({ content: "[ข้อมูลถูกปิดบัง]", id: leaked.id })], jumpTo: "end" };
        }
        return undefined;
      },
    },
  } as never);
}

export function buildGuardedAgent(llm: BaseChatModel) {
  return createAgent({ model: llm, tools: [], middleware: [makeInputGuard(), makeOutputGuard()] as never });
}

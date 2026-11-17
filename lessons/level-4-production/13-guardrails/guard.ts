import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AIMessage } from "@langchain/core/messages";
import { createAgent, createMiddleware } from "langchain";
import { todo } from "@src/todo";

export const BANNED = ["สร้างอาวุธ", "เจาะระบบ"];
export const SECRET = "รหัสลับ-777";

type State = { messages: { text: string }[] };

export function makeInputGuard() {
  return createMiddleware({
    name: "inputGuard",
    beforeModel: {
      canJumpTo: ["end"],
      hook: async (state: State) => {
        const last = state.messages[state.messages.length - 1]?.text ?? "";
        // 👉 ข้อ 1: ถ้า last มีคำใดใน BANNED คืน { messages: [new AIMessage("ขออภัย ช่วยเรื่องนี้ไม่ได้")], jumpTo: "end" }
        //          ไม่เช่นนั้นคืน undefined
        return todo(1);
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
        const last = state.messages[state.messages.length - 1]?.text ?? "";
        // 👉 ข้อ 2: ถ้า last มี SECRET คืน { messages: [new AIMessage("[ข้อมูลถูกปิดบัง]")], jumpTo: "end" } ไม่เช่นนั้นคืน undefined
        return todo(2);
      },
    },
  } as never);
}

export function buildGuardedAgent(llm: BaseChatModel) {
  return createAgent({ model: llm, tools: [], middleware: [makeInputGuard(), makeOutputGuard()] as never });
}

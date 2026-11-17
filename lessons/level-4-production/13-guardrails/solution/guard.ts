import type { BaseCheckpointSaver } from "@langchain/langgraph";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AIMessage } from "@langchain/core/messages";
import { createAgent, createMiddleware } from "langchain";

export const BANNED = ["สร้างอาวุธ", "เจาะระบบ"];
export const SECRET = "รหัสลับ-777";

type State = { messages: { text: string; id?: string; type?: string }[] };

// ข้อความที่ผู้ใช้ส่งมาและโมเดลยังไม่ได้ตอบ (ทุกข้อความหลัง AI ตัวล่าสุด) ตัดอักขระความกว้างศูนย์ที่ใช้พรางคำต้องห้ามออก
function pendingUserText(state: State): string {
  const lastAi = state.messages.map((m) => m.type).lastIndexOf("ai");
  return state.messages
    .slice(lastAi + 1)
    .map((m) => m.text)
    .join("\n")
    .replace(/[\u200b-\u200d\u2060\ufeff]/g, "");
}

export function makeInputGuard() {
  return createMiddleware({
    name: "inputGuard",
    beforeModel: {
      canJumpTo: ["end"],
      hook: async (state: State) => {
        const last = pendingUserText(state);
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

export function buildGuardedAgent(llm: BaseChatModel, checkpointer?: BaseCheckpointSaver) {
  return createAgent({ model: llm, tools: [], middleware: [makeInputGuard(), makeOutputGuard()] as never, checkpointer });
}

import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { createAgent, createMiddleware, dynamicSystemPromptMiddleware } from "langchain";
import { z } from "zod";

export const contextSchema = z.object({
  tier: z.enum(["free", "pro"]).default("free"),
  name: z.string().default("ผู้ใช้"),
  language: z.string().default("ไทย"),
});
export type Ctx = z.infer<typeof contextSchema>;

export function sanitizeName(raw: unknown, maxLength = 30): string {
  if (typeof raw !== "string") return "ผู้ใช้";
  const cleaned = raw
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[<>`{}]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength)
    .trim();
  return cleaned === "" ? "ผู้ใช้" : cleaned;
}

export function buildSystemPrompt(ctx: Partial<Ctx>): string {
  const lines = [
    "คุณเป็นผู้ช่วยของบริษัท ตอบสุภาพและกระชับ",
    `ตอบเป็นภาษา${ctx.language ?? "ไทย"}`,
    `ผู้ใช้ชื่อ: ${sanitizeName(ctx.name)}`,
    ctx.tier === "pro" ? "ผู้ใช้เป็นสมาชิก Pro: ให้รายละเอียดเชิงลึกได้" : "ผู้ใช้เป็นสมาชิก Free: ตอบสั้น",
  ];
  return `${lines.join("\n")}\n`;
}

export function pickModel<T>(ctx: { tier?: unknown } | undefined, models: { cheap: T; strong: T }): T {
  return ctx?.tier === "pro" ? models.strong : models.cheap;
}

export function buildContextAgent(models: { cheap: BaseChatModel; strong: BaseChatModel }) {
  const prompt = dynamicSystemPromptMiddleware<Ctx>((_state, runtime) => buildSystemPrompt(runtime.context ?? {}));
  const router = createMiddleware({
    name: "tier-router",
    contextSchema,
    wrapModelCall: async (request, handler) => {
      const model = pickModel(request.runtime.context as { tier?: unknown } | undefined, models);
      return handler({ ...request, model });
    },
  });
  return createAgent({ model: models.cheap, contextSchema, middleware: [prompt, router] });
}

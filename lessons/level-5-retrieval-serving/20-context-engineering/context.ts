import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { createAgent, createMiddleware, dynamicSystemPromptMiddleware } from "langchain";
import { todo } from "@src/todo";
import { z } from "zod";

export const contextSchema = z.object({
  tier: z.enum(["free", "pro"]).default("free"),
  name: z.string().default("ผู้ใช้"),
  language: z.string().default("ไทย"),
});
export type Ctx = z.infer<typeof contextSchema>;

// ทำความสะอาดข้อความที่ผู้ใช้ตั้งเอง (เช่นชื่อ) ก่อนเอาไปใส่พรอมต์
export function sanitizeName(raw: unknown, maxLength = 30): string {
  // 👉 ข้อ 1: ถ้า raw ไม่ใช่สตริงหรือหลังทำความสะอาดแล้วว่าง คืน "ผู้ใช้"
  //          ทำความสะอาด = แทนทุกตัวอักษรควบคุม/ขึ้นบรรทัดใหม่ (/[\u0000-\u001f\u007f]/g) ด้วยช่องว่าง,
  //          ตัดอักขระ < > ` { } ออก, ยุบช่องว่างซ้อนเป็นหนึ่ง, trim แล้วตัดให้ไม่เกิน maxLength ตัวอักษร (ตัดแล้ว trim อีกครั้ง)
  return todo(1);
}

export function buildSystemPrompt(ctx: Partial<Ctx>): string {
  // 👉 ข้อ 2: คืนข้อความหลายบรรทัดต่อไปนี้ (ส่วนคงที่ขึ้นก่อน ส่วนที่เปลี่ยนตามผู้ใช้ต่อท้าย):
  //   "คุณเป็นผู้ช่วยของบริษัท ตอบสุภาพและกระชับ"
  //   `ตอบเป็นภาษา${ctx.language ?? "ไทย"}`
  //   `ผู้ใช้ชื่อ: ${sanitizeName(ctx.name)}`
  //   และถ้า ctx.tier === "pro" ให้เพิ่มบรรทัด "ผู้ใช้เป็นสมาชิก Pro: ให้รายละเอียดเชิงลึกได้" ไม่งั้นเพิ่ม "ผู้ใช้เป็นสมาชิก Free: ตอบสั้น"
  //   (ต่อด้วย "\n")
  return todo(2);
}

export function pickModel<T>(ctx: { tier?: unknown } | undefined, models: { cheap: T; strong: T }): T {
  // 👉 ข้อ 3: ctx?.tier === "pro" → models.strong นอกนั้นทั้งหมด (free, ค่าผิดรูป, undefined) → models.cheap (ค่าเริ่มต้นที่ปลอดภัยด้านค่าใช้จ่าย)
  return todo(3);
}

export function buildContextAgent(models: { cheap: BaseChatModel; strong: BaseChatModel }) {
  const prompt = dynamicSystemPromptMiddleware<Ctx>((_state, runtime) => buildSystemPrompt(runtime.context ?? {}));
  const router = createMiddleware({
    name: "tier-router",
    contextSchema,
    wrapModelCall: async (request, handler) => {
      // 👉 ข้อ 4: เลือกโมเดลด้วย pickModel(request.runtime.context, models) แล้วส่งต่อด้วย handler({ ...request, model: ที่เลือก })
      return todo(4);
    },
  });
  return createAgent({ model: models.cheap, contextSchema, middleware: [prompt, router] });
}

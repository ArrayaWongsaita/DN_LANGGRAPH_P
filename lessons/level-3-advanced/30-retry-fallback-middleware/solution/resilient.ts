import type { BaseMessage } from "@langchain/core/messages";
import { HumanMessage } from "@langchain/core/messages";
import type { ChatResult } from "@langchain/core/outputs";
import { createAgent, createMiddleware, modelFallbackMiddleware, modelRetryMiddleware } from "langchain";
import { FakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-30
// ตัวหลักที่ "ล่มสองครั้งแล้วค่อยตอบได้" (ตัวจำลอง) ส่วนตัวสำรองคือ llm จริง: เรียน retry middleware, fallback middleware และเขียน middleware เอง
class FlakyModel extends FakeToolLLM {
  attempts = 0;
  constructor(script: string[], private failures: number) {
    super(script);
  }
  async _generate(messages: BaseMessage[]): Promise<ChatResult> {
    this.attempts++;
    if (this.failures > 0) {
      this.failures--;
      throw new Error("เครือข่ายล่ม");
    }
    return super._generate(messages);
  }
}

// ข้อ 1: const retry = modelRetryMiddleware({ maxRetries: 3, initialDelayMs: 1, jitter: false, onFailure: "error" });
const retry = modelRetryMiddleware({ maxRetries: 3, initialDelayMs: 1, jitter: false, onFailure: "error" });
// ข้อ 2: const fallback = modelFallbackMiddleware(llm);  (ถ้าตัวหลักยังล่ม ให้ใช้ llm ตอบแทน)
const fallback = modelFallbackMiddleware(llm);

const seen: number[] = [];
// ข้อ 3: middleware ที่เขียนเอง: const logger = createMiddleware({ name: "logger", beforeModel: async (state) => { seen.push(state.messages.length); return undefined; } });
const logger = createMiddleware({
  name: "logger",
  beforeModel: async (state) => {
    seen.push(state.messages.length);
    return undefined;
  },
});

// กรณีที่ 1: ตัวหลักล่ม 2 ครั้งแล้วผ่าน retry ช่วย / กรณีที่ 2: ตัวหลักล่มตลอด ต้องใช้ตัวสำรอง
const flaky = new FlakyModel(["หลักตอบแล้ว"], 2);
const dead = new FlakyModel(["ไม่ถึงตรงนี้"], 99);
const ask = async (primary: FlakyModel) => {
  const agent = createAgent({ model: primary, tools: [], middleware: [logger, fallback, retry] });
  const r = await agent.invoke({ messages: [new HumanMessage("ทักทายหนึ่งประโยค")] });
  return r.messages[r.messages.length - 1].text;
};
const retried = await ask(flaky);
const fellBack = await ask(dead);
console.log({ retried, fellBack: fellBack.slice(0, 60), flakyAttempts: flaky.attempts, seen });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ล่มสองครั้งแล้วผ่าน: retry ช่วย ได้คำตอบของตัวหลัก (ลอง 3 ครั้ง)", retried === "หลักตอบแล้ว" && flaky.attempts === 3, "modelRetryMiddleware({ maxRetries: 3 })");
check("ตัวหลักล่มตลอด: สลับไปตัวสำรอง (llm จริง) ได้คำตอบ", fellBack.length > 0 && fellBack !== "ไม่ถึงตรงนี้", "modelFallbackMiddleware(llm)");
check("middleware ที่เขียนเองจดจำนวนข้อความก่อนเรียกโมเดล", seen.length >= 2 && seen[0] === 1, "beforeModel ต้อง push state.messages.length");

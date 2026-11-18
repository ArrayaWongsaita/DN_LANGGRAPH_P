import { randomUUID } from "node:crypto";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";
import { PROVIDER_KEY_VARS, type ProviderName, env } from "./env";

// ================================================================
// ไฟล์นี้คือ "จุดเดียว" ที่รู้ว่าเราสร้างตัวเรียก LLM ของเจ้าไหนอย่างไร
// ทุกบทเรียนเรียก getLLM() จากที่นี่ ไม่มีบทไหน import แพ็กเกจของ provider ตรง ๆ
// ค่าตั้งต้นทั้งหมดมาจาก src/env.ts (อ่านและตรวจจาก .env แล้ว) ไม่ต้องอ่าน process.env เอง
//
// เปลี่ยน provider / โมเดล: แก้ไฟล์ .env เท่านั้น
//   LLM_PROVIDER=groq        (ค่าเริ่มต้น)
//   LLM_MODEL=...            (ไม่ใส่ = ใช้โมเดลเริ่มต้นของ provider)
//   GROQ_API_KEY=...         (ตัวแปรของ key ขึ้นกับ provider ที่เลือก)
//
// เพิ่ม provider ใหม่ (เช่น OpenAI):
//   1. pnpm add --save-exact @langchain/openai
//   2. ใน src/env.ts: เพิ่มชื่อใน PROVIDER_KEY_VARS (เช่น openai: "OPENAI_API_KEY") และ field OPENAI_API_KEY ใน envSchema
//   3. ที่นี่: import { ChatOpenAI } from "@langchain/openai"; แล้วเพิ่มแถวในตาราง PROVIDERS:
//        openai: {
//          defaultModel: "<ชื่อโมเดล>",
//          chatUrl: () => "https://api.openai.com/v1/chat/completions",
//          create: ({ model, apiKey, temperature }) =>
//            new ChatOpenAI({ model, apiKey, ...(temperature !== undefined ? { temperature } : {}) }),
//        },
// ห้ามเปลี่ยน return type: ต้องคืน BaseChatModel เหมือนเดิม บทเรียนอื่นไม่ต้องแก้เลย
// หลังเปลี่ยนแล้วรัน `pnpm check:llm` เพื่อดูว่า provider ใหม่รองรับอะไรบ้าง
// ================================================================

export type { ProviderName };

export interface LLMOptions {
  temperature?: number;
  model?: string;
}

interface CreateArgs {
  model: string;
  apiKey: string;
  temperature?: number;
}

interface Provider {
  defaultModel: string;
  // URL ของ chat completions (รูปแบบ OpenAI-compatible) ใช้ในบท Level 0 ที่เรียกด้วย fetch ตรง ๆ
  chatUrl: () => string;
  create: (args: CreateArgs) => BaseChatModel;
}

const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
const OPENCODE_BASE_URL = "https://opencode.ai/zen/go/v1";
// OpenCode Go ต้องการ header นี้ (รหัส session ต่อหนึ่งโปรเซส) ไม่งั้นตอบ 400
const OPENCODE_HEADERS = { "x-opencode-session": randomUUID() };

const withTemperature = (temperature?: number) =>
  temperature !== undefined ? { temperature } : {};

// Record<ProviderName, ...> บังคับให้มีแถวครบทุก provider ที่ประกาศไว้ใน src/env.ts
const PROVIDERS: Record<ProviderName, Provider> = {
  groq: {
    defaultModel: "openai/gpt-oss-20b",
    chatUrl: () => "https://api.groq.com/openai/v1/chat/completions",
    create: ({ model, apiKey, temperature }) =>
      new ChatGroq({ model, apiKey, ...withTemperature(temperature) }),
  },
  deepseek: {
    defaultModel: "deepseek-flash",
    // DeepSeek ใช้รูปแบบ OpenAI-compatible จึงใช้ ChatOpenAI ชี้ไปที่ baseURL ของ DeepSeek
    chatUrl: () => `${DEEPSEEK_BASE_URL}/chat/completions`,
    create: ({ model, apiKey, temperature }) =>
      new ChatOpenAI({
        model,
        apiKey,
        configuration: { baseURL: DEEPSEEK_BASE_URL },
        // ปิดโหมดคิด (thinking) เพราะเปิดอยู่จะใช้ tool_choice ไม่ได้ (error 400) ตอนเรียก tool
        modelKwargs: { thinking: { type: "disabled" } },
        ...withTemperature(temperature),
      }),
  },
  opencode: {
    defaultModel: "deepseek-v4.1-flash",
    chatUrl: () => `${OPENCODE_BASE_URL}/chat/completions`,
    create: ({ model, apiKey, temperature }) =>
      new ChatOpenAI({
        model,
        apiKey,
        configuration: { baseURL: OPENCODE_BASE_URL, defaultHeaders: OPENCODE_HEADERS },
        ...withTemperature(temperature),
      }),
  },
  google: {
    defaultModel: "gemini-flash-lite-latest",
    // endpoint แบบ OpenAI-compatible ของ Google ใช้ในบท Level 0 ที่เรียกด้วย fetch ตรง ๆ (ส่ง key ใน Authorization: Bearer)
    chatUrl: () => "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    create: ({ model, apiKey, temperature }) =>
      new ChatGoogleGenerativeAI({ model, apiKey, ...withTemperature(temperature) }),
  },
};

export function describeProvider(options: LLMOptions = {}): {
  provider: ProviderName;
  model: string;
  keyVar: string;
  apiKey: string;
  chatUrl: string;
} {
  const provider = env.LLM_PROVIDER;
  const spec = PROVIDERS[provider];
  const keyVar = PROVIDER_KEY_VARS[provider];
  return {
    provider,
    model: options.model ?? (env.LLM_MODEL || spec.defaultModel),
    keyVar,
    apiKey: env[keyVar],
    chatUrl: spec.chatUrl(),
  };
}

export function getLLM(options: LLMOptions = {}): BaseChatModel {
  const { provider, model, apiKey } = describeProvider(options);
  return PROVIDERS[provider].create({ model, apiKey, temperature: options.temperature });
}

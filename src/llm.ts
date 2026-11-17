import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatGroq } from "@langchain/groq";
import { ChatOllama } from "@langchain/ollama";

// ================================================================
// ไฟล์นี้คือ "จุดเดียว" ที่รู้ว่าเราใช้ LLM เจ้าไหน
// ทุกบทเรียนเรียก getLLM() จากที่นี่ ไม่มีบทไหน import แพ็กเกจของ provider ตรง ๆ
//
// เปลี่ยน provider / โมเดล: แก้ไฟล์ .env เท่านั้น
//   LLM_PROVIDER=groq        (ค่าเริ่มต้น)
//   LLM_MODEL=...            (ไม่ใส่ = ใช้โมเดลเริ่มต้นของ provider)
//   GROQ_API_KEY=...         (ตัวแปรของ key ขึ้นกับ provider ที่เลือก)
//
// เพิ่ม provider ใหม่ (เช่น OpenAI) = เพิ่ม "หนึ่งแถว" ในตาราง PROVIDERS ด้านล่าง:
//   1. pnpm add --save-exact @langchain/openai
//   2. import { ChatOpenAI } from "@langchain/openai";
//   3. เพิ่มแถว:
//        openai: {
//          keyVar: "OPENAI_API_KEY",
//          defaultModel: "<ชื่อโมเดล>",
//          chatUrl: () => "https://api.openai.com/v1/chat/completions",
//          create: ({ model, apiKey, temperature }) =>
//            new ChatOpenAI({ model, apiKey, ...(temperature !== undefined ? { temperature } : {}) }),
//        },
// ห้ามเปลี่ยน return type: ต้องคืน BaseChatModel เหมือนเดิม บทเรียนอื่นไม่ต้องแก้เลย
// หลังเปลี่ยนแล้วรัน `pnpm check:llm` เพื่อดูว่า provider ใหม่รองรับอะไรบ้าง
// ================================================================

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
  keyVar: string;
  defaultModel: string;
  // URL ของ chat completions (รูปแบบ OpenAI-compatible) ใช้ในบท Level 0 ที่เรียกด้วย fetch ตรง ๆ
  chatUrl: () => string;
  create: (args: CreateArgs) => BaseChatModel;
}

const withTemperature = (temperature?: number) =>
  temperature !== undefined ? { temperature } : {};

const OLLAMA_DEFAULT_URL = "https://ollama.com";

function ollamaBaseUrl(): string {
  const raw = (process.env.OLLAMA_BASE_URL ?? "").trim() || OLLAMA_DEFAULT_URL;
  const url = raw.replace(/\/+$/, "");
  if (url.endsWith("/api")) {
    throw new Error(
      `OLLAMA_BASE_URL ต้องเป็นโดเมนเปล่า ๆ เช่น ${OLLAMA_DEFAULT_URL} ห้ามต่อท้ายด้วย /api ` +
        "(ไม่งั้นจะเจอ error 404) กรุณาลบ /api ออก",
    );
  }
  return url;
}

const PROVIDERS = {
  groq: {
    keyVar: "GROQ_API_KEY",
    defaultModel: "openai/gpt-oss-120b",
    chatUrl: () => "https://api.groq.com/openai/v1/chat/completions",
    create: ({ model, apiKey, temperature }) =>
      new ChatGroq({ model, apiKey, ...withTemperature(temperature) }),
  },
  ollama: {
    keyVar: "OLLAMA_API_KEY",
    defaultModel: "gpt-oss:120b",
    chatUrl: () => `${ollamaBaseUrl()}/v1/chat/completions`,
    create: ({ model, apiKey, temperature }) =>
      new ChatOllama({
        model,
        baseUrl: ollamaBaseUrl(),
        headers: { Authorization: `Bearer ${apiKey}` },
        ...withTemperature(temperature),
      }),
  },
} satisfies Record<string, Provider>;

export type ProviderName = keyof typeof PROVIDERS;

const DEFAULT_PROVIDER: ProviderName = "groq";

let envLoaded = false;
function loadDotEnv() {
  if (envLoaded) return;
  envLoaded = true;
  try {
    process.loadEnvFile();
  } catch {
    // ไม่มีไฟล์ .env ก็ไม่เป็นไร อาจตั้งค่าไว้ใน environment แล้ว
  }
}

function resolveProvider(): ProviderName {
  const name = (process.env.LLM_PROVIDER ?? "").trim() || DEFAULT_PROVIDER;
  if (!(name in PROVIDERS)) {
    throw new Error(
      `ไม่รู้จัก LLM_PROVIDER="${name}" ที่ใช้ได้ตอนนี้: ${Object.keys(PROVIDERS).join(", ")} ` +
        "(เพิ่ม provider ใหม่ได้ใน src/llm.ts)",
    );
  }
  return name as ProviderName;
}

export function describeProvider(options: LLMOptions = {}): {
  provider: ProviderName;
  model: string;
  keyVar: string;
  chatUrl: string;
} {
  loadDotEnv();
  const provider = resolveProvider();
  const spec: Provider = PROVIDERS[provider];
  const model = options.model ?? ((process.env.LLM_MODEL ?? "").trim() || spec.defaultModel);
  return { provider, model, keyVar: spec.keyVar, chatUrl: spec.chatUrl() };
}

export function getLLM(options: LLMOptions = {}): BaseChatModel {
  const { provider, model, keyVar } = describeProvider(options);

  const apiKey = (process.env[keyVar] ?? "").trim();
  if (!apiKey) {
    throw new Error(
      `ยังไม่ได้ตั้ง ${keyVar}: สร้าง API key จาก provider ที่เลือก (${provider}) ` +
        "แล้วใส่ในไฟล์ .env (ดูตัวอย่างใน .env.example)",
    );
  }

  const spec: Provider = PROVIDERS[provider];
  return spec.create({ model, apiKey, temperature: options.temperature });
}

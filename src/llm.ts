import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatOllama } from "@langchain/ollama";

// ================================================================
// ไฟล์นี้คือ "จุดเดียว" ที่รู้ว่าเราใช้ LLM เจ้าไหน (ตอนนี้คือ Ollama Cloud)
// ทุกบทเรียนเรียก getLLM() จากที่นี่ ไม่มีบทไหน import @langchain/ollama ตรง ๆ
//
// อยากเปลี่ยน provider (เช่น OpenAI, Anthropic)?
//   1. ติดตั้งแพ็กเกจของเจ้านั้น เช่น npm install @langchain/openai
//   2. แก้ "ตัวฟังก์ชัน getLLM" ด้านล่างให้สร้างโมเดลของเจ้านั้นแทน
//   3. ห้ามเปลี่ยน return type: ต้องคืน BaseChatModel เหมือนเดิม
// บทเรียนอื่นไม่ต้องแก้เลย
// ================================================================

export interface LLMOptions {
  temperature?: number;
  model?: string;
}

const DEFAULT_BASE_URL = "https://ollama.com";
// โมเดลเริ่มต้น เปลี่ยนได้ที่ OLLAMA_MODEL ใน .env (โมเดล cloud อาจถูกยกเลิกได้)
const DEFAULT_MODEL = "gpt-oss:120b";

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

function resolveBaseUrl(raw: string | undefined): string {
  const url = (raw ?? "").trim() || DEFAULT_BASE_URL;
  const withoutSlash = url.replace(/\/+$/, "");
  if (withoutSlash.endsWith("/api")) {
    throw new Error(
      `OLLAMA_BASE_URL ต้องเป็นโดเมนเปล่า ๆ เช่น ${DEFAULT_BASE_URL} ห้ามต่อท้ายด้วย /api ` +
        "(ไม่งั้นจะเจอ error 404) กรุณาลบ /api ออก",
    );
  }
  return withoutSlash;
}

export function getLLM(options: LLMOptions = {}): BaseChatModel {
  loadDotEnv();

  const apiKey = (process.env.OLLAMA_API_KEY ?? "").trim();
  if (!apiKey) {
    throw new Error(
      "ยังไม่ได้ตั้ง OLLAMA_API_KEY: สร้าง key ที่ https://ollama.com/settings/keys " +
        "แล้วใส่ในไฟล์ .env (ดูตัวอย่างใน .env.example และบทที่ 02)",
    );
  }

  const baseUrl = resolveBaseUrl(process.env.OLLAMA_BASE_URL);
  const model = options.model ?? ((process.env.OLLAMA_MODEL ?? "").trim() || DEFAULT_MODEL);

  return new ChatOllama({
    model,
    baseUrl,
    headers: { Authorization: `Bearer ${apiKey}` },
    ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
  });
}

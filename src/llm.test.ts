import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { EnvError, resetEnv } from "./env";
import { describeProvider, getLLM } from "./llm";

const VARS = ["LLM_PROVIDER", "LLM_MODEL", "GROQ_API_KEY", "OLLAMA_API_KEY", "OLLAMA_BASE_URL"];
const KEY = "test-key-0123456789";

// ตั้งทุกตัวแปรเป็นค่าว่างก่อนทุก test เพื่อไม่ให้ .env จริงของผู้เรียนมีผลกับ test
// และ resetEnv() เพราะ src/env.ts จำผลที่ตรวจไว้
beforeEach(() => {
  for (const v of VARS) vi.stubEnv(v, "");
  resetEnv();
});
afterEach(() => {
  vi.unstubAllEnvs();
  resetEnv();
});

describe("getLLM", () => {
  test("provider เริ่มต้นคือ groq: ไม่มี key ต้อง throw EnvError ที่พูดถึง GROQ_API_KEY", () => {
    expect(() => getLLM()).toThrow(EnvError);
    expect(() => getLLM()).toThrow(/GROQ_API_KEY/);
  });

  test("LLM_PROVIDER=ollama ไม่มี key ต้องพูดถึง OLLAMA_API_KEY", () => {
    vi.stubEnv("LLM_PROVIDER", "ollama");
    expect(() => getLLM()).toThrow(/OLLAMA_API_KEY/);
  });

  test("provider ที่ไม่รู้จักต้อง throw ข้อความที่ระบุรายชื่อที่ใช้ได้", () => {
    vi.stubEnv("LLM_PROVIDER", "nope");
    expect(() => getLLM()).toThrow(/groq.*ollama|ollama.*groq/s);
  });

  test("groq ที่มี key คืน BaseChatModel", () => {
    vi.stubEnv("GROQ_API_KEY", KEY);
    expect(getLLM()).toBeInstanceOf(BaseChatModel);
  });

  test("ollama ที่มี key คืน BaseChatModel", () => {
    vi.stubEnv("LLM_PROVIDER", "ollama");
    vi.stubEnv("OLLAMA_API_KEY", KEY);
    expect(getLLM()).toBeInstanceOf(BaseChatModel);
  });

  test("ollama ปฏิเสธ OLLAMA_BASE_URL ที่ลงท้ายด้วย /api แต่รับ / ท้าย URL", () => {
    vi.stubEnv("LLM_PROVIDER", "ollama");
    vi.stubEnv("OLLAMA_API_KEY", KEY);
    vi.stubEnv("OLLAMA_BASE_URL", "https://ollama.com/api");
    expect(() => getLLM()).toThrow(/\/api/);
    vi.stubEnv("OLLAMA_BASE_URL", "https://ollama.com/");
    resetEnv();
    expect(() => getLLM()).not.toThrow();
  });

  test("รับ option temperature", () => {
    vi.stubEnv("GROQ_API_KEY", KEY);
    expect(() => getLLM({ temperature: 0 })).not.toThrow();
  });
});

describe("describeProvider", () => {
  beforeEach(() => {
    vi.stubEnv("GROQ_API_KEY", KEY);
    resetEnv();
  });

  test("ค่าเริ่มต้นเป็น groq พร้อม keyVar, apiKey และชื่อโมเดล", () => {
    const info = describeProvider();
    expect(info.provider).toBe("groq");
    expect(info.keyVar).toBe("GROQ_API_KEY");
    expect(info.apiKey).toBe(KEY);
    expect(info.model.length).toBeGreaterThan(0);
  });

  test("โมเดลเริ่มต้นของ groq คือ openai/gpt-oss-20b", () => {
    expect(describeProvider().model).toBe("openai/gpt-oss-20b");
  });

  test("LLM_MODEL เปลี่ยนชื่อโมเดล", () => {
    vi.stubEnv("LLM_MODEL", "my-model");
    resetEnv();
    expect(describeProvider().model).toBe("my-model");
  });

  test("option model มีผลเหนือ LLM_MODEL", () => {
    vi.stubEnv("LLM_MODEL", "from-env");
    resetEnv();
    expect(describeProvider({ model: "from-option" }).model).toBe("from-option");
  });

  test("chatUrl ค่าเริ่มต้นคือ endpoint ของ groq", () => {
    expect(describeProvider().chatUrl).toBe("https://api.groq.com/openai/v1/chat/completions");
  });

  test("chatUrl ของ ollama ใช้ /v1/chat/completions ต่อจากโดเมนเริ่มต้น", () => {
    vi.stubEnv("LLM_PROVIDER", "ollama");
    vi.stubEnv("OLLAMA_API_KEY", KEY);
    resetEnv();
    expect(describeProvider().chatUrl).toBe("https://ollama.com/v1/chat/completions");
  });

  test("chatUrl ของ ollama ใช้ OLLAMA_BASE_URL และตัด / ท้ายออก", () => {
    vi.stubEnv("LLM_PROVIDER", "ollama");
    vi.stubEnv("OLLAMA_API_KEY", KEY);
    vi.stubEnv("OLLAMA_BASE_URL", "https://example.test/");
    resetEnv();
    expect(describeProvider().chatUrl).toBe("https://example.test/v1/chat/completions");
  });
});

import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { EnvError, resetEnv } from "./env";
import { describeProvider, getLLM } from "./llm";

const VARS = ["LLM_PROVIDER", "LLM_MODEL", "GROQ_API_KEY", "GOOGLE_API_KEY", "DEEPSEEK_API_KEY"];
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

  test("LLM_PROVIDER=google ไม่มี key ต้องพูดถึง GOOGLE_API_KEY", () => {
    vi.stubEnv("LLM_PROVIDER", "google");
    expect(() => getLLM()).toThrow(/GOOGLE_API_KEY/);
  });

  test("provider ที่ไม่รู้จักต้อง throw ข้อความที่ระบุรายชื่อที่ใช้ได้", () => {
    vi.stubEnv("LLM_PROVIDER", "nope");
    expect(() => getLLM()).toThrow(/groq.*google|google.*groq/s);
  });

  test("groq ที่มี key คืน BaseChatModel", () => {
    vi.stubEnv("GROQ_API_KEY", KEY);
    expect(getLLM()).toBeInstanceOf(BaseChatModel);
  });

  test("google ที่มี key คืน BaseChatModel", () => {
    vi.stubEnv("LLM_PROVIDER", "google");
    vi.stubEnv("GOOGLE_API_KEY", KEY);
    expect(getLLM()).toBeInstanceOf(BaseChatModel);
  });

  test("deepseek ที่มี key คืน BaseChatModel และไม่มี key ต้องพูดถึง DEEPSEEK_API_KEY", () => {
    vi.stubEnv("LLM_PROVIDER", "deepseek");
    expect(() => getLLM()).toThrow(/DEEPSEEK_API_KEY/);
    vi.stubEnv("DEEPSEEK_API_KEY", KEY);
    resetEnv();
    expect(getLLM({ temperature: 0 })).toBeInstanceOf(BaseChatModel);
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

  test("deepseek: โมเดลเริ่มต้น deepseek-flash และ chatUrl ชี้ไปที่ api.deepseek.com", () => {
    vi.stubEnv("LLM_PROVIDER", "deepseek");
    vi.stubEnv("DEEPSEEK_API_KEY", KEY);
    resetEnv();
    const info = describeProvider();
    expect(info.keyVar).toBe("DEEPSEEK_API_KEY");
    expect(info.model).toBe("deepseek-flash");
    expect(info.chatUrl).toBe("https://api.deepseek.com/chat/completions");
  });

  test("google: โมเดลเริ่มต้น gemini-flash-lite-latest และ chatUrl เป็น endpoint แบบ OpenAI-compatible", () => {
    vi.stubEnv("LLM_PROVIDER", "google");
    vi.stubEnv("GOOGLE_API_KEY", KEY);
    resetEnv();
    const info = describeProvider();
    expect(info.keyVar).toBe("GOOGLE_API_KEY");
    expect(info.model).toBe("gemini-flash-lite-latest");
    expect(info.chatUrl).toBe("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions");
  });
});

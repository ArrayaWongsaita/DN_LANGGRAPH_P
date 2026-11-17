import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { describeProvider, getLLM } from "./llm";

const VARS = ["LLM_PROVIDER", "LLM_MODEL", "GROQ_API_KEY", "OLLAMA_API_KEY", "OLLAMA_BASE_URL"];

describe("getLLM", () => {
  // ตั้งทุกตัวแปรเป็นค่าว่างก่อนทุก test เพื่อไม่ให้ .env จริงของผู้เรียนมีผลกับ test
  beforeEach(() => {
    for (const v of VARS) vi.stubEnv(v, "");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("provider เริ่มต้นคือ groq: ไม่มี key ต้อง throw และพูดถึง GROQ_API_KEY", () => {
    expect(() => getLLM()).toThrow(/GROQ_API_KEY/);
  });

  test("key ที่เป็นช่องว่างล้วนนับว่าไม่มี key", () => {
    vi.stubEnv("GROQ_API_KEY", "   ");
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
    vi.stubEnv("GROQ_API_KEY", "test-key");
    expect(getLLM()).toBeInstanceOf(BaseChatModel);
  });

  test("ollama ที่มี key คืน BaseChatModel", () => {
    vi.stubEnv("LLM_PROVIDER", "ollama");
    vi.stubEnv("OLLAMA_API_KEY", "test-key");
    expect(getLLM()).toBeInstanceOf(BaseChatModel);
  });

  test("ollama ปฏิเสธ OLLAMA_BASE_URL ที่ลงท้ายด้วย /api แต่รับ / ท้าย URL", () => {
    vi.stubEnv("LLM_PROVIDER", "ollama");
    vi.stubEnv("OLLAMA_API_KEY", "test-key");
    vi.stubEnv("OLLAMA_BASE_URL", "https://ollama.com/api");
    expect(() => getLLM()).toThrow(/\/api/);
    vi.stubEnv("OLLAMA_BASE_URL", "https://ollama.com/");
    expect(() => getLLM()).not.toThrow();
  });

  test("รับ option temperature", () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    expect(() => getLLM({ temperature: 0 })).not.toThrow();
  });
});

describe("describeProvider", () => {
  beforeEach(() => {
    for (const v of VARS) vi.stubEnv(v, "");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("ค่าเริ่มต้นเป็น groq พร้อม keyVar และชื่อโมเดล", () => {
    const info = describeProvider();
    expect(info.provider).toBe("groq");
    expect(info.keyVar).toBe("GROQ_API_KEY");
    expect(info.model.length).toBeGreaterThan(0);
  });

  test("LLM_MODEL เปลี่ยนชื่อโมเดล", () => {
    vi.stubEnv("LLM_MODEL", "my-model");
    expect(describeProvider().model).toBe("my-model");
  });

  test("option model มีผลเหนือ LLM_MODEL", () => {
    vi.stubEnv("LLM_MODEL", "from-env");
    expect(describeProvider({ model: "from-option" }).model).toBe("from-option");
  });
});

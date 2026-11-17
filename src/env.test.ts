import { EnvError, env, getEnv, parseEnv, resetEnv } from "./env";

const KEY = "gsk_0123456789abcdef";

describe("parseEnv", () => {
  test("ไม่ตั้งอะไรเลยนอกจาก key: ใช้ค่าเริ่มต้น provider=groq, model ว่าง", () => {
    const result = parseEnv({ GROQ_API_KEY: KEY });
    expect(result.LLM_PROVIDER).toBe("groq");
    expect(result.LLM_MODEL).toBe("");
    expect(result.GROQ_API_KEY).toBe(KEY);
  });

  test("ค่าว่างหรือช่องว่างล้วนของ LLM_PROVIDER / LLM_MODEL นับเป็นไม่ได้ตั้ง", () => {
    const result = parseEnv({ LLM_PROVIDER: "  ", LLM_MODEL: "", GROQ_API_KEY: KEY });
    expect(result.LLM_PROVIDER).toBe("groq");
    expect(result.LLM_MODEL).toBe("");
  });

  test("ตัดช่องว่างหัวท้ายของ key และ model", () => {
    const result = parseEnv({ GROQ_API_KEY: `  ${KEY}  `, LLM_MODEL: "  m1  " });
    expect(result.GROQ_API_KEY).toBe(KEY);
    expect(result.LLM_MODEL).toBe("m1");
  });

  test("ตัวแปรอื่นใน env (เช่น PATH) ถูกข้าม ไม่ติดมาในผลลัพธ์", () => {
    expect(parseEnv({ GROQ_API_KEY: KEY, PATH: "/usr/bin" })).not.toHaveProperty("PATH");
  });

  test("ไม่มี key ของ provider ที่เลือก: throw EnvError ที่ระบุชื่อตัวแปร", () => {
    expect(() => parseEnv({})).toThrow(EnvError);
    expect(() => parseEnv({})).toThrow(/GROQ_API_KEY/);
  });

  test("key สั้นเกินไป (น้อยกว่า 10 ตัว) ไม่ผ่าน", () => {
    expect(() => parseEnv({ GROQ_API_KEY: "short" })).toThrow(/GROQ_API_KEY/);
  });

  test("ต้องการ key ของ provider ที่เลือกเท่านั้น: ollama ไม่ต้องมี GROQ_API_KEY", () => {
    const result = parseEnv({ LLM_PROVIDER: "ollama", OLLAMA_API_KEY: KEY });
    expect(result.LLM_PROVIDER).toBe("ollama");
    expect(() => parseEnv({ LLM_PROVIDER: "ollama", GROQ_API_KEY: KEY })).toThrow(/OLLAMA_API_KEY/);
  });

  test("provider ที่ไม่รู้จัก: ข้อความบอกรายชื่อที่ใช้ได้", () => {
    const run = () => parseEnv({ LLM_PROVIDER: "nope", GROQ_API_KEY: KEY });
    expect(run).toThrow(/LLM_PROVIDER/);
    expect(run).toThrow(/groq/);
    expect(run).toThrow(/ollama/);
  });

  test("รวมทุกปัญหาไว้ในข้อความเดียว (ไม่ใช่ทีละอัน)", () => {
    const run = () => parseEnv({ LLM_PROVIDER: "ollama", OLLAMA_BASE_URL: "https://ollama.com/api" });
    expect(run).toThrow(/OLLAMA_API_KEY/);
    expect(run).toThrow(/OLLAMA_BASE_URL/);
  });

  test("OLLAMA_BASE_URL: ค่าเริ่มต้น https://ollama.com, ตัด / ท้าย, ปฏิเสธ /api ท้าย URL", () => {
    const base = { LLM_PROVIDER: "ollama", OLLAMA_API_KEY: KEY };
    expect(parseEnv(base).OLLAMA_BASE_URL).toBe("https://ollama.com");
    expect(parseEnv({ ...base, OLLAMA_BASE_URL: "https://example.test/" }).OLLAMA_BASE_URL).toBe("https://example.test");
    expect(() => parseEnv({ ...base, OLLAMA_BASE_URL: "https://ollama.com/api" })).toThrow(/\/api/);
  });
});

describe("getEnv / env", () => {
  beforeEach(() => {
    for (const v of ["LLM_PROVIDER", "LLM_MODEL", "GROQ_API_KEY", "OLLAMA_API_KEY", "OLLAMA_BASE_URL"]) vi.stubEnv(v, "");
    resetEnv();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnv();
  });

  test("getEnv อ่านจาก process.env และจำผลไว้ (ตรวจครั้งเดียว)", () => {
    vi.stubEnv("GROQ_API_KEY", KEY);
    const first = getEnv();
    vi.stubEnv("LLM_MODEL", "changed-later");
    expect(getEnv()).toBe(first);
    expect(getEnv().LLM_MODEL).toBe("");
  });

  test("resetEnv ทำให้อ่านใหม่ (ใช้ใน test)", () => {
    vi.stubEnv("GROQ_API_KEY", KEY);
    getEnv();
    vi.stubEnv("LLM_MODEL", "m2");
    resetEnv();
    expect(getEnv().LLM_MODEL).toBe("m2");
  });

  test("env เข้าถึงค่าได้ทีละ field และตรวจตอนเข้าถึงครั้งแรก (ไม่ใช่ตอน import)", () => {
    expect(() => env.GROQ_API_KEY).toThrow(EnvError);
    vi.stubEnv("GROQ_API_KEY", KEY);
    resetEnv();
    expect(env.GROQ_API_KEY).toBe(KEY);
    expect(env.LLM_PROVIDER).toBe("groq");
  });
});

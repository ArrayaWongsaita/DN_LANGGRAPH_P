import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { getLLM } from "./llm";

describe("getLLM", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test.each(["", "   "])("throws a Thai error naming OLLAMA_API_KEY when key is %j", (key) => {
    vi.stubEnv("OLLAMA_API_KEY", key);
    expect(() => getLLM()).toThrow(/OLLAMA_API_KEY/);
  });

  test("returns a BaseChatModel when the key is set", () => {
    vi.stubEnv("OLLAMA_API_KEY", "test-key");
    expect(getLLM()).toBeInstanceOf(BaseChatModel);
  });

  test("accepts a base url with a trailing slash", () => {
    vi.stubEnv("OLLAMA_API_KEY", "test-key");
    vi.stubEnv("OLLAMA_BASE_URL", "https://ollama.com/");
    expect(() => getLLM()).not.toThrow();
  });

  test("rejects a base url ending in /api with an explanation", () => {
    vi.stubEnv("OLLAMA_API_KEY", "test-key");
    vi.stubEnv("OLLAMA_BASE_URL", "https://ollama.com/api");
    expect(() => getLLM()).toThrow(/\/api/);
  });

  test("accepts a temperature option", () => {
    vi.stubEnv("OLLAMA_API_KEY", "test-key");
    expect(() => getLLM({ temperature: 0 })).not.toThrow();
  });
});

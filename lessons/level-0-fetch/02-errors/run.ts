import { describeProvider } from "@src/llm";
import { callLLM } from "./callLLM";

// รันกับ LLM จริง: pnpm lesson 0-02  ลองแกล้งทำให้ผิดแล้วดูข้อความ error
// (ลอง: ใส่ key มั่ว ๆ ใน .env, ตั้ง LLM_MODEL=ไม่มีโมเดลนี้, หรือปิดอินเทอร์เน็ต)
const { model, keyVar, chatUrl } = describeProvider();
const apiKey = (process.env[keyVar] ?? "").trim();

try {
  console.log(await callLLM({ fetchFn: fetch, url: chatUrl, apiKey, model, question: "ตอบว่า ok" }));
} catch (e) {
  console.error("เรียกไม่สำเร็จ:", e instanceof Error ? e.message : e);
  process.exit(1);
}

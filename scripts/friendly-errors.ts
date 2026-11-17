import { errorCode, errorStatus } from "../src/errorInfo";
import { describeProvider } from "../src/llm";

// โหลดก่อน run.ts ของทุกบท: ถ้าเกิด error ให้พิมพ์ข้อความสั้น ๆ ที่อ่านรู้เรื่อง ไม่พ่น stack trace
function keyVar(): string {
  try {
    return describeProvider().keyVar;
  } catch {
    return "API key";
  }
}

function hint(e: unknown): string {
  const status = errorStatus(e);
  const code = errorCode(e);
  if (status === 401) return `key ไม่ถูกต้อง: ตรวจ ${keyVar()} ใน .env`;
  if (status === 404) return "ไม่พบปลายทาง: ตรวจชื่อโมเดล (LLM_MODEL) และ URL ของ provider ใน .env";
  if (status === 429) return "เรียกถี่เกินไป: รอแล้วลองใหม่";
  if (code === "ENOTFOUND" || code === "ECONNREFUSED") return "ต่อเครือข่ายไม่ได้: ตรวจอินเทอร์เน็ต";
  return "ดูวิธีแก้ใน README หรือบทที่ 0-02";
}

function friendly(e: unknown): never {
  const message = e instanceof Error ? e.message : String(e);
  console.error(`\n❌ ${message}\n(${hint(e)})`);
  if (process.env.DEBUG) console.error(e);
  process.exit(1);
}

process.on("uncaughtException", friendly);
process.on("unhandledRejection", friendly);

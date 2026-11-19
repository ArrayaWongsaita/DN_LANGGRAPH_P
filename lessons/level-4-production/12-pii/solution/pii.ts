import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { createAgent, piiMiddleware } from "langchain";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-12
// ข้อมูลส่วนตัว (PII) ต้องไม่ถึงโมเดล: ใช้ piiMiddleware ดักก่อนส่ง จะ redact (แทนที่) mask (ปิดบางส่วน) หรือ block (หยุดทันที) ก็ได้
function buildPrivateAgent(model: BaseChatModel) {
  // ข้อ 1: อีเมล: piiMiddleware("email", { strategy: "redact" })
  const email = piiMiddleware("email", { strategy: "redact" });
  // ข้อ 2: บัตรเครดิต: piiMiddleware("credit_card", { strategy: "mask" })
  const card = piiMiddleware("credit_card", { strategy: "mask" });
  // ข้อ 3: เลขบัตรประชาชน 13 หลัก: piiMiddleware("thai_id", { detector: /\d{13}/g, strategy: "redact" })
  //          (detector ต้องมีแฟล็ก g)
  const thaiId = piiMiddleware("thai_id", { detector: /\d{13}/g, strategy: "redact" });
  return createAgent({ model, tools: [], middleware: [email, card, thaiId] });
}

// agent เข้มงวด: เจออีเมลแล้วหยุดทันที (ให้ไว้แล้ว)
function buildStrictAgent(model: BaseChatModel) {
  return createAgent({ model, tools: [], middleware: [piiMiddleware("email", { strategy: "block" })] });
}

// ดูว่า "โมเดลได้รับอะไร" ด้วยโมเดลปลอมที่จดข้อความที่ถูกส่งเข้ามา
const seenBy = async (text: string) => {
  const fake = fakeToolLLM(["ok"]);
  await buildPrivateAgent(fake).invoke({ messages: [new HumanMessage(text)] });
  return fake.calls[0][0].text;
};
const seenEmail = await seenBy("ติดต่อ somchai@example.com ด้วย");
const seenCard = await seenBy("บัตร 4111 1111 1111 1111");
const seenThai = await seenBy("เลขบัตร 1234567890123 ครับ");
const seenPlain = await seenBy("สวัสดีครับ");

const strictModel = fakeToolLLM(["ไม่ควรถูกเรียก"]);
let blocked = "";
try {
  await buildStrictAgent(strictModel).invoke({ messages: [new HumanMessage("a@b.com")] });
} catch (e) {
  blocked = (e as Error).message;
}

// โมเดลจริง: ส่งข้อความที่มีอีเมล ผ่าน middleware แล้วโมเดลยังตอบได้
const real = await buildPrivateAgent(llm).invoke({ messages: [new HumanMessage("ฉันคือ somchai@example.com ทักทายฉันหน่อย")] });
console.log("โมเดลจริงตอบ:", real.messages.at(-1)?.text);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("อีเมลถูกแทนที่ก่อนถึงโมเดล", !seenEmail.includes("somchai@example.com") && seenEmail.includes("[REDACTED_EMAIL]"), "piiMiddleware(\"email\", { strategy: \"redact\" })");
check("บัตรเครดิตถูก mask เหลือสี่ตัวท้าย", !seenCard.includes("4111 1111 1111") && seenCard.includes("1111") && seenCard.includes("****"), "strategy: \"mask\"");
check("เลขบัตรประชาชน 13 หลัก (ชนิดที่นิยามเอง) ถูกปิดบัง", !seenThai.includes("1234567890123") && seenThai.includes("[REDACTED_THAI_ID]"), "detector ต้องมีแฟล็ก g");
check("ข้อความที่ไม่มีข้อมูลส่วนตัวผ่านไปเหมือนเดิม", seenPlain === "สวัสดีครับ");
check("กลยุทธ์ block: เจอแล้วโยน error และโมเดลไม่ถูกเรียก", /PII/.test(blocked) && strictModel.calls.length === 0);
check("โมเดลจริงยังตอบได้หลังผ่าน middleware", (real.messages.at(-1)?.text ?? "").length > 0);

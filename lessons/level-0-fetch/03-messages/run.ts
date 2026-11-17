import { describeProvider } from "@src/llm";
import { appendTurn, chat, type Turn } from "./chat";

// รันกับ LLM จริง: pnpm lesson 0-03  เทียบ "มีประวัติ" กับ "ไม่มีประวัติ"
const { model, chatUrl, apiKey } = describeProvider();
const base = { fetchFn: fetch, url: chatUrl, apiKey, model, system: "ตอบสั้น ๆ เป็นภาษาไทย" };

let history: Turn[] = [];
const first = "ฉันชื่อมาลี ชอบแมว จำไว้นะ";
history = appendTurn(history, first, await chat({ ...base, history, question: first }));

const second = "ฉันชื่ออะไร และชอบอะไร";
console.log("มีประวัติ:   ", await chat({ ...base, history, question: second }));
console.log("ไม่มีประวัติ:", await chat({ ...base, history: [], question: second }));

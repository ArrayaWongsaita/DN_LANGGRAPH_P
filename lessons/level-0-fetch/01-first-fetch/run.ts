import { describeProvider } from "@src/llm";
import { callLLM } from "./callLLM";

// รันกับ LLM จริง: pnpm lesson 0-01
// describeProvider() โหลดและตรวจ .env ให้ (ผ่าน src/env.ts) แล้วบอก URL / โมเดล / key ที่ใช้อยู่
// ถ้ายังไม่ได้ตั้ง key จะได้ข้อความไทยบอกว่าต้องตั้งอะไร
const { model, chatUrl, apiKey } = describeProvider();


const answer = await callLLM({
  fetchFn: fetch, // fetch ของจริงที่มากับ Node
  url: chatUrl,
  apiKey,
  model,
  question: "ทักทายคนที่เพิ่งเริ่มเรียนเขียนแอป LLM หนึ่งประโยค",
});
console.log(answer);

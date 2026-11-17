import { getLLM } from "@src/llm";
import { askOnce } from "./askOnce";

// รันกับ LLM จริง: pnpm lesson 03
// getLLM() ให้ "ตัวเรียก LLM" ตามที่ตั้งไว้ใน .env
const answer = await askOnce(getLLM(), "ทักทายคนที่เพิ่งเริ่มเรียน LangGraph หนึ่งประโยค");
console.log(answer);

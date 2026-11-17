import { getLLM } from "../../../src/llm";
import { askWithPersona } from "./persona";

// รันกับ LLM จริง: npm run lesson 08
console.log(await askWithPersona(getLLM(), "คุณคือครูใจดี อธิบายสั้น ๆ ให้เด็กเข้าใจ", "ฝนตกเพราะอะไร"));

import { getLLM } from "../../../../src/llm";
import { replyText } from "./replyText";

// รันกับ LLM จริง: npm run lesson 07
console.log(await replyText(getLLM(), "ตอบสั้น ๆ: เมืองหลวงของไทยคืออะไร"));

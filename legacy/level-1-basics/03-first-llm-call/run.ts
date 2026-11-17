import { getLLM } from "../../../src/llm";
import { askOnce } from "./askOnce";

// รันกับ LLM จริง: npm run lesson 03
const answer = await askOnce(getLLM(), "สวัสดี แนะนำตัวสั้น ๆ หน่อย");
console.log(answer);

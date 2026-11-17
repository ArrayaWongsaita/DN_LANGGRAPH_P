import { getLLM } from "../../../src/llm";
import { extractPerson } from "./extractPerson";

// รันกับ LLM จริง: npm run lesson 13
console.log(await extractPerson(getLLM({ temperature: 0 }), "คุณสมชาย อายุ 42 ปี อยู่เชียงใหม่"));

import { getLLM } from "@src/llm";
import { translate } from "./translate";

// รันกับ LLM จริง: pnpm lesson 06
const llm = getLLM({ temperature: 0 });
console.log(await translate(llm, "อังกฤษ", "วันนี้อากาศดีจัง"));
console.log(await translate(llm, "ญี่ปุ่น", "วันนี้อากาศดีจัง"));

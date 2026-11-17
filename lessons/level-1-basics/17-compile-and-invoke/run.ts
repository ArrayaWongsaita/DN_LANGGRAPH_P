import { buildCounter, runWithLimit } from "./runGraph";

// รัน: pnpm lesson 17  (ไม่ใช้ LLM)
console.log(await runWithLimit(buildCounter(), { n: 5 }, 10));

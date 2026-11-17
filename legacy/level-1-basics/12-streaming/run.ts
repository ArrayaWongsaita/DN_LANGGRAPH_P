import { getLLM } from "../../../src/llm";
import { collectStream } from "./streamText";

// รันกับ LLM จริง: npm run lesson 12
await collectStream(getLLM(), "เล่านิทานสั้น ๆ 3 ประโยค", (c) => process.stdout.write(c));
console.log();

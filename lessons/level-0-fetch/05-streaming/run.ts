import { describeProvider } from "@src/llm";
import { streamText } from "./streamText";

// รันกับ LLM จริง: pnpm lesson 0-05  ดูตัวอักษรทยอยขึ้น
const { model, keyVar, chatUrl } = describeProvider();
const apiKey = (process.env[keyVar] ?? "").trim();

for await (const piece of streamText({ fetchFn: fetch, url: chatUrl, apiKey, model, question: "เล่านิทานสั้น ๆ สามประโยค" })) {
  process.stdout.write(piece);
}
process.stdout.write("\n");

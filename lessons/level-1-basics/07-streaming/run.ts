import { getLLM } from "@src/llm";

// รันกับ LLM จริง: pnpm lesson 07  ดูตัวอักษรทยอยขึ้นเหมือนแชตจริง
const stream = await getLLM().stream("เล่านิทานสั้น ๆ สามประโยค");
for await (const chunk of stream) {
  process.stdout.write(chunk.text);
}
process.stdout.write("\n");

import { getLLM } from "@src/llm";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { z } from "zod";
import { createApp } from "./server.mts";

// เปิดเซิร์ฟเวอร์จริงชั่วคราวบนพอร์ตสุ่ม แล้วเรียกตัวเองด้วย fetch เพื่อดูสตรีม SSE ดิบ
// (ถ้าอยากลองด้วย curl เอง: ตั้ง KEEP=1 แล้วใช้ curl -N "http://127.0.0.1:<พอร์ต>/ask?q=...")
const add = tool(async ({ a, b }) => String(a + b), {
  name: "add",
  description: "บวกเลขสองจำนวน",
  schema: z.object({ a: z.number(), b: z.number() }),
});
const agent = createAgent({ model: getLLM({ temperature: 0 }), tools: [add] });

// แปลงเหตุการณ์ดิบเป็นรายการเล็ก ๆ แบบย่อ (งานจริงให้ใช้ progressStream จากบท 5-08)
async function* progress(question: string, signal: AbortSignal) {
  const run = await agent.streamEvents({ messages: [{ role: "user", content: question }] }, { version: "v3", signal } as never);
  for await (const ev of run) {
    const data = ev.params.data as { event?: string; delta?: { text?: string }; tool_name?: string };
    if (ev.method === "tools" && data.event === "tool-started") yield { type: "tool", name: data.tool_name };
    if (ev.method === "messages" && data.event === "content-block-delta" && data.delta?.text) yield { type: "token", text: data.delta.text };
  }
  yield { type: "done" };
}

const server = createApp(progress).listen(0, "127.0.0.1", async () => {
  const { port } = server.address() as { port: number };
  console.log(`เซิร์ฟเวอร์ที่ http://127.0.0.1:${port}/ask?q=...`);
  const res = await fetch(`http://127.0.0.1:${port}/ask?q=${encodeURIComponent("ใช้เครื่องมือ add บวก 20 กับ 22 แล้วบอกผล")}`);
  console.log("สถานะ:", res.status, res.headers.get("content-type"));
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    process.stdout.write(decoder.decode(value));
  }
  if (process.env.KEEP) {
    console.log("\n(ค้างไว้ให้ลอง curl: กด Ctrl+C เพื่อหยุด)");
  } else {
    server.close();
  }
});

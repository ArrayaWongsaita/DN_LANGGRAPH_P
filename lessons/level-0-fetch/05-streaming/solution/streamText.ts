import { check } from "@src/check";
import { describeProvider } from "@src/llm";

// โหมดปกติอ่าน SSE ตัวอย่าง เปิด LESSON_LIVE=1 เพื่อขอ stream จากโมเดลใน .env
const provider = process.env.LESSON_LIVE === "1" ? describeProvider() : undefined;
const wire = [
  ": keepalive",
  'data: {"choices":[{"delta":{"role":"assistant"}}]}',
  'data: {"choices":[{"delta":{"content":"สวัสดี"}}]}',
  'data: {"choices":[{"delta":{"content":"ครับ"}}]}',
  "data: [DONE]",
  "",
].join("\r\n\r\n");

const encoder = new TextEncoder();
const bytes = encoder.encode(wire);
const split = encoder.encode(wire.slice(0, wire.indexOf("สวัสดี"))).length + 1;
const response = provider
  ? await fetch(provider.chatUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: provider.model,
        stream: true,
        messages: [{ role: "user", content: "ทักทายสั้น ๆ เป็นภาษาไทย" }],
      }),
    })
  : new Response(new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes.subarray(0, split));
        controller.enqueue(bytes.subarray(split));
        controller.close();
      },
    }), { headers: { "Content-Type": "text/event-stream" } });

if (!response.ok || !response.body) throw new Error(`อ่าน stream ไม่ได้ (HTTP ${response.status})`);

const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = "";
const pieces: string[] = [];

events: for (;;) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split("\n");
  buffer = lines.pop() ?? "";

  for (const line of lines) {
    if (!line.startsWith("data:")) continue;
    const data = line.slice("data:".length).trim();
    if (data === "[DONE]") {
      await reader.cancel();
      break events;
    }

    const event = JSON.parse(data);
    const content: unknown = event.choices?.[0]?.delta?.content;
    if (typeof content === "string" && content.length > 0) {
      pieces.push(content);
      process.stdout.write(content);
    }
  }
}

process.stdout.write("\n");
console.log(pieces);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
// ─────────────────────────────────────────────────────────────
check(
  "เก็บชิ้นข้อความจาก SSE ตามลำดับ",
  provider ? pieces.join("").trim().length > 0 : pieces.length === 2 && pieces[0] === "สวัสดี" && pieces[1] === "ครับ",
  "เก็บบรรทัดที่ยังมาไม่ครบไว้ใน buffer และถอดรหัสด้วย stream: true",
);

import { fakeFetch } from "@src/fakeFetch";
import { streamText } from "./streamText";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
// หน้าตาของสตรีมจริง: บรรทัด "data: {json}" คั่นด้วยบรรทัดว่าง และจบด้วย "data: [DONE]"
const event = (obj: unknown) => `data: ${JSON.stringify(obj)}\n\n`;
const delta = (content: string) => event({ choices: [{ delta: { content } }] });
const DONE = "data: [DONE]\n\n";

const args = (fetchFn: typeof fetch) => ({
  fetchFn,
  url: "https://llm.test/v1/chat/completions",
  apiKey: "k",
  model: "m",
  question: "q",
});

async function collect(it: AsyncIterable<string>): Promise<string[]> {
  const out: string[] = [];
  for await (const piece of it) out.push(piece);
  return out;
}

test("ส่ง stream: true ใน body", async () => {
  const f = fakeFetch([{ body: "", chunks: [delta("a"), DONE] }]);
  await collect(streamText(args(f)));
  expect(JSON.parse(String(f.calls[0].init?.body)).stream).toBe(true);
});

test("ได้ข้อความทีละชิ้นตามลำดับ", async () => {
  const f = fakeFetch([{ body: "", chunks: [delta("สวั") + delta("สดี") + DONE] }]);
  expect(await collect(streamText(args(f)))).toEqual(["สวั", "สดี"]);
});

test("event ที่ถูกตัดกลางบรรทัดข้ามการอ่านหลายรอบ ต้องต่อให้ครบ (ปัญหาจริงของสตรีม)", async () => {
  const whole = delta("ครบ") + delta("ถ้วน") + DONE;
  const cut = [whole.slice(0, 20), whole.slice(20, 55), whole.slice(55)];
  const f = fakeFetch([{ body: "", chunks: cut }]);
  expect(await collect(streamText(args(f)))).toEqual(["ครบ", "ถ้วน"]);
});

test("ข้ามชิ้นที่ไม่มีข้อความ (เช่น chunk ความคิด reasoning หรือ delta ว่าง)", async () => {
  const f = fakeFetch([
    {
      body: "",
      chunks: [
        event({ choices: [{ delta: { role: "assistant", content: "" } }] }),
        event({ choices: [{ delta: { reasoning: "กำลังคิด..." } }] }),
        delta("ตอบ"),
        event({ choices: [{ delta: {}, finish_reason: "stop" }] }),
        DONE,
      ],
    },
  ]);
  expect(await collect(streamText(args(f)))).toEqual(["ตอบ"]);
});

test("หยุดอ่านเมื่อเจอ [DONE] (ข้อมูลหลังจากนั้นไม่ถูกนับ)", async () => {
  const f = fakeFetch([{ body: "", chunks: [delta("a") + DONE + delta("ไม่ควรออก")] }]);
  expect(await collect(streamText(args(f)))).toEqual(["a"]);
});

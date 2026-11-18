import { type FetchFn, createThread, ensureOk, getState, parseSse, runWait, streamRun } from "./api";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) fetch ปลอมที่จดคำขอ ไม่ใช้เครือข่ายจริง
type Call = { url: string; method?: string; body?: unknown; headers?: Record<string, string> };
function fakeFetch(respond: (call: Call) => Response) {
  const calls: Call[] = [];
  const fn = (async (url: string, init?: RequestInit) => {
    const call: Call = { url, method: init?.method, headers: init?.headers as Record<string, string>, body: init?.body ? JSON.parse(String(init.body)) : undefined };
    calls.push(call);
    return respond(call);
  }) as unknown as FetchFn;
  return { fn, calls };
}
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

async function* chunksOf(...parts: string[]) {
  for (const p of parts) yield p;
}
async function all<T>(gen: AsyncIterable<T>): Promise<T[]> {
  const out: T[] = [];
  for await (const x of gen) out.push(x);
  return out;
}

test("ensureOk: ผ่านเมื่อ ok และโยน error ที่มีสถานะ+ข้อความเมื่อไม่ ok", async () => {
  const good = json({});
  expect(await ensureOk(good)).toBe(good);
  await expect(ensureOk(new Response("No assistant found", { status: 404 }))).rejects.toThrow("เซิร์ฟเวอร์ตอบ 404: No assistant found");
});

test("createThread: POST /threads (base มี / ท้ายก็ไม่ซ้อน) คืน thread_id", async () => {
  const { fn, calls } = fakeFetch(() => json({ thread_id: "t-1" }));
  expect(await createThread("http://x:2024/", fn)).toBe("t-1");
  expect(calls[0]).toMatchObject({ url: "http://x:2024/threads", method: "POST" });
  expect(calls[0].headers).toMatchObject({ "content-type": "application/json" });
});

test("runWait: ส่ง assistant_id + input ไปที่ /threads/{id}/runs/wait และคืนผล", async () => {
  const { fn, calls } = fakeFetch(() => json({ answer: "ตอบ: สวัสดี" }));
  expect(await runWait("http://x", "t-1", "demo", { question: "สวัสดี" }, fn)).toEqual({ answer: "ตอบ: สวัสดี" });
  expect(calls[0].url).toBe("http://x/threads/t-1/runs/wait");
  expect(calls[0].method).toBe("POST");
  expect(calls[0].body).toEqual({ assistant_id: "demo", input: { question: "สวัสดี" } });
});

test("runWait: เซิร์ฟเวอร์ตอบ 404 → error อ่านรู้เรื่อง", async () => {
  const { fn } = fakeFetch(() => new Response('No assistant found for "nope"', { status: 404 }));
  await expect(runWait("http://x", "t", "nope", {}, fn)).rejects.toThrow('เซิร์ฟเวอร์ตอบ 404: No assistant found for "nope"');
});

test("getState: อ่าน state (ให้ไว้แล้ว ใช้ ensureOk ของคุณ)", async () => {
  const { fn, calls } = fakeFetch(() => json({ values: { a: 1 }, next: [] }));
  expect(await getState("http://x", "t", fn)).toEqual({ values: { a: 1 }, next: [] });
  expect(calls[0].url).toBe("http://x/threads/t/state");
});

test("parseSse: event/data/id ปกติ", async () => {
  const out = await all(parseSse(chunksOf('event: values\ndata: {"a":1}\nid: 3\n\nevent: end\ndata: {}\n\n')));
  expect(out).toEqual([
    { event: "values", data: '{"a":1}', id: "3" },
    { event: "end", data: "{}" },
  ]);
});

test("parseSse: ก้อนถูกตัดกลางบรรทัด กลางคำ และกลางตัวคั่น ก็ได้ผลเหมือนเดิม", async () => {
  const text = 'event: values\ndata: {"msg":"สวัสดี"}\n\nevent: updates\ndata: {"b":2}\n\n';
  for (const size of [1, 2, 3, 7, 13]) {
    const parts: string[] = [];
    for (let i = 0; i < text.length; i += size) parts.push(text.slice(i, i + size));
    const out = await all(parseSse(chunksOf(...parts)));
    expect(out.map((e) => e.event)).toEqual(["values", "updates"]);
    expect(JSON.parse(out[0].data)).toEqual({ msg: "สวัสดี" });
  }
});

test("parseSse: data หลายบรรทัด, \\r\\n, คอมเมนต์ และไม่มี event (= message)", async () => {
  const out = await all(parseSse(chunksOf(": heartbeat\r\n\r\ndata: บรรทัดหนึ่ง\r\ndata: บรรทัดสอง\r\n\r\n")));
  expect(out).toEqual([{ event: "message", data: "บรรทัดหนึ่ง\nบรรทัดสอง" }]);
});

test("parseSse: เหตุการณ์สุดท้ายที่ไม่มีบรรทัดว่างปิดท้ายยังถูกส่งออก และบล็อกว่างถูกข้าม", async () => {
  const out = await all(parseSse(chunksOf("event: a\ndata: 1\n\n\n\nevent: b\ndata: 2")));
  expect(out).toEqual([
    { event: "a", data: "1" },
    { event: "b", data: "2" },
  ]);
});

function streamResponse(text: string, splitAt: number[]) {
  const bytes = new TextEncoder().encode(text);
  const cuts = [0, ...splitAt, bytes.length];
  return new Response(
    new ReadableStream({
      start(controller) {
        for (let i = 0; i < cuts.length - 1; i++) controller.enqueue(bytes.slice(cuts[i], cuts[i + 1]));
        controller.close();
      },
    }),
  );
}

const SSE = 'event: metadata\ndata: {"run_id":"r1"}\n\nevent: values\ndata: {"answer":"ตอบ: สวัสดี"}\n\nevent: updates\ndata: {"respond":{"answer":"ก"}}\n\nevent: end\ndata: {"status":"success"}\n\nevent: values\ndata: {"หลังจบ":1}\n\n';

test("streamRun: ส่ง stream_mode ถูก yield ทุกเหตุการณ์ (ยกเว้น end) และหยุดที่ end", async () => {
  const { fn, calls } = fakeFetch(() => streamResponse(SSE, []));
  const out = await all(streamRun("http://x", "t-1", "demo", { question: "q" }, ["values", "updates"], fn));
  expect(calls[0].url).toBe("http://x/threads/t-1/runs/stream");
  expect(calls[0].body).toEqual({ assistant_id: "demo", input: { question: "q" }, stream_mode: ["values", "updates"] });
  expect(out).toEqual([
    { event: "metadata", data: { run_id: "r1" } },
    { event: "values", data: { answer: "ตอบ: สวัสดี" } },
    { event: "updates", data: { respond: { answer: "ก" } } },
  ]);
});

test("streamRun: ไบต์ของตัวอักษรไทยถูกตัดครึ่งระหว่างก้อน ต้องไม่เพี้ยน (ใช้ TextDecoder แบบ stream)", async () => {
  const bytes = new TextEncoder().encode(SSE);
  const at = Buffer.from(SSE).indexOf(Buffer.from("สวัสดี")) + 1; // ตัดกลางตัว "ส"
  expect(bytes[at] & 0b11000000).toBe(0b10000000); // ยืนยันว่าจุดตัดอยู่กลางตัวอักษรจริง
  const { fn } = fakeFetch(() => streamResponse(SSE, [at, at + 5]));
  const out = await all(streamRun("http://x", "t", "demo", {}, ["values"], fn));
  expect(out[1]).toEqual({ event: "values", data: { answer: "ตอบ: สวัสดี" } });
});

test("streamRun: เหตุการณ์ error ทำให้ throw ด้วยข้อความจากเซิร์ฟเวอร์", async () => {
  const { fn } = fakeFetch(() => streamResponse('event: values\ndata: {"a":1}\n\nevent: error\ndata: {"message":"โมเดลล่ม"}\n\n', []));
  await expect(all(streamRun("http://x", "t", "demo", {}, ["values"], fn))).rejects.toThrow("โมเดลล่ม");
});

test("streamRun: เซิร์ฟเวอร์ตอบ 404 ก่อนเริ่มสตรีม → error อ่านรู้เรื่อง", async () => {
  const { fn } = fakeFetch(() => new Response("ไม่พบ thread", { status: 404 }));
  await expect(all(streamRun("http://x", "t", "demo", {}, ["values"], fn))).rejects.toThrow("เซิร์ฟเวอร์ตอบ 404: ไม่พบ thread");
});

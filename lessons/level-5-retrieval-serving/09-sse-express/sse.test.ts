import { formatSse, sseHeaders, streamToSink } from "./sse";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) sink ปลอมที่จดสิ่งที่ถูกเขียน ไม่เปิดพอร์ต
function makeSink() {
  const chunks: string[] = [];
  let ended = 0;
  return {
    chunks,
    get ended() {
      return ended;
    },
    write: (c: string) => {
      chunks.push(c);
      return true;
    },
    end: () => {
      ended++;
    },
  };
}

test("formatSse: event + data เป็น JSON จบด้วยบรรทัดว่าง", () => {
  expect(formatSse({ event: "token", data: { text: "ส" } })).toBe('event: token\ndata: {"text":"ส"}\n\n');
});

test("formatSse: มี id มาก่อน event และไม่มี event ก็ได้", () => {
  expect(formatSse({ id: 7, event: "x", data: 1 })).toBe("id: 7\nevent: x\ndata: 1\n\n");
  expect(formatSse({ data: "สวัสดี" })).toBe("data: สวัสดี\n\n");
});

test("formatSse: ข้อความหลายบรรทัดต้องขึ้น data: ทุกบรรทัด (ไม่งั้นข้อความแตก)", () => {
  expect(formatSse({ data: "บรรทัดหนึ่ง\nบรรทัดสอง" })).toBe("data: บรรทัดหนึ่ง\ndata: บรรทัดสอง\n\n");
});

test("formatSse: ข้อมูลออบเจ็กต์ที่มีขึ้นบรรทัดใหม่ในค่าไม่ทำให้ข้อความแตก (JSON escape ให้)", () => {
  const out = formatSse({ data: { text: "ก\nข" } });
  expect(out).toBe('data: {"text":"ก\\nข"}\n\n');
  expect(out.split("\n").filter((l) => l.startsWith("data:"))).toHaveLength(1);
});

test("sseHeaders: ชนิดสื่อและกัน cache/บีบอัดของตัวกลาง", () => {
  const h = sseHeaders();
  expect(h["Content-Type"]).toBe("text/event-stream");
  expect(h["Cache-Control"]).toContain("no-cache");
  expect(h["Cache-Control"]).toContain("no-transform");
});

test("streamToSink: เขียนทุกรายการเป็นเหตุการณ์ตามชนิด แล้วปิดครั้งเดียว", async () => {
  const sink = makeSink();
  async function* src() {
    yield { type: "node", node: "a" };
    yield { type: "done" };
  }
  await streamToSink(src(), sink, new AbortController().signal);
  expect(sink.chunks).toEqual(['event: node\ndata: {"type":"node","node":"a"}\n\n', 'event: done\ndata: {"type":"done"}\n\n']);
  expect(sink.ended).toBe(1);
});

test("ผู้ใช้ปิดแท็บ: หยุดเขียนและหยุดท่อต้นทาง (finally ของต้นทางทำงาน) แล้วปิด sink", async () => {
  const sink = makeSink();
  const ac = new AbortController();
  let upstreamStopped = false;
  let produced = 0;
  async function* src() {
    try {
      while (true) {
        produced++;
        yield { type: "token", n: produced };
        if (produced === 2) ac.abort(); // ผู้ใช้ปิดหน้าหลังได้รับ 2 ชิ้น
        await new Promise((r) => setTimeout(r, 1));
      }
    } finally {
      upstreamStopped = true;
    }
  }
  await streamToSink(src(), sink, ac.signal);
  expect(upstreamStopped).toBe(true);
  expect(sink.chunks.length).toBeLessThanOrEqual(2);
  expect(produced).toBeLessThanOrEqual(3);
  expect(sink.ended).toBe(1);
});

test("ต้นทางล้ม: ส่งเหตุการณ์ error ปิด sink และไม่ throw ออกมา", async () => {
  const sink = makeSink();
  async function* src() {
    yield { type: "token" };
    throw new Error("โมเดลล่ม");
  }
  await expect(streamToSink(src(), sink, new AbortController().signal)).resolves.toBeUndefined();
  expect(sink.chunks.at(-1)).toBe('event: error\ndata: {"message":"โมเดลล่ม"}\n\n');
  expect(sink.ended).toBe(1);
});

test("ยกเลิกแล้วต้นทางล้ม: ไม่เขียนอะไรเพิ่ม (ไม่มีใครฟังอยู่) แต่ยังปิด sink", async () => {
  const sink = makeSink();
  const ac = new AbortController();
  async function* src() {
    yield { type: "a" };
    ac.abort();
    throw new Error("ล้มหลังยกเลิก");
  }
  await streamToSink(src(), sink, ac.signal);
  expect(sink.chunks.some((c) => c.includes("error"))).toBe(false);
  expect(sink.ended).toBe(1);
});

test("ยกเลิกก่อนเริ่ม: ไม่เขียนอะไรเลย", async () => {
  const sink = makeSink();
  const ac = new AbortController();
  ac.abort();
  async function* src() {
    yield { type: "a" };
  }
  await streamToSink(src(), sink, ac.signal);
  expect(sink.chunks).toEqual([]);
  expect(sink.ended).toBe(1);
});

import { type ClientLike, decide, describeError, pendingApproval, startOrder, streamUpdates } from "./chat";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) client ปลอมที่ทำตัวเหมือนเซิร์ฟเวอร์ graph "order" (หยุดรออนุมัติแล้วต่อ)
function fakeServer() {
  const calls: { op: string; args: unknown[] }[] = [];
  const threads = new Map<string, { item: string; result?: string }>();
  let n = 0;
  const interrupt = (item: string) => ({ __interrupt__: [{ id: "i1", value: { question: `อนุมัติ ${item} ไหม` } }] });
  const client: ClientLike = {
    threads: {
      async create() {
        const id = `t${++n}`;
        threads.set(id, { item: "" });
        calls.push({ op: "create", args: [] });
        return { thread_id: id };
      },
      async getState(id) {
        calls.push({ op: "getState", args: [id] });
        const t = threads.get(id)!;
        const waiting = t.item !== "" && t.result === undefined;
        return { values: t, next: waiting ? ["approve"] : [], tasks: waiting ? [{ interrupts: [{ value: { question: `อนุมัติ ${t.item} ไหม` } }] }] : [{ interrupts: [] }] };
      },
    },
    runs: {
      async wait(id, assistant, payload) {
        calls.push({ op: "wait", args: [id, assistant, payload] });
        const t = threads.get(id!)!;
        const command = payload.command as { resume: boolean } | undefined;
        if (command) {
          t.result = command.resume ? `อนุมัติ ${t.item}` : "ไม่อนุมัติ";
          return { item: t.item, result: t.result };
        }
        t.item = (payload.input as { item: string }).item;
        return interrupt(t.item);
      },
      async *stream(id, assistant, payload) {
        calls.push({ op: "stream", args: [id, assistant, payload] });
        const item = (payload.input as { item: string }).item;
        yield { event: "metadata", data: { run_id: "r" } };
        yield { event: "values", data: { item } };
        yield { event: "updates", data: { prepare: { note: "เตรียมแล้ว" } } };
        yield { event: "updates", data: interrupt(item) };
        yield { event: "end", data: { status: "success" } };
      },
    },
  };
  return { client, calls, threads };
}

test("startOrder: สร้าง thread รัน และได้คำถามที่รออนุมัติ", async () => {
  const { client, calls } = fakeServer();
  const s = await startOrder(client, "order", "หูฟัง");
  expect(s.threadId).toBe("t1");
  expect(s.pending).toEqual({ question: "อนุมัติ หูฟัง ไหม" });
  expect(calls.map((c) => c.op)).toEqual(["create", "wait"]);
  expect(calls[1].args).toEqual(["t1", "order", { input: { item: "หูฟัง" } }]);
});

test("startOrder: กราฟที่ไม่หยุดรอ (ไม่มี interrupt) → pending เป็น undefined", async () => {
  const { client } = fakeServer();
  client.runs.wait = async () => ({ item: "x", result: "เสร็จ" });
  expect((await startOrder(client, "order", "x")).pending).toBeUndefined();
});

test("pendingApproval: กู้คำถามที่ค้างจาก state และคืน undefined เมื่อไม่มี", async () => {
  const { client } = fakeServer();
  const s = await startOrder(client, "order", "แว่น");
  expect(await pendingApproval(client, s.threadId)).toEqual({ question: "อนุมัติ แว่น ไหม" });
  await decide(client, "order", s.threadId, true);
  expect(await pendingApproval(client, s.threadId)).toBeUndefined();
});

test("pendingApproval: หา interrupt ได้แม้ task แรกไม่มี", async () => {
  const { client } = fakeServer();
  client.threads.getState = async () => ({ values: {}, next: ["b"], tasks: [{ interrupts: [] }, { interrupts: [{ value: "คำถาม" }] }] });
  expect(await pendingApproval(client, "t")).toBe("คำถาม");
});

test("decide: ส่ง command.resume ตามการตัดสินใจ", async () => {
  const { client, calls } = fakeServer();
  const s = await startOrder(client, "order", "หูฟัง");
  expect(await decide(client, "order", s.threadId, true)).toEqual({ item: "หูฟัง", result: "อนุมัติ หูฟัง" });
  expect(calls.at(-1)?.args[2]).toEqual({ command: { resume: true } });
  const s2 = await startOrder(client, "order", "แว่น");
  expect((await decide(client, "order", s2.threadId, false)).result).toBe("ไม่อนุมัติ");
  expect(calls.at(-1)?.args[2]).toEqual({ command: { resume: false } });
});

test("streamUpdates: แปลง updates เป็น node/interrupt ข้าม metadata, values, end", async () => {
  const { client, calls } = fakeServer();
  const out = [];
  for await (const u of streamUpdates(client, "order", "t9", { item: "หมวก" })) out.push(u);
  expect(out).toEqual([
    { type: "node", node: "prepare", update: { note: "เตรียมแล้ว" } },
    { type: "interrupt", value: { question: "อนุมัติ หมวก ไหม" } },
  ]);
  expect(calls[0]).toMatchObject({ op: "stream", args: ["t9", "order", { input: { item: "หมวก" }, streamMode: ["updates"] }] });
});

test("describeError: แปลงตามสถานะ", () => {
  const http = (status: number) => Object.assign(new Error(`HTTP ${status}: ข้อมูลภายในเซิร์ฟเวอร์ secret-path`), { status });
  expect(describeError(http(404))).toBe("ไม่พบ graph หรือ thread บนเซิร์ฟเวอร์");
  expect(describeError(http(401))).toContain("ไม่มีสิทธิ์");
  expect(describeError(http(403))).toContain("ไม่มีสิทธิ์");
  expect(describeError(http(500))).toBe("เซิร์ฟเวอร์มีปัญหา ลองใหม่ภายหลัง");
  expect(describeError(http(503))).toBe("เซิร์ฟเวอร์มีปัญหา ลองใหม่ภายหลัง");
  expect(describeError(http(404))).not.toContain("secret-path");
});

test("describeError: ต่อไม่ติดและกรณีอื่น", () => {
  expect(describeError(new TypeError("fetch failed"))).toContain("ต่อเซิร์ฟเวอร์ไม่ได้");
  expect(describeError(new Error("connect ECONNREFUSED ::1:2024"))).toContain("ต่อเซิร์ฟเวอร์ไม่ได้");
  expect(describeError(new Error("อะไรสักอย่าง"))).toBe("เกิดข้อผิดพลาดที่ไม่คาดคิด");
  expect(describeError("string")).toBe("เกิดข้อผิดพลาดที่ไม่คาดคิด");
  expect(describeError(undefined)).toBe("เกิดข้อผิดพลาดที่ไม่คาดคิด");
  expect(describeError(Object.assign(new Error("HTTP 418"), { status: 418 }))).toBe("เกิดข้อผิดพลาดที่ไม่คาดคิด");
});

import { MemorySaver } from "@langchain/langgraph";
import { RemoteGraph } from "@langchain/langgraph/remote";
import { type RemoteLike, askRemote, buildGateway, fromRemoteOutput, remoteThreadId, toRemoteInput } from "./gateway";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("toRemoteInput: ส่งเฉพาะ question", () => {
  expect(toRemoteInput({ question: "สวัสดี", secret: "ลับ", answer: "x" } as never)).toEqual({ question: "สวัสดี" });
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

test("remoteThreadId: เป็น UUID (เซิร์ฟเวอร์ไม่รับอย่างอื่น) คงที่ต่อ thread เดิม และต่างกันต่อ thread ต่างกัน", () => {
  expect(remoteThreadId("abc")).toMatch(UUID);
  expect(remoteThreadId("abc")).toBe(remoteThreadId("abc"));
  expect(remoteThreadId("abc")).not.toBe(remoteThreadId("abd"));
  expect(remoteThreadId("ผู้ใช้-1")).toMatch(UUID);
});

test("remoteThreadId: ไม่มี thread ก็ไม่มี", () => {
  for (const none of [undefined, "", null, 5]) expect(remoteThreadId(none)).toBeUndefined();
});

test("fromRemoteOutput: ใช้ answer และปฏิเสธรูปแบบที่ไม่ถูกต้อง", () => {
  expect(fromRemoteOutput({ answer: "ตอบ", extra: 1 })).toEqual({ answer: "ตอบ", source: "remote", error: "" });
  for (const bad of [{}, { answer: "" }, { answer: 42 }, { answer: null }]) {
    expect(() => fromRemoteOutput(bad)).toThrow("ปลายทางไม่ส่ง answer");
  }
});

function fakeRemote(handler: (input: Record<string, unknown>, config?: { configurable?: Record<string, unknown> }) => Promise<Record<string, unknown>>) {
  const calls: { input: Record<string, unknown>; config?: { configurable?: Record<string, unknown> } }[] = [];
  const remote: RemoteLike = {
    async invoke(input, config) {
      calls.push({ input, config });
      return handler(input, config);
    },
  };
  return { remote, calls };
}

test("กราฟแม่: ส่งเฉพาะ question ไปปลายทาง (secret ไม่รั่ว) และรับ answer กลับ", async () => {
  const { remote, calls } = fakeRemote(async () => ({ answer: "จากปลายทาง" }));
  const r = await buildGateway(remote).invoke({ question: "ถาม", secret: "รหัสลับ-999" });
  expect(r).toMatchObject({ answer: "จากปลายทาง", source: "remote", error: "", secret: "รหัสลับ-999" });
  expect(calls[0].input).toEqual({ question: "ถาม" });
  expect(JSON.stringify(calls[0])).not.toContain("999");
});

test("thread ปลายทางอิงจาก thread ของแม่ และคงที่ข้ามรอบ", async () => {
  const { remote, calls } = fakeRemote(async () => ({ answer: "ok" }));
  const app = buildGateway(remote, new MemorySaver());
  await app.invoke({ question: "1" }, { configurable: { thread_id: "p1" } });
  await app.invoke({ question: "2" }, { configurable: { thread_id: "p1" } });
  await app.invoke({ question: "3" }, { configurable: { thread_id: "p2" } });
  const ids = calls.map((c) => c.config?.configurable?.thread_id);
  expect(ids).toEqual([remoteThreadId("p1"), remoteThreadId("p1"), remoteThreadId("p2")]);
  expect(ids[0]).toMatch(UUID);
  expect(ids[0]).not.toBe(ids[2]);
});

test("ปลายทางล้ม: กราฟแม่ไม่ล้ม ได้ fallback พร้อมบันทึกสาเหตุ", async () => {
  const { remote } = fakeRemote(async () => {
    throw new Error("HTTP 503");
  });
  const r = await buildGateway(remote).invoke({ question: "ถาม" });
  expect(r).toMatchObject({ answer: "ขออภัย ระบบปลายทางไม่พร้อมให้บริการ", source: "fallback", error: "HTTP 503" });
});

test("ปลายทางตอบผิดรูป: ใช้ fallback ไม่ใช่ปล่อยค่าว่างต่อ", async () => {
  const { remote } = fakeRemote(async () => ({ somethingElse: 1 }));
  const r = await buildGateway(remote).invoke({ question: "ถาม" });
  expect(r.source).toBe("fallback");
  expect(r.error).toContain("ปลายทางไม่ส่ง answer");
});

test("askRemote: คืนเฉพาะฟิลด์ที่ต้องอัปเดต ไม่แตะ question/secret", async () => {
  const { remote } = fakeRemote(async () => ({ answer: "x" }));
  const out = await askRemote(remote, { question: "q", secret: "s", answer: "", source: "", error: "" } as never);
  expect(Object.keys(out).sort()).toEqual(["answer", "error", "source"]);
});

test("ใช้ RemoteGraph จริง (client ปลอม): graphId และ thread ปลายทางถูกส่ง และ input ไม่มี secret", async () => {
  const seen: unknown[][] = [];
  const client = {
    runs: {
      async *stream(...args: unknown[]) {
        seen.push(args);
        yield { event: "values", data: { question: "ถาม", answer: "จาก RemoteGraph" } };
      },
    },
  };
  const remote = new RemoteGraph({ graphId: "demo", client: client as never });
  const r = await buildGateway(remote as unknown as RemoteLike, new MemorySaver()).invoke({ question: "ถาม", secret: "ลับ-777" }, { configurable: { thread_id: "p9" } });
  expect(r.answer).toBe("จาก RemoteGraph");
  expect(seen[0][0]).toBe(remoteThreadId("p9"));
  expect(seen[0][0]).toMatch(UUID);
  expect(seen[0][1]).toBe("demo");
  expect(JSON.stringify(seen[0][2])).not.toContain("777");
});

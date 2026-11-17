/**
 * fetch ปลอมสำหรับ test ของบท Level 0: ตอบตาม replies ที่เขียนไว้ทีละอันตามลำดับ
 * ไม่ยิงเครือข่าย ไม่ต้องใช้ API key
 * ต่างจาก fakeLLM ตรงที่ "ไม่วนซ้ำ": เรียกเกินจำนวนที่เขียนไว้จะ reject ทันที จะได้รู้ว่าโค้ดเรียกมากกว่าที่คิด
 */
export interface FakeReply {
  status?: number;
  /** object -> ส่งเป็น JSON, string -> ส่งเป็นข้อความดิบ (เช่น สตรีม SSE) */
  body: unknown;
  headers?: Record<string, string>;
  /** ถ้าระบุ จะส่ง body เป็นสตรีมทีละชิ้นตามนี้ (ไม่สนใจ body) ใช้จำลองสตรีมที่ถูกตัดกลางบรรทัด */
  chunks?: string[];
}

export type FakeFetch = typeof fetch & {
  calls: { url: string; init: RequestInit | undefined }[];
};

export function fakeFetch(replies: FakeReply[]): FakeFetch {
  const calls: FakeFetch["calls"] = [];

  const impl = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    calls.push({ url, init });
    const reply = replies[calls.length - 1];
    if (!reply) {
      throw new Error(`fakeFetch: ไม่มี reply เหลือแล้ว (เรียกครั้งที่ ${calls.length})`);
    }
    if (reply.chunks) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          for (const chunk of reply.chunks!) controller.enqueue(encoder.encode(chunk));
          controller.close();
        },
      });
      return new Response(stream, {
        status: reply.status ?? 200,
        headers: { "content-type": "text/event-stream", ...reply.headers },
      });
    }
    const isText = typeof reply.body === "string";
    return new Response(isText ? (reply.body as string) : JSON.stringify(reply.body), {
      status: reply.status ?? 200,
      headers: { "content-type": isText ? "text/plain" : "application/json", ...reply.headers },
    });
  };

  return Object.assign(impl, { calls }) as FakeFetch;
}

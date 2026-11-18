import { todo } from "@src/todo";

export type FetchFn = typeof fetch;

export interface SseEvent {
  event: string;
  data: string;
  id?: string;
}

// (ให้ไว้แล้ว) ต่อ base กับพาธโดยไม่ซ้อน /
export const endpoint = (base: string, path: string) => `${base.replace(/\/+$/, "")}${path}`;

const JSON_HEADERS = { "content-type": "application/json" };

export async function ensureOk(res: Response): Promise<Response> {
  // 👉 ข้อ 1: ถ้า res.ok คืน res เลย ไม่งั้น throw new Error(`เซิร์ฟเวอร์ตอบ ${res.status}: ${await res.text()}`)
  return todo(1);
}

export async function createThread(base: string, fetchFn: FetchFn = fetch): Promise<string> {
  // 👉 ข้อ 2: POST endpoint(base, "/threads") ด้วยหัว JSON_HEADERS และ body "{}" ผ่าน ensureOk แล้วคืน (await res.json()).thread_id
  return todo(2);
}

export async function runWait(
  base: string,
  threadId: string,
  assistantId: string,
  input: unknown,
  fetchFn: FetchFn = fetch,
): Promise<unknown> {
  // 👉 ข้อ 3: POST endpoint(base, `/threads/${threadId}/runs/wait`) body JSON { assistant_id: assistantId, input } ผ่าน ensureOk แล้วคืน res.json()
  return todo(3);
}

export async function getState(base: string, threadId: string, fetchFn: FetchFn = fetch): Promise<{ values: unknown; next: string[] }> {
  const res = await ensureOk(await fetchFn(endpoint(base, `/threads/${threadId}/state`)));
  return res.json();
}

// อ่านข้อความ SSE จากก้อนข้อความที่ตัดตรงไหนก็ได้ แล้วคืนเหตุการณ์ทีละอัน
export async function* parseSse(chunks: AsyncIterable<string>): AsyncGenerator<SseEvent> {
  // 👉 ข้อ 4: สะสม buffer จากทุก chunk (แปลง \r\n เป็น \n ก่อน) ตัดเป็นเหตุการณ์ที่บรรทัดว่าง ("\n\n")
  //   แต่ละเหตุการณ์: บรรทัด "event: x" → event (ไม่มีให้เป็น "message"), "data: y" → data (หลายบรรทัดต่อด้วย "\n"),
  //   "id: z" → id, บรรทัดขึ้นต้นด้วย ":" คือคอมเมนต์ให้ข้าม; ช่องว่างหนึ่งตัวหลัง ":" ตัดทิ้ง
  //   ข้ามเหตุการณ์ที่ไม่มีทั้ง event และ data  เมื่อจบ stream ถ้ายังเหลือ buffer ที่ไม่ว่างให้ถือเป็นเหตุการณ์สุดท้ายด้วย
  todo(4);
}

export async function* streamRun(
  base: string,
  threadId: string,
  assistantId: string,
  input: unknown,
  streamMode: string[],
  fetchFn: FetchFn = fetch,
): AsyncGenerator<{ event: string; data: unknown }> {
  // 👉 ข้อ 5: POST endpoint(base, `/threads/${threadId}/runs/stream`) body { assistant_id, input, stream_mode: streamMode } ผ่าน ensureOk
  //   อ่าน res.body ด้วย getReader() และ TextDecoder แบบ { stream: true } (ไบต์ของตัวอักษรไทยอาจถูกตัดครึ่งระหว่างก้อน)
  //   ส่งข้อความเข้า parseSse แล้ว yield { event, data: JSON.parse(data) } ของทุกเหตุการณ์
  //   เหตุการณ์ "end" → หยุด (ไม่ yield); เหตุการณ์ "error" → throw new Error(data.message ?? data.error ?? "สตรีมล้มเหลว")
  todo(5);
}

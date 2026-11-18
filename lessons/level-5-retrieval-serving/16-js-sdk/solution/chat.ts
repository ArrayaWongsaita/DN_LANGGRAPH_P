export interface ClientLike {
  threads: {
    create(): Promise<{ thread_id: string }>;
    getState(threadId: string): Promise<{ values: unknown; next: string[]; tasks: { interrupts: { value: unknown }[] }[] }>;
  };
  runs: {
    wait(threadId: string | null, assistantId: string, payload: Record<string, unknown>): Promise<any>;
    stream(threadId: string | null, assistantId: string, payload: Record<string, unknown>): AsyncIterable<{ event: string; data: any }>;
  };
}

export interface Started {
  threadId: string;
  pending?: unknown;
  result: any;
}

export async function startOrder(client: ClientLike, assistantId: string, item: string): Promise<Started> {
  const thread = await client.threads.create();
  const result = await client.runs.wait(thread.thread_id, assistantId, { input: { item } });
  return { threadId: thread.thread_id, pending: result?.__interrupt__?.[0]?.value, result };
}

export async function pendingApproval(client: ClientLike, threadId: string): Promise<unknown | undefined> {
  const state = await client.threads.getState(threadId);
  for (const task of state.tasks) {
    if (task.interrupts.length > 0) return task.interrupts[0].value;
  }
  return undefined;
}

export async function decide(client: ClientLike, assistantId: string, threadId: string, approve: boolean): Promise<any> {
  return client.runs.wait(threadId, assistantId, { command: { resume: approve } });
}

export type Update = { type: "node"; node: string; update: unknown } | { type: "interrupt"; value: unknown };

export async function* streamUpdates(client: ClientLike, assistantId: string, threadId: string, input: Record<string, unknown>): AsyncGenerator<Update> {
  for await (const ev of client.runs.stream(threadId, assistantId, { input, streamMode: ["updates"] })) {
    if (ev.event !== "updates") continue;
    for (const [key, value] of Object.entries(ev.data ?? {})) {
      if (key === "__interrupt__") yield { type: "interrupt", value: (value as { value: unknown }[])[0]?.value };
      else yield { type: "node", node: key, update: value };
    }
  }
}

export function describeError(error: unknown): string {
  const e = error as { status?: number; message?: string };
  const status = typeof e?.status === "number" ? e.status : undefined;
  if (status === 404) return "ไม่พบ graph หรือ thread บนเซิร์ฟเวอร์";
  if (status === 401 || status === 403) return "ไม่มีสิทธิ์เรียกเซิร์ฟเวอร์ (ตรวจ API key)";
  if (status !== undefined && status >= 500) return "เซิร์ฟเวอร์มีปัญหา ลองใหม่ภายหลัง";
  if (status === undefined && /fetch failed|ECONNREFUSED/.test(String(e?.message ?? ""))) return "ต่อเซิร์ฟเวอร์ไม่ได้ ตรวจว่าเปิดอยู่และที่อยู่ถูกต้อง";
  return "เกิดข้อผิดพลาดที่ไม่คาดคิด";
}

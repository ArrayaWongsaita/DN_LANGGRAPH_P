import { todo } from "@src/todo";

// ส่วนย่อยของ Client จริง (@langchain/langgraph-sdk) ที่บทนี้ใช้ ตัวตรวจส่งของปลอมที่หน้าตาเหมือนกัน
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
  pending?: unknown; // คำถามที่รออนุมัติ (ค่าที่ interrupt ส่งมา) ถ้ามี
  result: any;
}

export async function startOrder(client: ClientLike, assistantId: string, item: string): Promise<Started> {
  // 👉 ข้อ 1: สร้าง thread ด้วย client.threads.create() แล้ว client.runs.wait(thread_id, assistantId, { input: { item } })
  //          คืน { threadId, pending: result.__interrupt__?.[0]?.value, result }
  return todo(1);
}

// กู้คำถามที่ค้างอยู่ (เช่นผู้ใช้เปิดหน้าใหม่) จาก state ของ thread
export async function pendingApproval(client: ClientLike, threadId: string): Promise<unknown | undefined> {
  // 👉 ข้อ 2: state = await client.threads.getState(threadId) คืน value ของ interrupt ตัวแรกที่พบใน state.tasks (วน tasks แล้ว interrupts) ไม่มีคืน undefined
  return todo(2);
}

export async function decide(client: ClientLike, assistantId: string, threadId: string, approve: boolean): Promise<any> {
  // 👉 ข้อ 3: client.runs.wait(threadId, assistantId, { command: { resume: approve } }) แล้วคืนผล
  return todo(3);
}

export type Update = { type: "node"; node: string; update: unknown } | { type: "interrupt"; value: unknown };

export async function* streamUpdates(client: ClientLike, assistantId: string, threadId: string, input: Record<string, unknown>): AsyncGenerator<Update> {
  // 👉 ข้อ 4: วน client.runs.stream(threadId, assistantId, { input, streamMode: ["updates"] })
  //   สนใจเฉพาะ event === "updates": วน Object.entries(data): คีย์ "__interrupt__" → yield { type: "interrupt", value: ค่าของ interrupt ตัวแรก (data.__interrupt__[0].value) }
  //   คีย์อื่น → yield { type: "node", node: คีย์, update: ค่า }  เหตุการณ์ชนิดอื่น (metadata, end) ข้าม
  todo(4);
}

// แปลงข้อผิดพลาดของ SDK/เครือข่ายเป็นข้อความที่ผู้ใช้อ่านรู้เรื่อง (ไม่เผยรายละเอียดภายในเซิร์ฟเวอร์)
export function describeError(error: unknown): string {
  // 👉 ข้อ 5: อ่าน status จาก (error as { status?: number }).status
  //   404 → "ไม่พบ graph หรือ thread บนเซิร์ฟเวอร์"; 401 หรือ 403 → "ไม่มีสิทธิ์เรียกเซิร์ฟเวอร์ (ตรวจ API key)";
  //   status >= 500 → "เซิร์ฟเวอร์มีปัญหา ลองใหม่ภายหลัง";
  //   ไม่มี status แต่ข้อความมี "fetch failed" หรือ "ECONNREFUSED" → "ต่อเซิร์ฟเวอร์ไม่ได้ ตรวจว่าเปิดอยู่และที่อยู่ถูกต้อง";
  //   นอกนั้นคืน "เกิดข้อผิดพลาดที่ไม่คาดคิด"
  return todo(5);
}

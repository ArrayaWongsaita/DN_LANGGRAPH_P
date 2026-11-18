import { todo } from "@src/todo";

export interface SseMessage {
  event?: string;
  data: unknown;
  id?: string | number;
}

export function formatSse(message: SseMessage): string {
  // 👉 ข้อ 1: สร้างข้อความ SSE ตามลำดับ: `id: ..\n` (ถ้ามี id), `event: ..\n` (ถ้ามี event),
  //          แล้ว data: ถ้า data เป็น string ให้แยกตาม "\n" และขึ้น `data: <บรรทัด>\n` ทุกบรรทัด
  //          ถ้าไม่ใช่ string ใช้ JSON.stringify เป็นบรรทัดเดียว จบด้วยบรรทัดว่างหนึ่งบรรทัด ("\n")
  return todo(1);
}

export function sseHeaders(): Record<string, string> {
  // 👉 ข้อ 2: คืน { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" }
  return todo(2);
}

// ปลายทางที่เขียนได้ (Express `res` ใช้แทนได้โดยตรง)
export interface Sink {
  write(chunk: string): unknown;
  end(): unknown;
}

// เขียนทุกรายการจาก source ลง sink เป็นข้อความ SSE (ชื่อเหตุการณ์ = item.type ถ้ามี, data = item)
export async function streamToSink(source: AsyncIterable<{ type?: string }>, sink: Sink, signal: AbortSignal): Promise<void> {
  try {
    // 👉 ข้อ 3: for await (const item of source): ถ้า signal.aborted ให้ break (ออกจาก for await จะหยุดท่อต้นทางเอง) ก่อนเขียน
    //          ไม่งั้น sink.write(formatSse({ event: item.type, data: item }))
    //          ถ้าวนอ่านโยน error และยังไม่ aborted: เขียนเหตุการณ์ "error" ด้วย data { message: ข้อความของ error }
    //          และไม่ว่าจะจบแบบไหน (ปกติ/ยกเลิก/ล้ม) ต้อง sink.end() เสมอ ครั้งเดียว
    todo(3);
  } finally {
    sink.end();
  }
}

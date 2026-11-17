import { END, GraphRecursionError, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

const State = new StateSchema({ n: z.number().default(0) });

// StateGraph ที่เราต่อ node/edge อยู่ เป็นแค่ "แบบแปลน" ยังรันไม่ได้
// ต้อง .compile() ก่อน จึงได้ graph ที่ตรวจความถูกต้องแล้วและ .invoke(...) ได้
export function buildCounter() {
  const builder = new StateGraph(State)
    .addNode("inc", (s) => ({ n: s.n + 1 }))
    .addEdge(START, "inc")
    .addEdge("inc", END);

  // 👉 ข้อ 1: แปลงแบบแปลนเป็น graph ที่รันได้ แล้วคืนออกไป
  // แนวทาง: return builder.compile();
  return todo(1);
}

interface Invokable {
  invoke(input: never, config?: { recursionLimit?: number }): Promise<unknown>;
}

// รัน graph พร้อมตั้ง "จำนวนก้าวสูงสุด" (recursionLimit) กัน graph ที่วนไม่จบ
export async function runWithLimit(
  graph: Invokable,
  input: object,
  limit: number,
): Promise<{ status: "ok"; state: unknown } | { status: "limit" }> {
  try {
    // 👉 ข้อ 2: เรียก graph.invoke ด้วย input และ config { recursionLimit: limit } แล้วคืน { status: "ok", state: ผลลัพธ์ }
    // แนวทาง: const state = await graph.invoke(input as never, { recursionLimit: limit });
    //         return { status: "ok", state };
    return todo(2);
  } catch (e) {
    // 👉 ข้อ 3: ถ้า error คือ GraphRecursionError (วนเกิน limit) ให้คืน { status: "limit" }
    //          error ชนิดอื่นต้อง throw ต่อ (อย่ากลืน error ที่ไม่รู้จัก)
    // แนวทาง: if (e instanceof GraphRecursionError) return { status: "limit" };  throw e;
    return todo(3);
  }
}

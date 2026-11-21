import { fileURLToPath } from "node:url";
import React from "react";
import { JSDOM } from "jsdom";
import { useStream } from "@langchain/langgraph-sdk/react";
import { todo } from "@src/todo";
import { startDevServer } from "@src/devServer";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-26  (เปิดเซิร์ฟเวอร์ langgraph dev ชั่วคราวและเรนเดอร์ React ใน jsdom ไม่ต้องมีเบราว์เซอร์ ไม่ใช้ LLM)
// useStream (จาก @langchain/langgraph-sdk/react) คือ hook ที่ห่อสิ่งที่บท 5-15 ถึง 5-25 ทำเองไว้ให้: ต่อเซิร์ฟเวอร์, อ่านสตรีม, เก็บ state (values), บอก isLoading/error และ interrupt บทนี้เขียนส่วนที่ต่อ hook กับ UI ของฟอร์มสั่งของที่ต้องรออนุมัติ: ส่งงาน, ข้อความสถานะ, อ่านคำถามจาก interrupt และส่งคำตัดสินกลับ แล้วดูมันทำงานกับเซิร์ฟเวอร์จริง (graph "order" ของ 5-16)

// state ของ graph "order" ที่ hook จะให้เรา
interface OrderState {
  item: string;
  note: string;
  result: string;
}

// ส่วนของค่าที่ useStream คืนมาซึ่งบทนี้ใช้ (ส่วนตรวจใช้ของปลอมหน้าตาเดียวกันได้)
interface StreamLike {
  values: Partial<OrderState>;
  isLoading: boolean;
  error: unknown;
  interrupt: { value?: unknown } | undefined;
  submit(input: Partial<OrderState> | undefined | null, options?: { command?: { resume?: unknown } }): unknown;
}

// ส่งงานใหม่เข้า graph
function sendOrder(stream: Pick<StreamLike, "submit">, item: string) {
  // 👉 ข้อ 1 เรียก stream.submit({ item })
  // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
  //   return stream.submit({ item });
  return todo(1);
}

// อ่านคำถามที่ graph หยุดรอ (ค่าที่ interrupt({ question }) ส่งมา) ไม่มีคำถามคืน undefined
function questionOf(interrupt: StreamLike["interrupt"]): string | undefined {
  const value = interrupt?.value as { question?: unknown } | undefined;
  return typeof value?.question === "string" ? value.question : undefined;
}

// ส่งคำตัดสินกลับให้ graph ที่หยุดรออยู่ (ไม่มี input ใหม่ มีแค่ command resume)
function decide(stream: Pick<StreamLike, "submit">, approve: boolean) {
  return stream.submit(undefined, { command: { resume: approve } });
}

// ข้อความสถานะสำหรับหัวฟอร์ม
function statusLabel(stream: Pick<StreamLike, "values" | "isLoading" | "error" | "interrupt">): string {
  if (stream.error) return `ผิดพลาด: ${stream.error instanceof Error ? stream.error.message : String(stream.error)}`;
  if (questionOf(stream.interrupt) !== undefined) return "รอคุณอนุมัติ";
  if (stream.isLoading) return "กำลังทำงาน...";
  if (stream.values.result) return `เสร็จ: ${stream.values.result}`;
  return "พร้อม";
}

// (ให้ไว้แล้ว) คอมโพเนนต์ที่ต่อ useStream เข้ากับฟังก์ชันของคุณ
function OrderForm({ apiUrl }: { apiUrl: string }) {
  const stream = useStream<OrderState>({ apiUrl, assistantId: "order" });
  const like = stream as unknown as StreamLike;
  const question = questionOf(like.interrupt);
  return (
    <div>
      <p data-testid="status">{statusLabel(like)}</p>
      <button onClick={() => sendOrder(like, "หูฟัง")}>สั่งหูฟัง</button>
      {question !== undefined && (
        <div>
          <p data-testid="question">{question}</p>
          <button onClick={() => decide(like, true)}>อนุมัติ</button>
          <button onClick={() => decide(like, false)}>ไม่อนุมัติ</button>
        </div>
      )}
    </div>
  );
}

// ส่วนที่ 1: ฟังก์ชันของคุณกับ stream ปลอมที่จดว่าถูกเรียกอะไร (ไม่ใช้เครือข่าย)
const calls: { input: unknown; options: unknown }[] = [];
const fakeStream = { submit: (input: unknown, options?: unknown) => void calls.push({ input, options }) };
sendOrder(fakeStream as never, "หมวก");
decide(fakeStream as never, true);
decide(fakeStream as never, false);
const base = { values: {}, isLoading: false, error: undefined, interrupt: undefined };
const labels = {
  idle: statusLabel(base),
  loading: statusLabel({ ...base, isLoading: true }),
  asking: statusLabel({ ...base, isLoading: true, interrupt: { value: { question: "อนุมัติไหม" } } }),
  done: statusLabel({ ...base, values: { result: "อนุมัติ หมวก" } }),
  errorObj: statusLabel({ ...base, isLoading: true, error: new Error("พัง") }),
  errorText: statusLabel({ ...base, error: "ข้อความ" }),
};

// ส่วนที่ 2: เรนเดอร์จริงใน jsdom ต่อเซิร์ฟเวอร์ langgraph dev จริง (React ต้องใช้ window/document จึงสร้างจาก jsdom)
const dom = new JSDOM("<!doctype html><body></body>", { url: "http://localhost/" });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
const { render, screen, fireEvent, waitFor, cleanup } = await import("@testing-library/react");
const text = (id: string) => screen.getByTestId(id).textContent ?? "";
const PORT = 2962;
const config = fileURLToPath(new URL("./server/langgraph.json", import.meta.url));
console.log("กำลังเปิดเซิร์ฟเวอร์ (ครั้งแรกอาจใช้เวลาสักครู่)...");
const stop = await startDevServer(config, PORT);
const seen: string[] = [];
let asked = "";
let finalStatus = "";
let realError = "";
try {
  render(<OrderForm apiUrl={`http://localhost:${PORT}`} />);
  seen.push(text("status"));
  fireEvent.click(screen.getByText("สั่งหูฟัง"));
  await waitFor(() => screen.getByTestId("question"), { timeout: 20000 });
  asked = text("question");
  seen.push(text("status"));
  fireEvent.click(screen.getByText("อนุมัติ"));
  await waitFor(
    () => {
      if (!text("status").startsWith("เสร็จ")) throw new Error("ยังไม่เสร็จ");
    },
    { timeout: 20000 },
  );
  finalStatus = text("status");
  console.log({ seen, asked, finalStatus });
} catch (error) {
  realError = (error as Error).message;
  console.log("ส่วนที่ 2 ล้มเหลว:", realError.slice(0, 200));
} finally {
  cleanup();
  stop();
}












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
check("sendOrder: ส่ง { item } เข้า submit", same(calls[0], { input: { item: "หมวก" }, options: undefined }));
check("decide: ส่ง undefined กับ command.resume ตามคำตัดสิน", same(calls[1], { input: undefined, options: { command: { resume: true } } }) && same(calls[2], { input: undefined, options: { command: { resume: false } } }));
check("questionOf: อ่านคำถามจาก interrupt และคืน undefined เมื่อไม่มี/ผิดรูป", questionOf({ value: { question: "ก?" } }) === "ก?" && questionOf(undefined) === undefined && questionOf({ value: "สตริงเฉย ๆ" }) === undefined && questionOf({ value: { question: 5 } }) === undefined && questionOf({}) === undefined);
check("statusLabel: ข้อความสถานะตามลำดับความสำคัญ (error > รออนุมัติ > กำลังทำงาน > เสร็จ > พร้อม)", labels.idle === "พร้อม" && labels.loading === "กำลังทำงาน..." && labels.asking === "รอคุณอนุมัติ" && labels.done === "เสร็จ: อนุมัติ หมวก" && labels.errorObj === "ผิดพลาด: พัง" && labels.errorText === "ผิดพลาด: ข้อความ");
check("เซิร์ฟเวอร์จริง: เริ่มที่ 'พร้อม' แล้วหยุดรออนุมัติพร้อมคำถามจาก graph", realError === "" && seen[0] === "พร้อม" && asked === "อนุมัติ หูฟัง ไหม" && seen[1] === "รอคุณอนุมัติ", realError || "ดู statusLabel/questionOf และปุ่มสั่งหูฟังเรียก sendOrder");
check("เซิร์ฟเวอร์จริง: กดอนุมัติแล้ว graph เดินต่อจนเสร็จ", finalStatus === "เสร็จ: อนุมัติ หูฟัง", "decide ต้องส่ง command.resume ไม่ใช่ input ใหม่");
process.exit(process.exitCode ?? 0);

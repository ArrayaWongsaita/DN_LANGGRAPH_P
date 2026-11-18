import { type ChildProcess, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createThread, getState, runWait, streamRun } from "./api";

// เปิด langgraph dev ชั่วคราว (ไม่ต้องมีบัญชี LangSmith) เรียก API ด้วย api.ts ของคุณ แล้วปิด
const PORT = 2955;
const BASE = `http://localhost:${PORT}`;
const config = fileURLToPath(new URL("./server/langgraph.json", import.meta.url));
const bin = fileURLToPath(new URL("../../../node_modules/.bin/langgraphjs", import.meta.url));

const server: ChildProcess = spawn(bin, ["dev", "--no-browser", "--port", String(PORT), "--config", config], { stdio: "ignore", detached: true });
const stop = () => {
  try {
    process.kill(-server.pid!, "SIGTERM"); // ปิดทั้งกลุ่มโปรเซส (CLI สร้างโปรเซสลูก)
  } catch {
    // ปิดไปแล้ว
  }
};

try {
  console.log("กำลังเปิดเซิร์ฟเวอร์ (ครั้งแรกอาจใช้เวลาสักครู่)...");
  for (let i = 0; ; i++) {
    try {
      if ((await fetch(`${BASE}/ok`)).ok) break;
    } catch {
      // ยังไม่พร้อม
    }
    if (i > 60) throw new Error("เซิร์ฟเวอร์ไม่ขึ้นภายใน 60 วินาที");
    await new Promise((r) => setTimeout(r, 1000));
  }

  const thread = await createThread(BASE);
  console.log("thread:", thread);
  console.log("รอบ 1 (wait):", await runWait(BASE, thread, "demo", { question: "สวัสดี" }));
  console.log("รอบ 2 (wait):", await runWait(BASE, thread, "demo", { question: "อีกครั้ง" }), "← turns เพิ่มเพราะ state ค้างใน thread");
  console.log("state:", JSON.stringify((await getState(BASE, thread)).values));

  console.log("\nสตรีม:");
  for await (const ev of streamRun(BASE, thread, "demo", { question: "สตรีม" }, ["updates", "values"])) {
    console.log(" ", ev.event, JSON.stringify(ev.data));
  }
  try {
    await runWait(BASE, thread, "ไม่มีจริง", {});
  } catch (error) {
    console.log("\nassistant ที่ไม่มี →", (error as Error).message);
  }
} finally {
  stop();
}

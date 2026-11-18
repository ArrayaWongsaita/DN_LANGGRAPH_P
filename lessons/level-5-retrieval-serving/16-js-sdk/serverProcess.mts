import { type ChildProcess, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

// เปิด langgraph dev ชั่วคราว (ไม่ต้องมีบัญชี LangSmith) คืนฟังก์ชันปิด
export async function startServer(port: number): Promise<() => void> {
  const config = fileURLToPath(new URL("./server/langgraph.json", import.meta.url));
  const bin = fileURLToPath(new URL("../../../node_modules/.bin/langgraphjs", import.meta.url));
  const server: ChildProcess = spawn(bin, ["dev", "--no-browser", "--port", String(port), "--config", config], { stdio: "ignore", detached: true });
  const stop = () => {
    try {
      process.kill(-server.pid!, "SIGTERM");
    } catch {
      // ปิดไปแล้ว
    }
  };
  for (let i = 0; ; i++) {
    try {
      if ((await fetch(`http://localhost:${port}/ok`)).ok) return stop;
    } catch {
      // ยังไม่พร้อม
    }
    if (i > 60) {
      stop();
      throw new Error("เซิร์ฟเวอร์ไม่ขึ้นภายใน 60 วินาที");
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
}

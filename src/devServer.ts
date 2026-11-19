import { type ChildProcess, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

// เปิด `langgraph dev` ชั่วคราวสำหรับบทเรียน (ไม่ต้องมีบัญชี LangSmith) คืนฟังก์ชันปิด
// configPath = พาธของ langgraph.json ของบทนั้น (ครั้งแรกอาจใช้เวลาสักครู่)
export async function startDevServer(configPath: string, port: number): Promise<() => void> {
  const bin = fileURLToPath(new URL("../node_modules/.bin/langgraphjs", import.meta.url));
  const server: ChildProcess = spawn(bin, ["dev", "--no-browser", "--port", String(port), "--config", configPath], { stdio: "ignore", detached: true });
  const stop = () => {
    try {
      process.kill(-server.pid!, "SIGTERM"); // ปิดทั้งกลุ่มโปรเซส (CLI สร้างโปรเซสลูก)
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

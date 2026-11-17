import { spawnSync } from "node:child_process";

// ผู้เรียนที่ยังไม่ตั้ง key ต้องเห็นข้อความไทยสั้น ๆ ไม่ใช่ stack trace
test("npm run lesson 03 โดยไม่มี key พิมพ์ข้อความไทยที่พูดถึง OLLAMA_API_KEY และไม่มี stack trace", () => {
  const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/run-lesson.ts", "03"], {
    encoding: "utf8",
    env: { ...process.env, OLLAMA_API_KEY: "" },
  });
  expect(result.status).not.toBe(0);
  expect(result.stderr).toMatch(/OLLAMA_API_KEY/);
  expect(result.stderr).not.toMatch(/\n\s+at /);
}, 30_000);

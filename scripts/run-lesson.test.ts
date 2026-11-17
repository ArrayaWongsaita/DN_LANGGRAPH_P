import { spawnSync } from "node:child_process";

// ผู้เรียนที่ยังไม่ตั้ง key ต้องเห็นข้อความไทยสั้น ๆ ไม่ใช่ stack trace
test("npm run lesson โดยไม่มี key พิมพ์ข้อความไทยที่พูดถึง key และไม่มี stack trace", () => {
  const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/run-lesson.ts", "01"], {
    encoding: "utf8",
    env: {
      ...process.env,
      LESSONS_ROOT: "scripts/fixtures/run-lesson",
      LLM_PROVIDER: "",
      GROQ_API_KEY: "",
    },
  });
  expect(result.status).not.toBe(0);
  expect(result.stderr).toMatch(/GROQ_API_KEY/);
  expect(result.stderr).not.toMatch(/\n\s+at /);
}, 30_000);

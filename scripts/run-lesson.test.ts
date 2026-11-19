import { spawnSync } from "node:child_process";

// ผู้เรียนที่ยังไม่ตั้ง key ต้องเห็นข้อความไทยสั้น ๆ ไม่ใช่ stack trace
test("pnpm lesson โดยไม่มี key พิมพ์ข้อความไทยที่พูดถึง key และไม่มี stack trace", () => {
  const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/run-lesson.ts", "1-01"], {
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

// บทของ Level 0 ก็ต้องไม่โชว์ stack trace เมื่อยังไม่ได้ตั้ง key
test("pnpm lesson 0-01 โดยไม่มี key พิมพ์ข้อความไทยที่บอกชื่อตัวแปร และไม่มี stack trace", () => {
  const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/run-lesson.ts", "0-01"], {
    encoding: "utf8",
    env: { ...process.env, LLM_PROVIDER: "", GROQ_API_KEY: "" },
  });
  expect(result.status).not.toBe(0);
  expect(result.stderr).toMatch(/GROQ_API_KEY/);
  expect(result.stderr).not.toMatch(/\n\s+at /);
}, 30_000);

// บทแบบไฟล์เดียว: ไม่มี run.ts ให้รัน .ts ไฟล์เดียวของบทแทน
test("pnpm lesson รันไฟล์เดียวของบทเมื่อไม่มี run.ts", () => {
  const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/run-lesson.ts", "1-02"], {
    encoding: "utf8",
    env: { ...process.env, LESSONS_ROOT: "scripts/fixtures/run-lesson" },
  });
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("single-file ok");
}, 30_000);

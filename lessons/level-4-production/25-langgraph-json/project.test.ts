import { checkGraphPath, makeLanggraphConfig } from "./project";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("config มีโครงตามที่ CLI ต้องการ และไม่มี key จริง", () => {
  const config = makeLanggraphConfig({ agent: "./src/agent.ts:agent" });
  expect(config).toEqual({ dependencies: ["."], graphs: { agent: "./src/agent.ts:agent" }, env: ".env" });
  expect(JSON.stringify(config)).not.toMatch(/KEY|SECRET/i);
});

test("พาธที่ถูกต้องผ่าน", () => {
  expect(checkGraphPath("./src/agent.ts:agent")).toBeUndefined();
  expect(checkGraphPath("./dist/my-graph.js:buildGraph")).toBeUndefined();
});

test("พาธผิดรูปแบบถูกจับ พร้อมข้อความบอกรูปแบบที่ถูก", () => {
  for (const bad of ["src/agent.ts:agent", "./src/agent.ts", "./src/agent.ts:", "./src/agent.py:agent", "./src/agent.ts:1abc"]) {
    expect(checkGraphPath(bad)).toContain("พาธไม่ถูกต้อง");
  }
  expect(checkGraphPath("./x.txt:a")).toContain("./src/agent.ts:agent");
});

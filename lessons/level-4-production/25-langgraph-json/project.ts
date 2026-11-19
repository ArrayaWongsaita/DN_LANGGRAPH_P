import { todo } from "@src/todo";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-25  (ไม่ใช้ LLM)
// langgraph.json คือไฟล์ที่บอก CLI ว่า graph ของเราอยู่ไหนและโหลด env จากไหน (ใช้กับ langgraph dev / deploy) บทนี้ฝึกสร้างและตรวจไฟล์นี้ในโค้ด
interface LanggraphConfig {
  dependencies: string[];
  graphs: Record<string, string>;
  env: string;
}

function makeLanggraphConfig(graphs: Record<string, string>): LanggraphConfig {
  // 👉 ข้อ 1: คืน { dependencies: ["."], graphs, env: ".env" }
  return todo(1);
}

// พาธของ graph ต้องอยู่ในรูป "./ไฟล์.ts:ชื่อที่export" (หรือ .js) คืนข้อความปัญหา หรือ undefined ถ้าถูกต้อง
function checkGraphPath(path: string): string | undefined {
  // 👉 ข้อ 2: ตรวจด้วย regex /^\.\/[\w./-]+\.(ts|js):[A-Za-z_$][\w$]*$/
  //          ถ้าไม่ตรงคืน `พาธไม่ถูกต้อง: ${path} (ต้องเป็น ./src/agent.ts:agent)` ถ้าตรงคืน undefined
  return todo(2);
}

const config = makeLanggraphConfig({ agent: "./src/agent.ts:agent" });
console.log(JSON.stringify(config, null, 2));
const badPaths = ["src/agent.ts:agent", "./src/agent.ts", "./src/agent.ts:", "./src/agent.py:agent", "./src/agent.ts:1abc"];

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("config มีโครงตามที่ CLI ต้องการ", JSON.stringify(config) === JSON.stringify({ dependencies: ["."], graphs: { agent: "./src/agent.ts:agent" }, env: ".env" }), "{ dependencies: [\".\"], graphs, env: \".env\" }");
check("config ไม่มี key จริงหลุดอยู่ข้างใน", !/KEY|SECRET/i.test(JSON.stringify(config)), "ชื่อไฟล์ env เท่านั้น ห้ามใส่ค่า key");
check("พาธที่ถูกต้องผ่าน", checkGraphPath("./src/agent.ts:agent") === undefined && checkGraphPath("./dist/my-graph.js:buildGraph") === undefined);
check("พาธผิดรูปแบบถูกจับ พร้อมข้อความบอกรูปแบบที่ถูก", badPaths.every((p) => (checkGraphPath(p) ?? "").includes("พาธไม่ถูกต้อง")) && (checkGraphPath("./x.txt:a") ?? "").includes("./src/agent.ts:agent"));

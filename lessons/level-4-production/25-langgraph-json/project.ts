import { todo } from "@src/todo";

export interface LanggraphConfig {
  dependencies: string[];
  graphs: Record<string, string>;
  env: string;
}

export function makeLanggraphConfig(graphs: Record<string, string>): LanggraphConfig {
  // 👉 ข้อ 1: คืน { dependencies: ["."], graphs, env: ".env" }
  return todo(1);
}

// พาธของ graph ต้องอยู่ในรูป "./ไฟล์.ts:ชื่อที่export" (หรือ .js) คืนข้อความปัญหา หรือ undefined ถ้าถูกต้อง
export function checkGraphPath(path: string): string | undefined {
  // 👉 ข้อ 2: ตรวจด้วย regex /^\.\/[\w./-]+\.(ts|js):[A-Za-z_$][\w$]*$/
  //          ถ้าไม่ตรงคืน `พาธไม่ถูกต้อง: ${path} (ต้องเป็น ./src/agent.ts:agent)` ถ้าตรงคืน undefined
  return todo(2);
}

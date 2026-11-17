export interface LanggraphConfig {
  dependencies: string[];
  graphs: Record<string, string>;
  env: string;
}

export function makeLanggraphConfig(graphs: Record<string, string>): LanggraphConfig {
  return { dependencies: ["."], graphs, env: ".env" };
}

export function checkGraphPath(path: string): string | undefined {
  const ok = /^\.\/[\w./-]+\.(ts|js):[A-Za-z_$][\w$]*$/.test(path);
  return ok ? undefined : `พาธไม่ถูกต้อง: ${path} (ต้องเป็น ./src/agent.ts:agent)`;
}

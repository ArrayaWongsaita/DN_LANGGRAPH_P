import { MultiServerMCPClient } from "@langchain/mcp-adapters";

export interface ServerSpec {
  name: string;
  url: string;
  token?: string;
}

const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/;

export function buildMcpConfig(servers: ServerSpec[]) {
  const mcpServers: Record<string, { transport: "http"; url: string; headers?: Record<string, string> }> = {};
  for (const { name, url, token } of servers) {
    if (token && !url.startsWith("https://") && !LOCAL.test(url)) throw new Error(`ห้ามส่ง token ผ่าน http ธรรมดาไปที่ ${name}`);
    mcpServers[name] = { transport: "http", url, ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}) };
  }
  return { mcpServers };
}

export function makeClient(servers: ServerSpec[]) {
  return new MultiServerMCPClient(buildMcpConfig(servers) as never);
}

export function describeMcpError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("Authentication failed")) return "เซิร์ฟเวอร์ MCP ปฏิเสธการยืนยันตัวตน (ตรวจ token)";
  if (message.includes("ECONNREFUSED") || message.includes("fetch failed")) return "ต่อเซิร์ฟเวอร์ MCP ไม่ได้";
  return "เรียกเซิร์ฟเวอร์ MCP ไม่สำเร็จ";
}

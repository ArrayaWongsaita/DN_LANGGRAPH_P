import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { todo } from "@src/todo";

export interface ServerSpec {
  name: string;
  url: string;
  token?: string;
}

// สร้าง config ของ MultiServerMCPClient (transport http) พร้อมหัว Authorization ถ้ามี token
export function buildMcpConfig(servers: ServerSpec[]) {
  // 👉 ข้อ 5: คืน { mcpServers: { [name]: { transport: "http", url, headers? } } } โดย headers = { Authorization: `Bearer ${token}` } เฉพาะเมื่อมี token (ไม่มี token ห้ามมีคีย์ headers)
  //          และถ้ามี token แต่ url ไม่ใช่ https:// และไม่ใช่ http://localhost / http://127.0.0.1 (ตามด้วย : หรือ / หรือจบ) ให้ throw
  //          new Error(`ห้ามส่ง token ผ่าน http ธรรมดาไปที่ ${name}`) (ไม่ใส่ token ในข้อความ)
  return todo(5);
}

export function makeClient(servers: ServerSpec[]) {
  return new MultiServerMCPClient(buildMcpConfig(servers) as never);
}

// แปลง error ของ adapter เป็นข้อความที่ผู้ใช้อ่านรู้เรื่อง ไม่เผย URL/รายละเอียดภายใน
export function describeMcpError(error: unknown): string {
  // 👉 ข้อ 6: ข้อความ error มี "Authentication failed" → "เซิร์ฟเวอร์ MCP ปฏิเสธการยืนยันตัวตน (ตรวจ token)"
  //          มี "ECONNREFUSED" หรือ "fetch failed" → "ต่อเซิร์ฟเวอร์ MCP ไม่ได้"  นอกนั้น → "เรียกเซิร์ฟเวอร์ MCP ไม่สำเร็จ"
  return todo(6);
}

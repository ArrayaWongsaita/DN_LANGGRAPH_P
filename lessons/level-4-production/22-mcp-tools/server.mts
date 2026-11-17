// MCP server จำลองสำหรับบทเรียน: เปิดเครื่องมือ "add" ผ่าน stdio (ไม่ต้องแก้ไฟล์นี้)
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";

const server = new McpServer({ name: "calc", version: "1.0.0" });
server.registerTool(
  "add",
  { description: "บวกเลขสองจำนวน", inputSchema: z.object({ a: z.number(), b: z.number() }) },
  async ({ a, b }) => ({ content: [{ type: "text", text: String(a + b) }] }),
);
await server.connect(new StdioServerTransport());

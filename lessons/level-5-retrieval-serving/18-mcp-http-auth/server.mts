// MCP server ผ่าน HTTP สำหรับบทเรียน (ไม่ต้องแก้ไฟล์นี้) เปิด tool "add" หลังตรวจ Bearer ด้วย authenticate ของคุณ
import { createServer } from "node:http";
import { Readable } from "node:stream";
import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import { z } from "zod";
import { authenticate, unauthorizedResponse } from "./auth";

const PORT = Number(process.env.MCP_PORT ?? 2960);
const tokens = { alice: process.env.MCP_DEMO_TOKEN ?? "demo-token" };

const handler = createMcpHandler(() => {
  const server = new McpServer({ name: "calc", version: "1.0.0" });
  server.registerTool(
    "add",
    { description: "บวกเลขสองจำนวน", inputSchema: z.object({ a: z.number(), b: z.number() }) },
    async ({ a, b }) => ({ content: [{ type: "text", text: String(a + b) }] }),
  );
  return server;
});

createServer(async (req, res) => {
  const auth = authenticate(req.headers.authorization, tokens);
  const reply = async (response: Response) => {
    res.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) Readable.fromWeb(response.body as never).pipe(res);
    else res.end();
  };
  if (!auth.ok) return reply(unauthorizedResponse(auth.reason));
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const hasBody = !["GET", "HEAD"].includes(req.method ?? "GET");
  const request = new Request(`http://localhost${req.url}`, {
    method: req.method,
    headers: req.headers as Record<string, string>,
    body: hasBody ? Buffer.concat(chunks) : undefined,
  });
  return reply(await handler.fetch(request));
}).listen(PORT, () => console.log(`MCP HTTP server พร้อมที่พอร์ต ${PORT}`));

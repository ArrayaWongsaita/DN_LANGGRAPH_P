import { createHash, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import type { Server } from "node:http";
import { Readable } from "node:stream";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-18  (เปิดเซิร์ฟเวอร์ MCP ผ่าน HTTP ชั่วคราวในสคริปต์เอง ไม่ใช้ LLM)
// MCP ผ่าน HTTP ต้องมี "ประตู": ฝั่งเซิร์ฟเวอร์ตรวจ Bearer token (เทียบแบบ constant-time ไม่รั่วเวลา) ฝั่งไคลเอนต์ส่ง token เฉพาะช่องทางที่ปลอดภัย (https หรือเครื่องตัวเอง) และแปลง error เป็นข้อความที่ไม่เผย URL ภายใน

// แยก token จากหัว Authorization: "Bearer abc" → "abc"
function parseBearer(header: string | null | undefined): string | null {
  if (!header) return null;
  const parts = header.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer" || parts[1] === "") return null;
  return parts[1];
}

// เทียบสตริงแบบ constant-time
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}

type AuthResult = { ok: true; client: string } | { ok: false; reason: string };

// tokens: ชื่อผู้เรียก → token
function authenticate(header: string | null | undefined, tokens: Record<string, string>): AuthResult {
  const token = parseBearer(header);
  if (!token) return { ok: false, reason: "ไม่มี Bearer token" };
  let matched: string | null = null;
  for (const [name, expected] of Object.entries(tokens)) {
    if (safeEqual(token, expected) && matched === null) matched = name;
  }
  return matched ? { ok: true, client: matched } : { ok: false, reason: "token ไม่ถูกต้อง" };
}

function unauthorizedResponse(reason: string): Response {
  return new Response(JSON.stringify({ error: "unauthorized", reason }), {
    status: 401,
    headers: { "WWW-Authenticate": 'Bearer realm="mcp"', "content-type": "application/json" },
  });
}

interface ServerSpec {
  name: string;
  url: string;
  token?: string;
}

// สร้าง config ของ MultiServerMCPClient (transport http) พร้อมหัว Authorization ถ้ามี token
function buildMcpConfig(servers: ServerSpec[]) {
  const mcpServers: Record<string, { transport: "http"; url: string; headers?: Record<string, string> }> = {};
  for (const { name, url, token } of servers) {
    if (token && !/^https:\/\//.test(url) && !/^http:\/\/(localhost|127\.0\.0\.1)(?=[:/]|$)/.test(url)) {
      throw new Error(`ห้ามส่ง token ผ่าน http ธรรมดาไปที่ ${name}`);
    }
    mcpServers[name] = token ? { transport: "http", url, headers: { Authorization: `Bearer ${token}` } } : { transport: "http", url };
  }
  return { mcpServers };
}

// แปลง error ของ adapter เป็นข้อความที่ผู้ใช้อ่านรู้เรื่อง ไม่เผย URL/รายละเอียดภายใน
function describeMcpError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("Authentication failed")) return "เซิร์ฟเวอร์ MCP ปฏิเสธการยืนยันตัวตน (ตรวจ token)";
  if (message.includes("ECONNREFUSED") || message.includes("fetch failed")) return "ต่อเซิร์ฟเวอร์ MCP ไม่ได้";
  return "เรียกเซิร์ฟเวอร์ MCP ไม่สำเร็จ";
}

// ส่วนที่ 1: เซิร์ฟเวอร์ MCP จริงผ่าน HTTP ในโปรเซสนี้ (ให้ไว้แล้ว) เปิด tool "add" หลังตรวจ Bearer ด้วย authenticate ของคุณ
const PORT = 2960;
const TOKEN = "demo-token-5-18";
const mcpUrl = `http://localhost:${PORT}/mcp`;
const handler = createMcpHandler(() => {
  const server = new McpServer({ name: "calc", version: "1.0.0" });
  server.registerTool(
    "add",
    { description: "บวกเลขสองจำนวน", inputSchema: z.object({ a: z.number(), b: z.number() }) },
    async ({ a, b }) => ({ content: [{ type: "text", text: String(a + b) }] }),
  );
  return server;
});
const httpServer: Server = createServer(async (req, res) => {
  const auth = authenticate(req.headers.authorization, { alice: TOKEN });
  const reply = async (response: Response) => {
    res.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) Readable.fromWeb(response.body as never).pipe(res);
    else res.end();
  };
  if (!auth.ok) return reply(unauthorizedResponse(auth.reason));
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const hasBody = !["GET", "HEAD"].includes(req.method ?? "GET");
  const request = new Request(`http://localhost${req.url}`, { method: req.method, headers: req.headers as Record<string, string>, body: hasBody ? Buffer.concat(chunks) : undefined });
  return reply(await handler.fetch(request));
});
await new Promise<void>((resolve) => httpServer.listen(PORT, resolve));

async function callAdd(token: string | undefined): Promise<{ tools: string[]; sum?: string; error?: string }> {
  const client = new MultiServerMCPClient(buildMcpConfig([{ name: "calc", url: mcpUrl, token }]) as never);
  try {
    const tools = await client.getTools();
    const add = tools.find((t) => t.name.endsWith("add"));
    return { tools: tools.map((t) => t.name), sum: String(await add?.invoke({ a: 2, b: 3 })) };
  } catch (error) {
    return { tools: [], error: describeMcpError(error) };
  } finally {
    await client.close();
  }
}
const right = await callAdd(TOKEN);
const wrong = await callAdd("wrong");
const missing = await callAdd(undefined);
httpServer.close();
console.log({ right, wrong, missing });

// ส่วนที่ 2: ตรวจแต่ละฟังก์ชันแยกกัน (ไม่เปิดพอร์ต)
const tokens = { alice: "tok-alice-1", bob: "tok-bob-2" };
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const throws = (fn: () => void): string => {
  try {
    fn();
    return "";
  } catch (e) {
    return (e as Error).message;
  }
};
const wrongAuth = authenticate("Bearer tok-alice-WRONG", tokens);
const unauth = unauthorizedResponse("token ไม่ถูกต้อง");
const unauthBody = await unauth.json();
const cfg = buildMcpConfig([{ name: "calc", url: "https://mcp.example.com/mcp", token: "t0k" }]);
const cfgNoToken = buildMcpConfig([{ name: "pub", url: "http://mcp.example.com/mcp" }]);
const multi = buildMcpConfig([
  { name: "a", url: "https://a.example.com/mcp", token: "ta" },
  { name: "b", url: "http://localhost:1/mcp" },
]);
let leakedToken = false;
try {
  buildMcpConfig([{ name: "remote", url: "http://x.com/mcp", token: "SECRET-TOKEN" }]);
} catch (e) {
  leakedToken = (e as Error).message.includes("SECRET-TOKEN");
}
const authErr = new Error('Authentication failed for HTTP server "calc" at http://internal-host:2960/mcp. Original error: SdkHttpError');












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("parseBearer: รับเฉพาะ 'Bearer <token>' (scheme ไม่สนตัวพิมพ์)", parseBearer("Bearer abc123") === "abc123" && parseBearer("bearer abc123") === "abc123" && parseBearer("  BEARER   abc123  ") === "abc123");
check("parseBearer: รูปแบบอื่นทั้งหมดเป็น null", [undefined, null, "", "Bearer", "Bearer ", "Basic abc", "abc123", "Bearer a b", "Bearerabc", "Token abc"].every((bad) => parseBearer(bad) === null));
check("safeEqual: เท่ากัน/ไม่เท่ากัน รวมความยาวต่างกันต้องไม่ throw", safeEqual("abc", "abc") && !safeEqual("abc", "abd") && !safeEqual("abc", "abcd") && safeEqual("", "") && safeEqual("ไทย", "ไทย") && !safeEqual("ไทย", "ไทอ"), "ทำ sha256 ก่อนเพื่อให้ความยาวเท่ากัน");
check("authenticate: token ถูก → ได้ชื่อผู้เรียก", same(authenticate("Bearer tok-alice-1", tokens), { ok: true, client: "alice" }) && same(authenticate("Bearer tok-bob-2", tokens), { ok: true, client: "bob" }));
check("authenticate: ไม่มี/ผิดรูป/ผิด token → ปฏิเสธ และเหตุผลไม่มี token ที่ส่งมา", same(authenticate(undefined, tokens), { ok: false, reason: "ไม่มี Bearer token" }) && same(authenticate("Basic x", tokens), { ok: false, reason: "ไม่มี Bearer token" }) && same(wrongAuth, { ok: false, reason: "token ไม่ถูกต้อง" }) && !JSON.stringify(wrongAuth).includes("WRONG"));
check("authenticate: token ที่เป็นแค่ส่วนหน้า/ส่วนหนึ่งของ token จริงไม่ผ่าน, ไม่มี token ในระบบก็ไม่ผ่าน", !authenticate("Bearer tok-alice", tokens).ok && !authenticate("Bearer tok-alice-1x", tokens).ok && !authenticate("Bearer anything", {}).ok);
check("authenticate: token ว่างในระบบไม่ทำให้ใครผ่านด้วยหัวว่าง", !authenticate("Bearer ", { guest: "" }).ok);
check("unauthorizedResponse: 401 + WWW-Authenticate + JSON ที่ไม่มีความลับ", unauth.status === 401 && unauth.headers.get("WWW-Authenticate") === 'Bearer realm="mcp"' && (unauth.headers.get("content-type") ?? "").includes("application/json") && same(unauthBody, { error: "unauthorized", reason: "token ไม่ถูกต้อง" }));
check("buildMcpConfig: transport http + หัว Authorization เมื่อมี token", same(cfg, { mcpServers: { calc: { transport: "http", url: "https://mcp.example.com/mcp", headers: { Authorization: "Bearer t0k" } } } }));
check("buildMcpConfig: ไม่มี token ก็ไม่มีคีย์ headers", same(cfgNoToken.mcpServers.pub, { transport: "http", url: "http://mcp.example.com/mcp" }) && !("headers" in cfgNoToken.mcpServers.pub));
check("buildMcpConfig: localhost ใช้ http พร้อม token ได้ (รวมไม่มีพอร์ต/พาธ)", ["http://localhost:2960/mcp", "http://127.0.0.1:2960/mcp", "http://localhost/mcp", "http://localhost", "http://127.0.0.1"].every((url) => throws(() => buildMcpConfig([{ name: "l", url, token: "t" }])) === ""));
check("buildMcpConfig: token ผ่าน http ธรรมดาไปนอกเครื่อง → ปฏิเสธ และข้อความไม่มี token", ["http://mcp.example.com/mcp", "http://localhost.evil.com/mcp", "http://10.0.0.5/mcp", "ftp://x/mcp", "http://127a0b0c1/mcp"].every((url) => throws(() => buildMcpConfig([{ name: "remote", url, token: "SECRET-TOKEN" }])) === "ห้ามส่ง token ผ่าน http ธรรมดาไปที่ remote") && !leakedToken);
check("buildMcpConfig: หลายเซิร์ฟเวอร์ในคำขอเดียว", same(Object.keys(multi.mcpServers), ["a", "b"]));
check("describeMcpError: ข้อความที่ผู้ใช้อ่านรู้เรื่อง ไม่เผยรายละเอียดภายใน", describeMcpError(authErr) === "เซิร์ฟเวอร์ MCP ปฏิเสธการยืนยันตัวตน (ตรวจ token)" && !describeMcpError(authErr).includes("internal-host") && describeMcpError(new Error("connect ECONNREFUSED ::1:2960")) === "ต่อเซิร์ฟเวอร์ MCP ไม่ได้" && describeMcpError(new TypeError("fetch failed")) === "ต่อเซิร์ฟเวอร์ MCP ไม่ได้" && describeMcpError(new Error("อื่น ๆ")) === "เรียกเซิร์ฟเวอร์ MCP ไม่สำเร็จ" && describeMcpError("string") === "เรียกเซิร์ฟเวอร์ MCP ไม่สำเร็จ");
check("เซิร์ฟเวอร์จริง: token ถูกได้ tool add และ 2+3 = 5", right.tools.some((t) => t.endsWith("add")) && right.sum === "5");
check("เซิร์ฟเวอร์จริง: token ผิดและไม่ส่ง token ถูกปฏิเสธด้วยข้อความที่อ่านรู้เรื่อง", wrong.error === "เซิร์ฟเวอร์ MCP ปฏิเสธการยืนยันตัวตน (ตรวจ token)" && missing.error === "เซิร์ฟเวอร์ MCP ปฏิเสธการยืนยันตัวตน (ตรวจ token)", "ดูข้อความดิบของ adapter ว่ามีคำว่า Authentication failed");

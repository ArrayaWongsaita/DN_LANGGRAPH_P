import { authenticate, parseBearer, safeEqual, unauthorizedResponse } from "./auth";
import { buildMcpConfig, describeMcpError } from "./client";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) ไม่เปิดพอร์ตและไม่ต่อเครือข่าย
test("parseBearer: รับเฉพาะ 'Bearer <token>' (scheme ไม่สนตัวพิมพ์)", () => {
  expect(parseBearer("Bearer abc123")).toBe("abc123");
  expect(parseBearer("bearer abc123")).toBe("abc123");
  expect(parseBearer("  BEARER   abc123  ")).toBe("abc123");
});

test("parseBearer: รูปแบบอื่นทั้งหมดเป็น null", () => {
  for (const bad of [undefined, null, "", "Bearer", "Bearer ", "Basic abc", "abc123", "Bearer a b", "Bearerabc", "Token abc"]) {
    expect(parseBearer(bad)).toBeNull();
  }
});

test("safeEqual: เท่ากัน/ไม่เท่ากัน รวมความยาวต่างกันต้องไม่ throw", () => {
  expect(safeEqual("abc", "abc")).toBe(true);
  expect(safeEqual("abc", "abd")).toBe(false);
  expect(safeEqual("abc", "abcd")).toBe(false);
  expect(safeEqual("", "")).toBe(true);
  expect(safeEqual("ไทย", "ไทย")).toBe(true);
  expect(safeEqual("ไทย", "ไทอ")).toBe(false);
});

const tokens = { alice: "tok-alice-1", bob: "tok-bob-2" };

test("authenticate: token ถูก → ได้ชื่อผู้เรียก", () => {
  expect(authenticate("Bearer tok-alice-1", tokens)).toEqual({ ok: true, client: "alice" });
  expect(authenticate("Bearer tok-bob-2", tokens)).toEqual({ ok: true, client: "bob" });
});

test("authenticate: ไม่มี/ผิดรูป/ผิด token → ปฏิเสธ และเหตุผลไม่มี token ที่ส่งมา", () => {
  expect(authenticate(undefined, tokens)).toEqual({ ok: false, reason: "ไม่มี Bearer token" });
  expect(authenticate("Basic x", tokens)).toEqual({ ok: false, reason: "ไม่มี Bearer token" });
  const wrong = authenticate("Bearer tok-alice-WRONG", tokens);
  expect(wrong).toEqual({ ok: false, reason: "token ไม่ถูกต้อง" });
  expect(JSON.stringify(wrong)).not.toContain("WRONG");
});

test("authenticate: token ที่เป็นแค่ส่วนหน้า/ส่วนหนึ่งของ token จริงไม่ผ่าน, ไม่มี token ในระบบก็ไม่ผ่าน", () => {
  expect(authenticate("Bearer tok-alice", tokens)).toMatchObject({ ok: false });
  expect(authenticate("Bearer tok-alice-1x", tokens)).toMatchObject({ ok: false });
  expect(authenticate("Bearer anything", {})).toMatchObject({ ok: false });
});

test("authenticate: token ว่างในระบบไม่ทำให้ใครผ่านด้วยหัวว่าง", () => {
  expect(authenticate("Bearer ", { guest: "" })).toMatchObject({ ok: false });
});

test("unauthorizedResponse: 401 + WWW-Authenticate + JSON ที่ไม่มีความลับ", async () => {
  const res = unauthorizedResponse("token ไม่ถูกต้อง");
  expect(res.status).toBe(401);
  expect(res.headers.get("WWW-Authenticate")).toBe('Bearer realm="mcp"');
  expect(res.headers.get("content-type")).toContain("application/json");
  expect(await res.json()).toEqual({ error: "unauthorized", reason: "token ไม่ถูกต้อง" });
});

test("buildMcpConfig: transport http + หัว Authorization เมื่อมี token", () => {
  const cfg = buildMcpConfig([{ name: "calc", url: "https://mcp.example.com/mcp", token: "t0k" }]);
  expect(cfg).toEqual({ mcpServers: { calc: { transport: "http", url: "https://mcp.example.com/mcp", headers: { Authorization: "Bearer t0k" } } } });
});

test("buildMcpConfig: ไม่มี token ก็ไม่มีคีย์ headers", () => {
  const cfg = buildMcpConfig([{ name: "pub", url: "http://mcp.example.com/mcp" }]);
  expect(cfg.mcpServers.pub).toEqual({ transport: "http", url: "http://mcp.example.com/mcp" });
  expect("headers" in cfg.mcpServers.pub).toBe(false);
});

test("buildMcpConfig: localhost ใช้ http พร้อม token ได้", () => {
  for (const url of ["http://localhost:2960/mcp", "http://127.0.0.1:2960/mcp", "http://localhost/mcp"]) {
    expect(() => buildMcpConfig([{ name: "l", url, token: "t" }])).not.toThrow();
  }
});

test("buildMcpConfig: token ผ่าน http ธรรมดาไปนอกเครื่อง → ปฏิเสธ และข้อความไม่มี token", () => {
  for (const url of ["http://mcp.example.com/mcp", "http://localhost.evil.com/mcp", "http://10.0.0.5/mcp", "ftp://x/mcp"]) {
    expect(() => buildMcpConfig([{ name: "remote", url, token: "SECRET-TOKEN" }])).toThrow("ห้ามส่ง token ผ่าน http ธรรมดาไปที่ remote");
  }
  try {
    buildMcpConfig([{ name: "remote", url: "http://x.com/mcp", token: "SECRET-TOKEN" }]);
  } catch (e) {
    expect((e as Error).message).not.toContain("SECRET-TOKEN");
  }
});

test("buildMcpConfig: หลายเซิร์ฟเวอร์ในคำขอเดียว", () => {
  const cfg = buildMcpConfig([
    { name: "a", url: "https://a.example.com/mcp", token: "ta" },
    { name: "b", url: "http://localhost:1/mcp" },
  ]);
  expect(Object.keys(cfg.mcpServers)).toEqual(["a", "b"]);
});

test("describeMcpError: ข้อความที่ผู้ใช้อ่านรู้เรื่อง ไม่เผยรายละเอียดภายใน", () => {
  const auth = new Error('Authentication failed for HTTP server "calc" at http://internal-host:2960/mcp. Original error: SdkHttpError');
  expect(describeMcpError(auth)).toBe("เซิร์ฟเวอร์ MCP ปฏิเสธการยืนยันตัวตน (ตรวจ token)");
  expect(describeMcpError(auth)).not.toContain("internal-host");
  expect(describeMcpError(new Error("connect ECONNREFUSED ::1:2960"))).toBe("ต่อเซิร์ฟเวอร์ MCP ไม่ได้");
  expect(describeMcpError(new TypeError("fetch failed"))).toBe("ต่อเซิร์ฟเวอร์ MCP ไม่ได้");
  expect(describeMcpError(new Error("อื่น ๆ"))).toBe("เรียกเซิร์ฟเวอร์ MCP ไม่สำเร็จ");
  expect(describeMcpError("string")).toBe("เรียกเซิร์ฟเวอร์ MCP ไม่สำเร็จ");
});

// ---- proposed kill tests (18) ----
import * as nodeCrypto from "node:crypto";
vi.mock("node:crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:crypto")>();
  return { ...actual, timingSafeEqual: vi.fn(actual.timingSafeEqual) };
});

test("[K18abc] safeEqual compares sha256 digests with timingSafeEqual; authenticate checks every token", () => {
  const spy = vi.mocked(nodeCrypto.timingSafeEqual);
  spy.mockClear();
  expect(safeEqual("abc", "abcd")).toBe(false);
  expect(spy).toHaveBeenCalledTimes(1); // no === and no length short-circuit
  expect((spy.mock.calls[0][0] as Buffer).length).toBe(32); // sha256 digest, not raw bytes
  spy.mockClear();
  const three = { alice: "tok-alice-1", bob: "tok-bob-2", carol: "tok-carol-3" };
  expect(authenticate("Bearer tok-alice-1", three)).toEqual({ ok: true, client: "alice" });
  expect(spy).toHaveBeenCalledTimes(3); // no early break on first match
});

test("[K18d] look-alike of 127.0.0.1 is not localhost", () => {
  expect(() => buildMcpConfig([{ name: "r", url: "http://127a0b0c1/mcp", token: "t" }])).toThrow();
});

test("[K18e] bare http://localhost / http://127.0.0.1 (no port, no path) are local", () => {
  for (const url of ["http://localhost", "http://127.0.0.1"]) {
    expect(() => buildMcpConfig([{ name: "l", url, token: "t" }])).not.toThrow();
  }
});

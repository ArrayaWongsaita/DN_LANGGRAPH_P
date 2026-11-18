import { type ChildProcess, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describeMcpError, makeClient } from "./client";

// เปิดเซิร์ฟเวอร์ MCP ผ่าน HTTP ชั่วคราว แล้วเรียกด้วย token ถูก/ผิด/ไม่ส่ง
const PORT = 2960;
const TOKEN = "demo-token-5-18";
const url = `http://localhost:${PORT}/mcp`;
const serverPath = fileURLToPath(new URL("./server.mts", import.meta.url));
const server: ChildProcess = spawn(process.execPath, ["--import", "tsx", serverPath], {
  stdio: "ignore",
  env: { ...process.env, MCP_PORT: String(PORT), MCP_DEMO_TOKEN: TOKEN },
});

try {
  for (let i = 0; ; i++) {
    try {
      await fetch(url);
      break;
    } catch {
      if (i > 30) throw new Error("เซิร์ฟเวอร์ไม่ขึ้น");
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  for (const [label, token] of [["token ถูก", TOKEN], ["token ผิด", "wrong"], ["ไม่ส่ง token", undefined]] as const) {
    const client = makeClient([{ name: "calc", url, token }]);
    try {
      const tools = await client.getTools();
      const add = tools.find((t) => t.name.endsWith("add"))!;
      console.log(`${label}: ได้ tool ${tools.map((t) => t.name).join(", ")} → 2+3 =`, await add.invoke({ a: 2, b: 3 }));
    } catch (error) {
      console.log(`${label}: ${describeMcpError(error)}`);
    } finally {
      await client.close();
    }
  }
  try {
    makeClient([{ name: "x", url: "http://mcp.example.com/mcp", token: "t" }]);
  } catch (error) {
    console.log("http ไปนอกเครื่องพร้อม token:", (error as Error).message);
  }
} finally {
  server.kill();
}

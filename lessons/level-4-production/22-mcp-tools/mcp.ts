import { fileURLToPath } from "node:url";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { HumanMessage } from "@langchain/core/messages";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createAgent } from "langchain";
import { todo } from "@src/todo";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-22
// MCP (Model Context Protocol): มาตรฐานให้โปรแกรมอื่นเปิด tool ให้ agent ใช้ เรารัน MCP server จำลองในเครื่อง (ไฟล์ server.mts ข้างบท ไม่ต้องแก้) แล้วดึง tool ของมันมาให้ agent
const SERVER_PATH = fileURLToPath(new URL("./server.mts", import.meta.url));

// 👉 ข้อ 1: สร้าง client ที่เปิด server เป็นโปรเซสลูก:
//        new MultiServerMCPClient({ mcpServers: { calc: { transport: "stdio", command: "node", args: ["--import", "tsx", SERVER_PATH] } } })
const client: MultiServerMCPClient = todo(1);

// นับว่ามีการปิด client กี่ครั้ง (ให้มาแล้ว)
let closes = 0;
const originalClose = client.close.bind(client);
client.close = async () => {
  closes++;
  return originalClose();
};

let toolNames: string[] = [];
let answer = "";
try {
  // 👉 ข้อ 2: ดึง tool ทั้งหมดจากเซิร์ฟเวอร์: await client.getTools() (ชื่อ tool จะมีคำนำหน้าเป็นชื่อเซิร์ฟเวอร์ เช่น calc_add)
  const tools: StructuredToolInterface[] = todo(2);
  const agent = createAgent({ model: llm, tools });
  const result = await agent.invoke({ messages: [new HumanMessage("ใช้ tool calc_add บวก 2 กับ 3 แล้วบอกผลลัพธ์")] });
  toolNames = tools.map((t) => t.name);
  answer = result.messages[result.messages.length - 1].text;
} finally {
  // 👉 ข้อ 3: ปิด client ทุกครั้งที่ใช้เสร็จ (ไม่งั้นโปรเซสลูกค้าง): await client.close()
  todo(3);
}
console.log({ toolNames, answer });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ดึง tool จากเซิร์ฟเวอร์ MCP: ชื่อมีคำนำหน้าเป็นชื่อเซิร์ฟเวอร์", JSON.stringify(toolNames) === '["calc_add"]', "ใช้ client.getTools()");
check("agent เรียก tool ของ MCP ได้จริง: ผลบวกคือ 5", answer.includes("5"));
check("ปิด client หลังใช้เสร็จ (ใน finally)", closes === 1, "เรียก client.close() ใน finally");

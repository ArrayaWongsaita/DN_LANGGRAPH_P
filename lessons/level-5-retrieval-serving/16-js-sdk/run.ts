import { Client } from "@langchain/langgraph-sdk";
import { type ClientLike, decide, describeError, pendingApproval, startOrder, streamUpdates } from "./chat";
import { startServer } from "./serverProcess.mts";

const PORT = 2956;
console.log("กำลังเปิดเซิร์ฟเวอร์ (ครั้งแรกอาจใช้เวลาสักครู่)...");
const stop = await startServer(PORT);
try {
  const client = new Client({ apiUrl: `http://localhost:${PORT}` }) as unknown as ClientLike;

  const started = await startOrder(client, "order", "หูฟัง");
  console.log("เริ่ม thread:", started.threadId, "\nรออนุมัติ:", started.pending);
  console.log("กู้คำถามที่ค้างจาก state:", await pendingApproval(client, started.threadId));
  console.log("ตัดสินใจ (อนุมัติ):", await decide(client, "order", started.threadId, true));
  console.log("หลังตัดสินใจ ยังมีคำถามค้างไหม:", await pendingApproval(client, started.threadId));

  console.log("\nสตรีมการอัปเดตของ thread ใหม่:");
  const second = await startOrder(client, "order", "แว่น");
  await decide(client, "order", second.threadId, false);
  const fresh = (await (client as unknown as Client).threads.create()).thread_id;
  for await (const u of streamUpdates(client, "order", fresh, { item: "หมวก" })) console.log(" ", JSON.stringify(u));

  try {
    await client.runs.wait(fresh, "ไม่มีจริง", { input: {} });
  } catch (error) {
    console.log("\nข้อผิดพลาดดิบ:", (error as Error).message.slice(0, 60), "\nข้อความถึงผู้ใช้:", describeError(error));
  }
} finally {
  stop();
}

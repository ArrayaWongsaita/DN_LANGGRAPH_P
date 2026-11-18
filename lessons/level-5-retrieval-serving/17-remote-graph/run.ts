import { MemorySaver } from "@langchain/langgraph";
import { RemoteGraph } from "@langchain/langgraph/remote";
import { type RemoteLike, buildGateway } from "./gateway";
import { startServer } from "./serverProcess.mts";

const PORT = 2957;
console.log("กำลังเปิดเซิร์ฟเวอร์ปลายทาง (ครั้งแรกอาจใช้เวลาสักครู่)...");
const stop = await startServer(PORT);
try {
  const remote = new RemoteGraph({ graphId: "demo", url: `http://localhost:${PORT}` }) as unknown as RemoteLike;
  const app = buildGateway(remote, new MemorySaver());
  const cfg = { configurable: { thread_id: `demo-${Date.now()}` } };

  for (const question of ["สวัสดี", "ถามอีกครั้งใน thread เดิม"]) {
    const r = await app.invoke({ question, secret: "ความลับของกราฟแม่" }, cfg);
    console.log(`ถาม: ${question}\n  ตอบ: ${r.answer} (source=${r.source})${r.error ? `\n  error: ${r.error.slice(0, 80)}` : ""}`);
  }
} finally {
  stop();
}

// ปลายทางไม่ขึ้น → ควรได้ fallback ไม่ใช่ล้มทั้งกราฟ
const dead = new RemoteGraph({ graphId: "demo", url: "http://localhost:1" }) as unknown as RemoteLike;
const r = await buildGateway(dead).invoke({ question: "ปลายทางล่ม" });
console.log("\nปลายทางล่ม →", r.answer, `(source=${r.source}, error=${r.error.slice(0, 50)})`);

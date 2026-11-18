import express from "express";
import { type Sink, sseHeaders, streamToSink } from "./sse";

export type MakeStream = (question: string, signal: AbortSignal) => AsyncIterable<{ type?: string }>;

// ส่วนที่ผูกกับ Express (ให้ไว้แล้ว ไม่ต้องแก้): GET /ask?q=...
export function createApp(makeStream: MakeStream) {
  const app = express();
  app.get("/ask", async (req, res) => {
    const question = typeof req.query.q === "string" ? req.query.q : "";
    if (!question) {
      res.status(400).json({ error: "ต้องมีพารามิเตอร์ q" });
      return;
    }
    const controller = new AbortController();
    // ผู้ใช้ปิดแท็บ/ตัดการเชื่อมต่อ → ยกเลิก (ทั้งท่อนี้และการรันกราฟที่ผูกกับ signal เดียวกัน)
    res.on("close", () => controller.abort());
    res.writeHead(200, sseHeaders());
    res.flushHeaders();
    await streamToSink(makeStream(question, controller.signal), res as unknown as Sink, controller.signal);
  });
  return app;
}

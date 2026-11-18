// บริการ HTTP ของผู้ช่วย (ให้ไว้แล้ว ไม่ต้องแก้): POST /ingest {docId, source, text}  และ POST /ask {question, thread_id}
import express from "express";
import { type KnowledgeBase, type buildAssistant, syncDoc } from "./assistant";

export function createApp(assistant: ReturnType<typeof buildAssistant>, kb: KnowledgeBase) {
  const app = express();
  app.use(express.json({ limit: "200kb" }));

  app.post("/ingest", async (req, res) => {
    const { docId, source, text } = req.body ?? {};
    if (![docId, source, text].every((v) => typeof v === "string" && v !== "")) {
      res.status(400).json({ error: "ต้องมี docId, source, text เป็นสตริง" });
      return;
    }
    res.json(await syncDoc(kb, { docId, source, text }));
  });

  app.post("/ask", async (req, res) => {
    const { question, thread_id } = req.body ?? {};
    if (typeof question !== "string" || typeof thread_id !== "string" || thread_id === "") {
      res.status(400).json({ error: "ต้องมี question และ thread_id เป็นสตริง" });
      return;
    }
    try {
      const out = await assistant.invoke({ question }, { configurable: { thread_id } });
      res.json({ status: out.status, reply: out.reply, sources: out.sources });
    } catch {
      res.status(500).json({ error: "ระบบขัดข้อง ลองใหม่ภายหลัง" }); // ไม่เผยรายละเอียดภายในให้ผู้เรียก
    }
  });
  return app;
}

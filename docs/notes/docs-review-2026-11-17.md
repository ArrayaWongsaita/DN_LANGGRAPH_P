# ผลตรวจเนื้อหาคอร์สเทียบเอกสารปัจจุบัน (2026-11-17)

แหล่งข้อมูล (อ่านตอน 2026-11-17):
- Index ของเอกสาร TypeScript: https://docs.langchain.com/_llms/agent-development-lifecycle/build/type-script.txt
- Interrupts: https://docs.langchain.com/oss/javascript/langgraph/interrupts
- Fault tolerance: https://docs.langchain.com/oss/javascript/langgraph/fault-tolerance.md
- Streaming: https://docs.langchain.com/oss/javascript/langgraph/streaming
- Prebuilt middleware: https://docs.langchain.com/oss/javascript/langchain/middleware/built-in.md
- Multi-agent: https://docs.langchain.com/oss/javascript/langchain/multi-agent/index.md
- Unit testing: https://docs.langchain.com/oss/javascript/langchain/test/unit-testing.md
- Overview: https://docs.langchain.com/oss/javascript/langgraph/overview
- ข่าว/changelog (บุคคลที่สาม ข้อมูลไม่สม่ำเสมอ ใช้เป็นแนวโน้มเท่านั้น): releasebot.io/updates/langchain-ai

เวอร์ชันที่คอร์สใช้ตรงกับล่าสุด: `pnpm outdated` พบว่า @langchain/* และ langchain ล่าสุดแล้ว (เก่ากว่าเฉพาะ typescript/vitest/@types/node ซึ่งไม่กระทบเนื้อหา)

## ที่เนื้อหาเดิมถูกต้อง (ตรวจแล้ว)
- StateSchema/MessagesValue/ReducedValue, interrupt + Command({resume}), กฎ "ห้าม try/catch ครอบ interrupt", "node รันใหม่ตั้งแต่ต้นตอน resume", payload ต้อง JSON-serializable
- stream modes values/updates/messages/custom, หลายโหมดคืน [mode, chunk], `subgraphs: true`
- middleware: ชื่อ export และ option (summarization trigger/keep, modelRetry onFailure="continue" เป็นค่าเริ่มต้น, modelCallLimit exitBehavior end เป็นค่าเริ่มต้น, toolCallLimit exitBehavior continue เป็นค่าเริ่มต้น, humanInTheLoop interruptOn)
- retryPolicy: maxAttempts นับครั้งแรกด้วย (ค่าเริ่มต้น 3)
- ไม่มีบทไหนใช้ interrupt ใน while loop (เอกสารเตือนไม่ให้ทำ)

## ที่ต้องแก้ในเนื้อหาเดิม
1. 3-06 README: รายการ HTTP status ที่ไม่ retry (เอกสาร: ข้าม 400-407 และ 409, retry 408 และ 5xx) และ `NodeTimeoutError` retry ได้
2. 3-27 README: บอกค่าเริ่มต้นของ exitBehavior ของสองตัวให้ชัด (model=end, tool=continue) และ `threadLimit`
3. เพิ่มหมายเหตุ: เอกสารทางการแนะนำ `fakeModel` (export จาก "langchain") สำหรับทดสอบ คอร์สนี้ใช้ fake ของตัวเอง (src/fakeToolLLM.ts) เพื่อสอนหลักการ

## ของใหม่ที่คอร์สยังไม่ครอบคลุม (ยืนยันว่าใช้ได้กับ 1.7.5 แล้ว ยกเว้นที่ระบุ)
- node `timeout` (runTimeout/idleTimeout), `isNodeTimeoutError`, `NodeTimeoutError` (ยืนยัน)
- node `errorHandler` + `Command` (saga/compensation), `NodeError` (ยืนยัน)
- `setNodeDefaults` (ยืนยัน)
- `interrupt(value, { responseSchema })` ตรวจ resume ด้วย zod (ยืนยัน: resume ผิดชนิดโยน ZodError)
- interrupt ขนาน: resume ด้วย map ตาม `id` (ยืนยัน), export `INTERRUPT`
- stream mode `tools`, tag `nostream`, `streamEvents(..., { version: "v3" })` (v3 ใช้ได้ คืน protocol event แบบ lifecycle ยังไม่ได้ศึกษารูปแบบทั้งหมด)
- ผลของ `fakeModel` (langchain): `.respond("text")` ด้วย string โยน error ในเวอร์ชันนี้ ต้องใช้ `new AIMessage(...)` (ยังไม่ศึกษาต่อ)
- multi-agent แบบทางการ: subagents (agent เป็น tool), handoffs, skills, router, custom workflow (เอกสารไม่กล่าวถึงไลบรารี supervisor/swarm)
- RAG, MCP, guardrails (PII middleware ฯลฯ), context engineering, evals, integration/unit testing, Studio, deploy, Deep Agents, Postgres checkpointer

# Level 4 (Modern and Production) Design

> สถานะ: ร่างออกแบบ รอผู้ใช้อนุมัติก่อนลงมือเขียนบท รูปแบบบทเหมือน Level 0-3 (README ไทย + starter มี `todo(N)` + checker ด้วยของปลอม + `solution/`, โฟลเดอร์ `lessons/level-4-production/NN-slug`, เรียก `pnpm test:lesson 4-NN`)

**ที่มา:** ผลตรวจเอกสารปัจจุบัน `docs/notes/docs-review-2026-11-17.md` (Level 0-3 ยังตรงกับเอกสาร แก้เล็กน้อยแล้ว; ช่องว่างคือฟีเจอร์ใหม่ + งานขึ้นระบบจริง)

**เป้าหมาย:** ผู้เรียนที่จบ Level 3 สร้างระบบ LLM ที่ทนทาน ปลอดภัย ทดสอบได้ และรู้ทางขึ้นใช้งานจริง

**Non-goals:** ไม่สอน frontend/Generative UI, ไม่สอน LangSmith เชิงลึก, ไม่บังคับใช้บริการเสียเงินหรือบัญชีภายนอก (ทุกบทต้องผ่านตัวตรวจโดยไม่ใช้ key/เครือข่าย)

## Approaches
- **A (แนะนำ): Level 4 เดียว ~26 บท เรียงตามคุณค่า** ผู้เรียนเลือกข้าม Part ได้ ต่อเนื่องกับ capstone
- B: แยกเป็น Level 4 (ฟีเจอร์ใหม่) และ Level 5 (production) เลขบทชัดกว่า แต่ทำให้คอร์สยาวและแต่ละ level สั้นเกิน
- C: เพิ่มเข้า Level 3 ต่อท้าย ต้องแก้คำว่า "จบคอร์ส" ของ 3-35 และสับสนเรื่องระดับความยาก

เลือก A เพราะตัวตรวจและรูปแบบบทเดิมใช้ต่อได้ทันที ไม่ต้องรื้อเลขบทเดิม

## รายการบท (ลำดับลงมือ = ลำดับในตาราง)

| Part | บท | เนื้อหา | สถานะการยืนยัน API |
|---|---|---|---|
| 12 ความทนทานแบบใหม่ | 4-01 node timeout (`runTimeout`/`idleTimeout`, `isNodeTimeoutError`) | ยืนยันใน 1.7.5 |
| | 4-02 `errorHandler` + `Command` (compensation แบบ saga) | ยืนยัน |
| | 4-03 `setNodeDefaults` + `runtime.executionInfo.nodeAttempt` | ยืนยันบางส่วน (nodeAttempt ยังไม่ spike) |
| | 4-04 `interrupt(..., { responseSchema })` ตรวจคำตอบมนุษย์ด้วย zod | ยืนยัน |
| | 4-05 interrupt ขนาน: resume ด้วย map ตาม id (`INTERRUPT`) | ยืนยัน |
| 13 RAG | 4-06 embeddings คืออะไร (ใช้ embedding ปลอมที่คำนวณได้แน่นอน, cosine similarity) | ต้อง spike |
| | 4-07 แบ่งข้อความ (text splitter) | ต้อง spike |
| | 4-08 vector store ในหน่วยความจำ + ค้นหา | ต้อง spike (แพ็กเกจ/ที่มาของ store) |
| | 4-09 retrieval เป็น tool ให้ agent ใช้ | ใช้ของเดิม |
| | 4-10 agentic RAG ด้วย graph (ให้คะแนนเอกสาร → เขียนคำถามใหม่ → ตอบ) | ใช้ของเดิม |
| | 4-11 ตอบพร้อมอ้างอิงแหล่งที่มา (structured output) | ใช้ของเดิม |
| 14 ทดสอบ | 4-12 unit test node เดี่ยว ๆ และ graph ด้วยของปลอม (ทำไมบทเรียนไม่ต้องใช้ key) | ใช้ของเดิม |
| | 4-13 `fakeModel` ทางการ (ต้องใช้ `new AIMessage(...)`; string เปล่าโยน error ใน 1.6.6) | ยืนยันบางส่วน |
| | 4-14 eval ง่าย ๆ: ชุดทดสอบ + ตัวตัดสินแบบ rule และ LLM-as-judge (judge ปลอมในตัวตรวจ) | ใช้ของเดิม |
| 15 multi-agent ทางการ | 4-15 subagents: agent เป็น tool ของ agent หลัก | ต้อง spike |
| | 4-16 skills: โหลด prompt/ความรู้ตามต้องการ | ต้อง spike |
| | 4-17 router: แยกงานขนานแล้วรวมผล | ใช้ `Send` เดิม |
| 16 ความปลอดภัยและ context | 4-18 `piiMiddleware` (redact/mask/block) | ต้อง spike |
| | 4-19 guardrail middleware ที่เขียนเอง (ดักอินพุต/เอาต์พุต) | ใช้ `createMiddleware` เดิม |
| | 4-20 prompt injection พื้นฐาน + จำกัดสิทธิ์ tool (allowlist) | ใช้ของเดิม |
| | 4-21 context engineering: `contextEditingMiddleware`, ตัด tool result เก่า | ต้อง spike |
| 17 เครื่องมือภายนอกและขึ้นระบบ | 4-22 MCP: เรียก tool จาก MCP server ท้องถิ่น (`@langchain/mcp-adapters`) | ต้อง spike + dependency ใหม่ |
| | 4-23 tool แบบ async generator + stream mode `tools` | ต้อง spike |
| | 4-24 Postgres checkpointer: เขียนโค้ดตามอินเทอร์เฟซ, ตัวตรวจใช้ MemorySaver แทน (ไม่ต้องมี Docker) | ต้องตัดสินใจ |
| | 4-25 รัน `langgraph dev` + Studio (บทอ่านและทำตามขั้นตอน ไม่มีตัวตรวจอัตโนมัติ; ต้องบัญชี LangSmith จึงเป็นทางเลือก) | ต้องตรวจเอกสารอีกรอบ |
| | 4-26 capstone: ผู้ช่วยค้นเอกสารที่ทดสอบได้ (RAG + guardrail + eval + checkpointer) | รวมของเดิม |

Deep Agents (แพ็กเกจ `deepagents`) เป็นภาคผนวกทางเลือก ไม่นับเป็นบทบังคับ: เสนอทำเป็น README อธิบายเมื่อไรควรใช้แทน `createAgent` เพราะเป็นไลบรารีระดับสูงที่กำลังเปลี่ยนเร็ว

## ข้อตัดสินใจที่ต้องการจากผู้ใช้
1. **RAG ใช้ embedding จริงหรือปลอม?** แนะนำ: ตัวตรวจใช้ embedding ปลอม (คำนวณจากตัวอักษร ให้ผลแน่นอน) เพราะ provider ที่ใช้ทดสอบอยู่ (Groq, OpenCode Go) ยังไม่ยืนยันว่ามี embeddings; ส่วน `run.ts` ใช้ embedding จริงเฉพาะเมื่อมี provider รองรับ
2. **บท 4-24 (Postgres) และ 4-25 (Studio)** ต้องการ Docker/บัญชีภายนอก แนะนำทำเป็น "บทอ่านและทำตาม" ไม่นับในตัวตรวจ หรือตัดทิ้งก็ได้
3. **MCP (4-22) เพิ่ม dependency ใหม่** (`@langchain/mcp-adapters`) ยอมรับไหม

## ความเสี่ยง
- เอกสารกับ API จริงอาจต่างกัน (เจอแล้ว 3 จุดในรอบนี้: `xray`, ค่าเริ่มต้นของ retry, `fakeModel.respond` กับ string) จึงกำหนดว่า **ทุกบทต้อง spike กับเวอร์ชันที่ติดตั้งก่อนเขียน README**
- Part 13 และ 17 พึ่งแพ็กเกจที่ยังไม่ได้ติดตั้งและไม่เคย spike ลำดับลงมือจึงให้ Part 12, 14, 15, 16 ก่อน (ใช้ของที่ติดตั้งแล้ว) ค่อยทำ 13 และ 17
- ปริมาณงานใหญ่ (26 บท) ควรทำทีละ Part พร้อม commit และรีวิวสั้น ๆ ต่อ Part

## ลำดับลงมือที่แนะนำ
Part 12 → 14 → 15 → 16 → 13 → 17 → capstone 4-26 แล้วอัปเดต README สถานะ

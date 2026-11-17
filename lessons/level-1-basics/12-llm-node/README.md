# บทที่ 12: node ที่เรียก LLM

## แนวคิด
ถึงตอนรวมของที่เรียนมา: **node ที่ข้างในเรียก LLM** ไม่มีอะไรพิเศษ เพราะ node ก็คือฟังก์ชัน และเราเรียก `llm.invoke(...)` ในฟังก์ชันได้ (ต้องเป็น `async` เพราะรอผล)

```
State { question }                          State { question, answer }
        │                                            ▲
        ▼                                            │
      node "ask":  reply = await llm.invoke(question)│
                   return { answer: reply.text } ────┘
```
สังเกตว่า graph ไม่รู้จัก LLM เจ้าไหนเลย เราส่ง `llm` เข้ามาตอนสร้าง graph (`buildAskGraph(llm)`) ตอนใช้จริงส่ง `getLLM()` ตอนตรวจงานส่ง LLM ปลอม

**ข้อควรระวัง:** ชื่อ node ห้ามซ้ำกับชื่อ field ใน State ถ้าตั้ง node ชื่อ `answer` ขณะที่ State มี field `answer` จะ error ว่า "already being used as a state attribute"

## ดูตัวอย่าง
`askGraph.ts`: `START → ask → END` โดย node `ask` อ่าน `question` จาก state และต้องเขียน `answer` กลับ

## โจทย์
เติม 2 ช่องใน node `ask` แล้วรัน:

    pnpm test:lesson 12

แล้วลองกับ LLM จริง `pnpm lesson 12`

## คุณทำได้แล้ว
- เขียน node ที่เรียก LLM และเขียนคำตอบลง state
- ส่ง LLM เข้ามาจากภายนอกเพื่อเปลี่ยนเจ้าได้ง่ายและทดสอบได้

## ข้อควรจำ
- node ที่เรียก LLM ต้องเป็น `async` และใช้ `await`
- คืนคำตอบด้วย `.text`
- อย่าตั้งชื่อ node ซ้ำกับ field ใน State

## บทถัดไป
บทที่ 13 จะต่อ LLM สองตัวเรียงกัน ให้ตัวที่สองใช้ผลของตัวแรก

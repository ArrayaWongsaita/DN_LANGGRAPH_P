# บทที่ 3-14: ย้อนเวลา (replay) และแตกเส้นเวลาใหม่ (fork)

## แนวคิด
เมื่อรู้ `config` ของ checkpoint ใด (จากบท 3-13) เราทำได้สองอย่าง:

**Replay (เล่นซ้ำ)** `invoke(null, config ของ checkpoint)` เริ่มจาก checkpoint นั้นแล้วรันต่อจนจบ (input เป็น `null` เพราะใช้ State ที่บันทึกไว้) node ก่อนจุดนั้นไม่รันซ้ำ

**Fork (แตกเส้นใหม่)** ก่อนเล่นซ้ำ **แก้ State ที่ checkpoint นั้น** ด้วย `updateState` มันสร้าง checkpoint ใหม่ (config ใหม่) แล้ว `invoke(null, config ใหม่)` เส้นเวลาเดิมไม่เปลี่ยน:

```ts
const forked = await graph.updateState(snapshot.config, { log: "X" }); // แก้ ณ ตอนนั้น
await graph.invoke(null, forked);                                      // รันต่อบนเส้นใหม่
```
ประโยชน์: ลอง "ถ้าตอนนั้นเลือกอีกทาง" โดยไม่ต้องเริ่มใหม่ และใช้แก้งานที่ผิดกลางทางของ agent

## ดูตัวอย่าง
`travel.ts` ใช้ graph `a → b → c` เดิม ขาดการ replay และ fork

## โจทย์
เติม 2 ข้อ แล้วรัน:

    pnpm test:lesson 3-14

## คุณทำได้แล้ว
- เล่นซ้ำและแตกเส้นเวลาใหม่จาก checkpoint

## ข้อควรจำ
- node หลังจุดที่ย้อนไปจะรันใหม่จริง ๆ (รวมผลข้างเคียงและการเรียก LLM)
- fork สร้างเส้นใหม่ ไม่ทำลายของเดิม

## บทถัดไป
บท 3-15: รูปแบบ workflow (prompt chaining, routing, parallelization, orchestrator-worker, evaluator-optimizer)

# บทที่ 3-14 ย้อนเวลา (replay) และแตกเส้นเวลาใหม่ (fork)

## แนวคิด

เมื่อรู้ `config` ของ checkpoint ใด (จากบท 3-13) เราทำได้สองอย่าง:

**Replay (เล่นซ้ำ)** `invoke(null, config ของ checkpoint)` เริ่มจาก checkpoint นั้นแล้วรันต่อจนจบ (input เป็น `null` เพราะใช้ State ที่บันทึกไว้) node ก่อนจุดนั้นไม่รันซ้ำ

**Fork (แตกเส้นใหม่)** ก่อนเล่นซ้ำ **แก้ State ที่ checkpoint นั้น** ด้วย `updateState` มันสร้าง checkpoint ใหม่ (config ใหม่) แล้ว `invoke(null, config ใหม่)` เส้นเวลาเดิมไม่เปลี่ยน:

```ts
const forked = await graph.updateState(snapshot.config, { log: "X" }); // แก้ ณ ตอนนั้น
await graph.invoke(null, forked);                                      // รันต่อบนเส้นใหม่
```
ประโยชน์: ลอง "ถ้าตอนนั้นเลือกอีกทาง" โดยไม่ต้องเริ่มใหม่ และใช้แก้งานที่ผิดกลางทางของ agent

## 1. ลองเติมช่องเดียว

เปิด [`travel.ts`](./travel.ts) แล้วเติมข้อ 1: fork: แก้ State ที่ checkpoint แล้วรันต่อเป็นเส้นเวลาใหม่ รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 3-14
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มี graph `a → b → c` ที่รันจบแล้วสอง thread และโค้ด replay (`invoke(null, config)`) ให้แล้ว ขาดแค่ขั้น fork ด้วย `updateState` แล้วรันต่อ

โค้ดตามแนวทาง:

```ts
const forked = await graph.updateState(beforeFork.config, { log: "X" });
const forkedResult = await graph.invoke(null, forked);
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
{ replayed: [ 'a', 'b', 'c' ], forked: [ 'a', 'X', 'b', 'c' ] }
✅ replay: node b และ c ทำงานซ้ำจากจุดเดิม ได้ log a,b,c
✅ fork: log มี X แทรกระหว่าง a กับ b
```

สิ่งที่ได้: เล่นซ้ำและแตกเส้นเวลาใหม่จาก checkpoint

## 3. ส่วนประกอบที่ใช้ในบทนี้

| การกระทำ | คำสั่ง | ผล |
|---|---|---|
| replay | `graph.invoke(null, checkpointConfig)` | รันต่อจาก checkpoint นั้นด้วย State เดิม node ก่อนหน้าจุดนั้นไม่รันซ้ำ |
| fork | `graph.updateState(checkpointConfig, { log: "X" })` | สร้าง checkpoint ใหม่ที่มีค่าที่แก้ แล้วคืน config ของเส้นใหม่ |
| รันเส้น fork | `graph.invoke(null, forked)` | รันต่อจากเส้นใหม่ ส่วนเส้นเดิมไม่ถูกทำลาย |

## ข้อควรจำ

- node หลังจุดที่ย้อนไปจะรันใหม่จริง ๆ (รวมผลข้างเคียงและการเรียก LLM)
- fork สร้างเส้นใหม่ ไม่ทำลายของเดิม

## ลองต่อใน playground

รัน `pnpm play 3-14` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `travel.ts`](./solution/travel.ts) · ไปต่อ [บท 3-15 prompt chaining (ต่อ prompt เป็นสายพาน)](../15-prompt-chaining/README.md)

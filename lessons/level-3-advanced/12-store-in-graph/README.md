# บทที่ 3-12 ใช้ Store ภายใน graph (จำข้าม thread)

## แนวคิด

เอา Store มาต่อกับ graph เพื่อให้ node อ่าน/เขียนความจำระยะยาวได้ ขั้นตอน:

1. ตอน `compile` ส่ง `store`: `compile({ checkpointer, store })`
2. node เข้าถึงผ่าน `runtime.store` (อาร์กิวเมนต์ที่สอง)
3. บอกว่าเป็นผู้ใช้คนไหนผ่าน **context** (บท 3-05): `{ context: { userId: "u1" } }`

ผลคือ **สอง thread ที่เป็นผู้ใช้คนเดียวกันใช้ความจำร่วมกันได้** ต่างจาก checkpointer ที่แยกตาม thread:

```
thread A: "จำชื่อ:มาลี"  → node เขียน ["profiles","u1"] name=มาลี
thread B (ใหม่เอี่ยม): "ฉันชื่ออะไร" → node อ่านเจอ มาลี
```

## 1. ลองเติมช่องเดียว

เปิด [`graphstore.ts`](./graphstore.ts) แล้วเติมข้อ 1: บันทึกชื่อผู้ใช้ด้วย `runtime.store!.put` ใน namespace ของผู้ใช้ รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 3-12
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มี graph ที่รับข้อความ "จำชื่อ:" หรือ "ฉันชื่ออะไร", การอ่านชื่อจาก store, และ `compile` ที่ส่ง `store` ให้แล้ว ขาดแค่ขั้นบันทึกชื่อ

โค้ดตามแนวทาง:

```ts
await runtime.store!.put(ns, "name", { name });
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
[ 'ยินดีที่รู้จัก มาลี', 'คุณชื่อ มาลี', 'ยังไม่รู้จักชื่อคุณ' ]
✅ จำชื่อแล้วตอบรับ
✅ ถามภายหลัง (คนละ invoke) ยังจำได้
✅ ผู้ใช้อีกคนไม่เห็นชื่อของมาลี
```

สิ่งที่ได้: ให้ graph จำข้ามบทสนทนาด้วย Store

## 3. ส่วนประกอบที่ใช้ในบทนี้

| ส่วน | ตัวอย่าง | ผล |
|---|---|---|
| `compile({ store })` | `builder.compile({ checkpointer, store })` | ให้ node เห็น store ผ่าน `runtime.store` |
| `runtime.store` | `await runtime.store!.put(ns, "name", { name })` | เขียนความจำที่ใช้ข้าม thread ได้ |
| context | `runtime.context.userId` | บอกว่าเป็นผู้ใช้คนไหน ใช้สร้าง namespace |

## ข้อควรจำ

- `runtime.store` อาจเป็น `undefined` ถ้าไม่ได้ส่ง `store` ตอน compile
- ความจำระยะยาว + ความจำใน thread ใช้ร่วมกันได้ ทำหน้าที่ต่างกัน

## ลองต่อใน playground

รัน `pnpm play 3-12` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `graphstore.ts`](./solution/graphstore.ts) · ไปต่อ [บท 3-13 ดูประวัติ checkpoint](../13-checkpoint-history/README.md)

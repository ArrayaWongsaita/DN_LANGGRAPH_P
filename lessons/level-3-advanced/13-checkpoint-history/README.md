# บทที่ 3-13 ดูประวัติ checkpoint

## แนวคิด

checkpointer ไม่ได้เก็บแค่ State ล่าสุด มันบันทึก **ภาพถ่าย (checkpoint) ทุก step** ของ thread เราย้อนดูได้ด้วย `getStateHistory`:

```ts
for await (const snapshot of graph.getStateHistory(config)) {
  snapshot.values   // State ณ ตอนนั้น
  snapshot.next     // node ที่จะรันต่อจากจุดนั้น ([] = จบ)
  snapshot.config   // config ที่ชี้ไปที่ checkpoint นี้ (เอาไปใช้ย้อนเวลาในบทหน้า)
}
```
รายการเรียงจาก **ใหม่ไปเก่า** (อันแรกคือสถานะล่าสุด อันสุดท้ายคือก่อนเริ่ม)

ใช้ทำอะไร: ตรวจว่า agent ตัดสินใจอย่างไรทีละขั้น (ดีบัก), ทำ audit, และเป็นฐานของการย้อนเวลา (บท 3-14)

## 1. ลองเติมช่องเดียว

เปิด [`history.ts`](./history.ts) แล้วเติมข้อ 1: ดึง snapshot ทั้งหมดของ thread ด้วย `getStateHistory` รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 3-13
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มี graph `a → b → c` ที่มี checkpointer และรันจบไปแล้วหนึ่งรอบ รวมทั้งโค้ดที่หา checkpoint ตามชื่อ node ถัดไปให้แล้ว ขาดแค่การวนอ่านประวัติเก็บลง `snapshots`

โค้ดตามแนวทาง:

```ts
for await (const s of graph.getStateHistory(config)) snapshots.push(s);
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
จำนวน snapshot: 5
ก่อนทำ b: [ 'a' ] next = [ 'b' ]
✅ มี snapshot หลายก้าว (อย่างน้อย 4)
✅ snapshot แรกคือล่าสุด (จบแล้ว ไม่มี node ถัดไป)
✅ หา checkpoint ก่อนทำ b ได้ และ State ตอนนั้นมีแค่ a
```

สิ่งที่ได้: อ่านประวัติทุก step ของ thread

## 3. ส่วนประกอบที่ใช้ในบทนี้

| ค่าใน snapshot | ชนิด | ความหมาย |
|---|---|---|
| `values` | State | State ณ checkpoint นั้น |
| `next` | อาร์เรย์ชื่อ node | node ที่จะรันต่อจากจุดนั้น (ไม่ใช่ขั้นที่เพิ่งทำ) |
| `config` | config ของ checkpoint | ใช้ย้อนเวลาในบท 3-14 |

## ข้อควรจำ

- ประวัติมาจาก checkpointer: ต้องมี checkpointer และ `thread_id`
- `next` บอก "ขั้นต่อไป" ไม่ใช่ขั้นที่เพิ่งทำ

## ลองต่อใน playground

รัน `pnpm play 3-13` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `history.ts`](./solution/history.ts) · ไปต่อ [บท 3-14 ย้อนเวลา (replay) และแตกเส้นเวลาใหม่ (fork)](../14-time-travel/README.md)

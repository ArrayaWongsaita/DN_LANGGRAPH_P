# บทที่ 3-22 subgraph กับ checkpointer และ interrupt

## แนวคิด

เมื่อ subgraph เป็น node ใน graph แม่ **checkpointer ของแม่ครอบคลุมข้างในด้วย** คุณไม่ต้องใส่ checkpointer ให้ subgraph:

- ใส่ checkpointer ที่ **graph แม่ตัวเดียว** ตอน `compile`
- ประวัติ, `getState`, `thread_id` ทำงานทั้งระบบ
- `interrupt` ที่อยู่ลึกใน subgraph ก็ **หยุดทั้งระบบ** และ `Command({ resume })` ที่ส่งเข้า graph แม่จะไปถึง subgraph เอง

```
แม่ (compile + MemorySaver)
 └ sub (ไม่ต้องมี checkpointer)
     └ ask: interrupt("ยืนยันไหม?")   ← หยุดตรงนี้ resume ผ่านแม่
```
(subgraph ยังตั้งความจำของตัวเองแยกได้ผ่านตัวเลือก checkpointer ตอน compile แต่กรณีส่วนใหญ่ใช้ของแม่ก็พอ และเรียบง่ายกว่า)

## 1. ลองเติมช่องเดียว

เปิด [`subcheck.ts`](./subcheck.ts) แล้วเติมข้อ 1: ตอบคำถามที่ค้างใน subgraph ด้วย `Command({ resume })` และ config เดิม รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 3-22
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มี subgraph `confirm` ที่ถามยืนยันด้วย `interrupt`, graph แม่ที่ใส่ `MemorySaver` ตอน `compile` และการรันรอบแรกจนหยุดรอแล้ว ขาดแค่การตอบเพื่อทำต่อ

โค้ดตามแนวทาง:

```ts
const finished = await app.invoke(new Command({ resume: "ใช่" }), config);
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
{ paused: true, log: 'เตรียม|ตอบ:ใช่' }
✅ interrupt ใน subgraph ทำให้ graph แม่หยุดรอ
✅ resume แล้วงานทั้งสองขั้นต่อกัน (เตรียม แล้ว ตอบ:ใช่)
```

สิ่งที่ได้: หยุดและทำต่อ (human-in-the-loop) ผ่าน subgraph

## 3. ส่วนประกอบที่ใช้ในบทนี้

| ส่วน | ตัวอย่าง | หน้าที่ |
|---|---|---|
| checkpointer ของแม่ | `builder.compile({ checkpointer: new MemorySaver() })` | ใส่ที่ graph แม่ตัวเดียว ครอบคลุม subgraph ด้วย |
| resume | `app.invoke(new Command({ resume: "ใช่" }), config)` | ตอบ `interrupt` ที่ค้างอยู่ลึกใน subgraph |
| `config` | `{ configurable: { thread_id } }` เดิม | ชี้ thread ที่หยุดรออยู่ |

## ข้อควรจำ

- ลืมใส่ checkpointer ที่แม่ = `interrupt` ใช้ไม่ได้
- ทุกอย่างของ thread (รวม subgraph) อยู่ใน checkpoint เดียวกัน

## ลองต่อใน playground

รัน `pnpm play 3-22` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `subcheck.ts`](./solution/subcheck.ts) · ไปต่อ [บท 3-23 handoff (ส่งต่อระหว่าง agent)](../23-handoff/README.md)

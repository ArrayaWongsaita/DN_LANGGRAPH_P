# บทที่ 3-07 cache policy (ไม่ทำซ้ำงานที่เคยทำแล้ว)

## แนวคิด

node ที่แพงหรือช้า (เรียก API, คำนวณหนัก) ที่ได้ **input เดิม → ผลเดิม** ไม่ควรทำซ้ำ ตั้ง **`cachePolicy`** ให้ node แล้วให้ตัวเก็บแคชตอน `compile`:

```ts
import { InMemoryCache } from "@langchain/langgraph-checkpoint";

new StateGraph(State)
  .addNode("expensive", fn, { cachePolicy: { ttl: 60 } })   // จำผลไว้ 60 วินาที
  ...
  .compile({ cache: new InMemoryCache() });
```
- กุญแจของแคชคือ **input ของ node** (State ที่ node ได้รับ) input เหมือนเดิม = ใช้ผลที่จำไว้ ไม่รัน node
- `ttl` = อายุของแคชเป็นวินาที (ไม่ใส่ = ไม่หมดอายุ)

## 1. ลองเติมช่องเดียว

เปิด [`cache.ts`](./cache.ts) แล้วเติมข้อ 1: ตั้ง `cachePolicy` ให้ node ด้วย `ttl` 60 วินาที รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 3-07
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มี node ที่นับจำนวนครั้งที่ถูกรันจริง และ `InMemoryCache` ที่ส่งให้ตอน `compile` แล้ว ขาดแค่ `cachePolicy` ที่ node

โค้ดตามแนวทาง:

```ts
{ cachePolicy: { ttl: 60 } },
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
{ first: 'hi!', second: 'hi!', runsAfterSame: 1, runsAfterOther: 2 }
✅ input เดิมสองครั้ง node รันแค่ครั้งเดียว
✅ ผลที่ได้จากแคชเหมือนผลจริง
✅ input ใหม่ต้องรันใหม่
```

สิ่งที่ได้: ลดงานซ้ำด้วยแคชของ node

## 3. ส่วนประกอบที่ใช้ในบทนี้

| ส่วน | ตัวอย่าง | หน้าที่ |
|---|---|---|
| `cachePolicy.ttl` | `60` | จำผลของ node ไว้กี่วินาที |
| `compile({ cache })` | `new InMemoryCache()` | ที่เก็บแคช ถ้าไม่ใส่ `cachePolicy` ก็ไม่มีผล |
| คีย์ของแคช | input ของ node | input เดิมได้ผลที่จำไว้ input ใหม่รัน node จริง |

## ข้อควรจำ

- cache เหมาะกับ node ที่ "บริสุทธิ์" (ผลขึ้นกับ input อย่างเดียว) อย่าแคช node ที่ผลเปลี่ยนตามเวลา/สุ่ม
- `InMemoryCache` หายเมื่อปิดโปรแกรม

## ลองต่อใน playground

รัน `pnpm play 3-07` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `cache.ts`](./solution/cache.ts) · ไปต่อ [บท 3-08 defer (รอทุกสายเสร็จก่อนค่อยรัน)](../08-defer/README.md)

# บทที่ 3-23 handoff (ส่งต่อระหว่าง agent)

## แนวคิด

ระบบ multi-agent คือหลาย agent ที่เชี่ยวชาญคนละเรื่องช่วยกันทำงาน กลไกพื้นฐานคือ **handoff**: agent ที่รับงานอยู่ตัดสินใจ "ส่งต่อ" ให้อีกคน ใน LangGraph ทำได้ด้วย `Command` (บท 3-02) ที่ `goto` ไปหาอีก agent:

```ts
return new Command({ update: { log: ... }, goto: "support" });
```
ถ้า agent แต่ละตัวเป็น **subgraph** (บท 3-21) และตัวที่อยู่ข้างในต้องการส่งไปหา agent พี่น้องในระดับแม่ ให้บอกว่า `goto` นี้เป็นของ **graph แม่**:

```ts
new Command({ update: {...}, goto: "support", graph: Command.PARENT })
```
และ node ที่เป็น subgraph ตัวนั้นต้องประกาศ `{ ends: ["support"] }`

## 1. ลองเติมช่องเดียว

เปิด [`handoff.ts`](./handoff.ts) แล้วเติมข้อ 1: คืน `Command` ที่ส่งต่อไป `support` โดยใช้ `graph: Command.PARENT` รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 3-23
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มี `sales` (subgraph), `support` และการประกอบ graph แม่ให้แล้ว ขาดแค่คำสั่งส่งต่อที่ `sales` คืนเมื่อลูกค้าพูดถึงปัญหา

โค้ดตามแนวทาง:

```ts
return new Command({ update: { log: `${state.log}sales→support;` }, goto: "support", graph: Command.PARENT });
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
{ broken: 'sales→support;support รับช่วง;', price: 'sales ตอบเอง;' }
✅ เรื่องของพัง: sales ส่งต่อ support
✅ เรื่องทั่วไป: sales ตอบเอง ไม่ส่งต่อ
```

สิ่งที่ได้: ส่งต่องานระหว่าง agent ด้วย `Command` และ `Command.PARENT`

## 3. ส่วนประกอบที่ใช้ในบทนี้

| ส่วนของ `Command` | ค่า | หน้าที่ |
|---|---|---|
| `update` | `{ log: ... }` | ส่งบริบทที่ agent ปลายทางต้องรู้ เพราะมันไม่เห็นความคิดของต้นทาง |
| `goto` | `"support"` | agent ที่จะรับช่วง |
| `graph` | `Command.PARENT` | `goto` ไปหา node ใน graph แม่ ไม่ใช่ใน subgraph ของตัวเอง |

## ข้อควรจำ

- ส่ง context ที่จำเป็นไปกับ handoff (ใน `update`) agent ปลายทางไม่เห็นความคิดของต้นทาง
- ออกแบบให้ handoff วนกลับไปมาไม่รู้จบไม่ได้ (บท 3-09)

## ลองต่อใน playground

รัน `pnpm play 3-23` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `handoff.ts`](./solution/handoff.ts) · ไปต่อ [บท 3-24 supervisor (หัวหน้าที่มอบงานให้ลูกทีม)](../24-supervisor/README.md)

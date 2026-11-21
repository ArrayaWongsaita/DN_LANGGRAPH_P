# บทที่ 3-02 Command เปลี่ยน State และเลือกทางไปพร้อมกัน

## แนวคิด

ที่ผ่านมาการ "เปลี่ยน State" (node คืน object) กับ "เลือกทางไปต่อ" (conditional edge) แยกกัน บางครั้งการตัดสินใจเส้นทางผูกกับงานที่ node เพิ่งทำ จึงสะดวกกว่าที่ node ทำทั้งสองอย่างด้วย **`Command`**:

```ts
return new Command({
  update: { log: "ตรวจแล้ว" },   // เปลี่ยน State (เหมือน return object)
  goto: "premium",               // ไปต่อที่ node ชื่อนี้
});
```
กติกา: ถ้า node ใช้ `goto` ต้องประกาศปลายทางที่เป็นไปได้ตอน `addNode` ด้วย `{ ends: ["premium", "basic"] }` เพื่อให้ LangGraph (และภาพกราฟ) รู้เส้นทางล่วงหน้า โดยไม่ต้องมี `addConditionalEdges`

## 1. ลองเติมช่องเดียว

เปิด [`goto.ts`](./goto.ts) แล้วเติมข้อ 1: คืน `Command` ที่ทั้งอัปเดต `log` และเลือก `goto` ตามยอดเงิน รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 3-02
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มี node `triage`, `premium`, `basic` และการประกาศปลายทาง `{ ends: ["premium", "basic"] }` ให้แล้ว ขาดแค่ตัว `Command` ที่ `triage` คืนออกมา

โค้ดตามแนวทาง:

```ts
return new Command({ update: { log: "triage" }, goto: state.amount >= 1000 ? "premium" : "basic" });
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
  big: 'triage>premium',
  small: 'triage>basic',
  edge: 'triage>premium'
✅ จำนวนมากไป premium
✅ จำนวนน้อยไป basic
✅ ขอบเขต 1000 พอดี ไป premium
✅ graph รู้ปลายทางของ triage (จาก ends)
```

สิ่งที่ได้: ใช้ `Command` ทำทั้ง update และ goto ใน node เดียว

## 3. ส่วนประกอบที่ใช้ในบทนี้

| ส่วนของ `Command` | ชนิด | หน้าที่ |
|---|---|---|
| `update` | ออบเจ็กต์ State เช่น `{ log: "triage" }` | เปลี่ยน State แบบเดียวกับ node ที่คืนออบเจ็กต์ |
| `goto` | ชื่อ node (สตริง) หรือรายการชื่อ | บอกว่าจะไป node ไหนต่อ |
| `{ ends: [...] }` ใน `addNode` | อาร์เรย์ชื่อ node | บอก graph ล่วงหน้าว่า node นี้อาจ `goto` ไปที่ไหน ใช้วาดเส้นในภาพ graph |

## ข้อควรจำ

- ใช้ `Command` เมื่อ node เป็นคนตัดสินใจเส้นทางเอง ใช้ conditional edge เมื่ออยากแยกตรรกะเส้นทางออกจากงาน
- `Command` ใช้ในงาน multi-agent (handoff) บ่อยมาก (บท 3-23)

## ลองต่อใน playground

รัน `pnpm play 3-02` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `goto.ts`](./solution/goto.ts) · ไปต่อ [บท 3-03 Send แตกงานออกเป็นหลายสาย (fan-out)](../03-send-fanout/README.md)

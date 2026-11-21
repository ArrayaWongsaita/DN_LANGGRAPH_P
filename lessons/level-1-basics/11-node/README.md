# บทที่ 1-11 ให้ Node คืนข้อมูลที่ต้องอัปเดต

ข้อความ `"   abc   "` มีช่องว่างติดมาจากการกรอกข้อมูล ให้ node แรกตัดช่องว่าง แล้วให้ node ถัดไปนับความยาวจากข้อความที่สะอาดแล้ว ทั้งสองขั้นอ่านและเขียน State ที่ประกาศแบบ [บท 1-10](../10-state/README.md)

## 1. ลองตัดช่องว่างก่อนนับ

เปิด [`textGraph.ts`](./textGraph.ts) แล้วเติมข้อ 1 ให้ `clean` คืนออบเจ็กต์ที่มีเฉพาะ `text` ซึ่งตัดช่องว่างหัวท้ายแล้ว รันจากโฟลเดอร์หลักของโปรเจกต์หลังติดตั้ง dependencies ด้วย `pnpm install` ตัวอย่างนี้ทำงานในเครื่องโดยไม่ต้องมี API key

```sh
pnpm lesson 1-11
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์ `TextState` คือชนิดของ State และ `app` คือ Graph ที่ต่อ `clean` ไปยัง `measure` ไว้ให้

```ts
function clean(state: TextState): Partial<TextState> {
  return { text: state.text.trim() };
}

const result = await app.invoke({ text: "   abc   " });
console.log(result);
```

```text
{ text: 'abc', length: 3 }
✅ clean คืนเฉพาะ text ที่ตัดช่องว่างรอบข้อความ
✅ State ที่ส่งเข้า clean ยังมีค่าเดิม
✅ measure ได้ข้อความที่ clean แล้ว
```

`clean` คืนค่าใหม่ให้ `text` แล้ว `measure` อ่าน `"abc"` จึงคืน `{ length: 3 }` State สุดท้ายมีผลจากทั้งสองขั้น

## 2. Node รับและคืนอะไร

| ค่า | ความหมายในตัวอย่าง |
|---|---|
| `state.text` | ข้อความชนิด `string` ที่รับมาตอนเรียก Graph |
| `state.length` | ตัวเลข ค่าเริ่มต้น `0` จนกว่า `measure` จะอัปเดต |
| `Partial<TextState>` | ออบเจ็กต์อัปเดตที่ระบุเฉพาะช่องที่ต้องเปลี่ยนได้ ช่องที่เว้นไว้เก็บค่าเดิม |

เมื่อเขียน node ให้คืนออบเจ็กต์อัปเดตใหม่ เพื่อให้ Graph นำผลไปรวมกับ State

## 3. เปลี่ยนวิธีตัดช่องว่าง

คัดลอกโค้ดก่อนส่วนตรวจคำตอบจาก [เฉลย `textGraph.ts`](./solution/textGraph.ts) ไปที่ [`playground.ts`](./playground.ts) เก็บ import ไว้ชุดเดียว เปลี่ยนเฉพาะนิพจน์ด้านขวาของ `text` ใน `clean` แล้วรัน `pnpm play 1-11` โดยยังส่ง `"   abc   "` เหมือนเดิม

| นิพจน์ใน `clean` | `result.text` | `result.length` |
|---|---|---|
| `state.text.trim()` | `"abc"` | `3` |
| `state.text.trimStart()` | `"abc   "` | `6` |

[บทถัดไป 1-12](../12-edges/README.md) จะต่อเส้นระหว่าง node เพื่อกำหนดลำดับที่ Graph ทำงาน

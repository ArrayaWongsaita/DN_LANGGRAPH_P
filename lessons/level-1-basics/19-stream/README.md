# บทที่ 1-19 อ่าน State ระหว่าง graph ทำงานด้วย `stream()`

`invoke()` จาก [บท 1-18](../18-compile-and-invoke/README.md) คืน State ตอนจบ เมื่ออยากรู้ว่าแต่ละ node ทำอะไร ให้ใช้ `stream()` แล้วเลือกว่าจะรับเฉพาะค่าที่เปลี่ยนหรือรับ State ทั้งก้อน

## 1. ลองอ่านผลของ `clean` และ `measure`

เปิด [`streamDemo.ts`](./streamDemo.ts) เติมข้อ 1 ให้เลือกโหมด `"updates"` แล้วรันโดยไม่ต้องมี API key ไฟล์ใช้ graph ตัดช่องว่างและวัดความยาวจาก [บท 1-11](../11-node/README.md)

```sh
pnpm lesson 1-19
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

```ts
const input = { text: "  abc  " };
const stream = await graph.stream(input, { streamMode: "updates" });

for await (const chunk of stream) {
  console.log(JSON.stringify(chunk));
}
```

ไฟล์รวมข้อมูลแต่ละโหมดเป็นอาร์เรย์เพื่อเทียบกันในบรรทัดเดียว

```text
updates [{"clean":{"text":"abc"}},{"measure":{"length":3}}]
values [{"text":"  abc  ","length":0},{"text":"abc","length":0},{"text":"abc","length":3}]
```

`updates` มีชื่อ node เป็นคีย์แล้วตามด้วยค่าที่ node นั้นคืน `values` เริ่มด้วย State ก่อน node ตัวแรก จากนั้นส่ง State เต็มหลังแต่ละก้าว

## 2. ค่า `streamMode` ที่ใช้ในบท

| ตัวเลือก | รูปแบบข้อมูลแต่ละชิ้น | เหมาะกับ |
|---|---|---|
| `"updates"` | `{ ชื่อNode: update }` | ดูว่า node ใดเพิ่งเปลี่ยนค่าอะไร |
| `"values"` | State เต็ม เช่น `{ text: "abc", length: 3 }` | แสดงภาพรวมของข้อมูลในทุกก้าว |

ใช้ `await graph.stream(input, options)` เพื่อเปิดสตรีม แล้วอ่านด้วย `for await...of` [เอกสาร LangGraph เรื่อง streaming](https://docs.langchain.com/oss/javascript/langgraph/streaming)

## 3. ใช้อินพุตเดียวกันแล้วเทียบวิธีอ่าน

| วิธีเรียก | จำนวนผลที่ได้กับ graph นี้ | ชิ้นสุดท้าย |
|---|---:|---|
| `await graph.invoke(input)` | 1 | `{ text: "abc", length: 3 }` |
| `streamMode: "updates"` | 2 | `{ measure: { length: 3 } }` |
| `streamMode: "values"` | 3 | `{ text: "abc", length: 3 }` |

คัดลอกโค้ดหลัง import จาก [เฉลย](./solution/streamDemo.ts) จนถึงก่อนส่วนตรวจ ลงใน [`playground.ts`](./playground.ts) ลองเปลี่ยนอินพุตเป็น `"  ab  "` แล้วรัน `pnpm play 1-19` เพื่อดูว่า State เริ่มต้น หน้าตาของ update และความยาวสุดท้ายเปลี่ยนอย่างไร

## บทถัดไป

[บท 1-20 ประกอบผู้ช่วยที่เลือกวิธีตอบตามข้อความ](../20-mini-assistant/README.md)

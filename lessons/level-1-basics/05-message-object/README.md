# บทที่ 1-05 อ่านข้อความและสถิติจาก `AIMessage`

หลังจากเรียกโมเดลใน [บท 1-03](../03-first-llm-call/README.md) เราอ่านคำตอบผ่าน `.text` แล้ว ลองเปิดออบเจ็กต์คำตอบที่มีข้อความสองบล็อกเพื่อดูว่า `.text` รวมข้อความอย่างไร และจำนวน token อยู่ตรงไหน

## 1. อ่าน `type` และ `text` จากคำตอบตัวอย่าง

เปิด [`messageObject.ts`](./messageObject.ts) เติมข้อ 1 ให้ `summary` เก็บ `reply.type` และ `reply.text` แล้วรันจากโฟลเดอร์หลักของโปรเจกต์ สคริปต์สร้าง `AIMessage` ไว้เองพร้อมสถิติตัวอย่าง จึงรันได้โดยไม่ใช้ API key

```sh
pnpm lesson 1-05
```

```ts
const reply = new AIMessage({
  content: [
    { type: "text", text: "สวัสดี " },
    { type: "text", text: "มาลี" },
  ],
  usage_metadata: { input_tokens: 8, output_tokens: 4, total_tokens: 12 },
});
const summary = { type: reply.type, text: reply.text };
```

ผลจากข้อความตัวอย่างเหมือนกันทุกครั้ง `content` คงสองบล็อกเดิมไว้ ส่วน `text` ต่อข้อความตามลำดับโดยใช้ช่องว่างที่อยู่ในบล็อกแรก

```text
summary { type: 'ai', text: 'สวัสดี มาลี' }
content [ { type: 'text', text: 'สวัสดี ' }, { type: 'text', text: 'มาลี' } ]
usage_metadata { input_tokens: 8, output_tokens: 4, total_tokens: 12 }
✅ อ่านชนิดข้อความได้ ai
✅ อ่านข้อความจากทั้งสองบล็อก
```

## 2. เลือกอ่านฟิลด์ตามข้อมูลที่ต้องการ

| ฟิลด์ | ใช้อ่านอะไร |
|---|---|
| `type` | ชนิดของข้อความ สำหรับ `AIMessage` คือ `"ai"` |
| `content` | เนื้อหาที่เก็บอยู่ เป็นข้อความหรืออาร์เรย์ของบล็อก เช่น บล็อกข้อความ |
| `text` | ส่วนที่เป็นข้อความล้วน ใช้แสดงคำตอบในแชต อาจเป็น `""` เมื่อไม่มีส่วนข้อความ |
| `usage_metadata` | สถิติ token ขาเข้า ขาออก และยอดรวม อาจเป็น `undefined` ถ้าโมเดลไม่ได้รายงาน |

## 3. เปลี่ยนรูปของ `content` แล้วเทียบ

ก่อนทดลอง ให้นำโค้ดจากเฉลยตั้งแต่หลัง import ถึงก่อนส่วนตรวจคำตอบไปใส่ใน `playground.ts`

ใน [playground](./playground.ts) ใช้ `new AIMessage` จากตัวอย่าง แล้วลองสลับ `content` ระหว่างอาร์เรย์เดิมกับ `"สวัสดี มาลี"` ทั้งสองแบบได้ `.text` เป็น `"สวัสดี มาลี"` ส่วน `.content` แสดงเป็นอาร์เรย์ในรอบแรกและข้อความในรอบหลัง ลองเว้น `usage_metadata` แล้วดูค่าที่พิมพ์ออกมาเป็น `undefined`

ดู [เฉลย `messageObject.ts`](./solution/messageObject.ts) และรัน playground ด้วย `pnpm play 1-05` แล้วไป [บท 1-06 จัดลำดับข้อความพร้อมประวัติ](../06-system-and-history/README.md)

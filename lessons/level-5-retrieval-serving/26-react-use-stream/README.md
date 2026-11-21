# บทที่ 5-26 (เสริม): ต่อ React กับ graph ด้วย useStream

## แนวคิด

บท 5-15 ถึง 5-25 คุณต่อเซิร์ฟเวอร์ อ่านสตรีม และเก็บสถานะ UI เอง หน้าเว็บจริงไม่ต้องทำทั้งหมดนั้นซ้ำ: `@langchain/langgraph-sdk/react` มี hook **`useStream`** ห่อไว้ให้

```tsx
const stream = useStream<{ item: string; note: string; result: string }>({
  apiUrl: "http://localhost:2024",
  assistantId: "order",
});

stream.submit({ item: "หูฟัง" });                                   // เริ่มงาน (สตรีมให้เอง)
stream.submit(undefined, { command: { resume: true } });            // ต่อจาก interrupt
stream.values      // state ล่าสุด     stream.isLoading   กำลังรันอยู่ไหม
stream.error       // ข้อผิดพลาด        stream.interrupt   ที่ graph หยุดรอ ({ value })
stream.stop()      // ยกเลิกการรัน     stream.messages    ข้อความ (กราฟแบบแชต)
```
ของที่ hook เก็บให้เทียบได้กับบทก่อนหน้า: `values` คือก้อน state ที่ reducer ของ 5-25 สร้าง, `interrupt` คือสิ่งที่ 5-16 กู้คืนจาก `getState`, `isLoading` คือสถานะรวมจาก lifecycle .
เฟรมเวิร์กอื่น (Vue, Svelte, Angular) มี hook ที่หน้าตาคล้ายกัน บทนี้ทำ React อย่างเดียว

## 1. ลองเติมช่องเดียว

เปิด [`chat.tsx`](./chat.tsx) แล้วเติมข้อ 1: เติมส่วนหลักของบท (เสริม: ต่อ React กับ graph ด้วย useStream) รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้เปิดเซิร์ฟเวอร์ `langgraph dev` ชั่วคราวเอง (ต้องติดตั้งตามที่ README เดิมของ Level 4-5 อธิบายไว้) บทนี้ไม่เรียกโมเดลจริง

```sh
pnpm lesson 5-26
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

`chat.tsx` มีฟอร์มสั่งของที่ต้องรออนุมัติ (graph "order" ใน `server/`) คอมโพเนนต์ `OrderForm` ที่ต่อ `useStream` ให้ไว้แล้ว ส่วนอื่นของบทนี้เขียนไว้ให้แล้ว ขาดแค่ข้อ 1

โค้ดตามแนวทาง:

```ts
return stream.submit({ item });
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
กำลังเปิดเซิร์ฟเวอร์ (ครั้งแรกอาจใช้เวลาสักครู่)...
  seen: [ 'พร้อม', 'รอคุณอนุมัติ' ],
  asked: 'อนุมัติ หูฟัง ไหม',
  finalStatus: 'เสร็จ: อนุมัติ หูฟัง'
✅ sendOrder: ส่ง { item } เข้า submit
✅ decide: ส่ง undefined กับ command.resume ตามคำตัดสิน
✅ questionOf: อ่านคำถามจาก interrupt และคืน undefined เมื่อไม่มี/ผิดรูป
✅ statusLabel: ข้อความสถานะตามลำดับความสำคัญ (error > รออนุมัติ > กำลังทำงาน > เสร็จ > พร้อม)
✅ เซิร์ฟเวอร์จริง: เริ่มที่ 'พร้อม' แล้วหยุดรออนุมัติพร้อมคำถามจาก graph
✅ เซิร์ฟเวอร์จริง: กดอนุมัติแล้ว graph เดินต่อจนเสร็จ
```

สิ่งที่ได้: ต่อ `useStream` เข้ากับ UI ที่ส่งงาน แสดงสถานะ และรับ/ตอบ interrupt ได้

## ข้อควรจำ

- ส่งคำตัดสินด้วย `submit(undefined, { command: { resume } })` ไม่ใช่ `submit` input ใหม่ (ไม่งั้นเริ่มงานใหม่แทนที่จะต่อของเดิม)
- `useStream` ใช้ได้เฉพาะในคอมโพเนนต์ React และ API ของมันเปลี่ยนตามเวอร์ชัน (บทนี้ตรวจกับ `@langchain/langgraph-sdk` 1.17)
- ตรรกะแปลง event เป็นสถานะ (5-25) ยังจำเป็นเมื่อคุณใช้เฟรมเวิร์กที่ไม่มี hook สำเร็จรูป

## ลองต่อใน playground

รัน `pnpm play 5-26` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `chat.tsx`](./solution/chat.tsx)

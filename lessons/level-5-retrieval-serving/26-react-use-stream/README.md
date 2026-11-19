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

## ดูตัวอย่าง
`chat.tsx` มีฟอร์มสั่งของที่ต้องรออนุมัติ (graph "order" ใน `server/`) คอมโพเนนต์ `OrderForm` ที่ต่อ `useStream` ให้ไว้แล้ว ขาด 4 ฟังก์ชันที่มันเรียก: ส่งงาน, อ่านคำถามจาก interrupt, ส่งคำตัดสิน และข้อความสถานะ

สคริปต์ไม่ต้องใช้เบราว์เซอร์: เรนเดอร์คอมโพเนนต์ใน **jsdom** (DOM จำลองใน Node) แล้วใช้ React Testing Library กดปุ่มกับเซิร์ฟเวอร์ `langgraph dev` ที่สคริปต์เปิดเอง ไม่ใช้ LLM

## โจทย์
เติม 4 ข้อ แล้วรัน:

    pnpm lesson 5-26

สคริปต์จะพิมพ์ผล แล้วท้ายไฟล์มีส่วนตรวจที่แสดง ✅/❌ (ไม่ต้องแก้และไม่ต้องอ่านก็ได้)

## คุณทำได้แล้ว
- ต่อ `useStream` เข้ากับ UI ที่ส่งงาน แสดงสถานะ และรับ/ตอบ interrupt ได้

## ข้อควรจำ
- ส่งคำตัดสินด้วย `submit(undefined, { command: { resume } })` ไม่ใช่ `submit` input ใหม่ (ไม่งั้นเริ่มงานใหม่แทนที่จะต่อของเดิม)
- `useStream` ใช้ได้เฉพาะในคอมโพเนนต์ React และ API ของมันเปลี่ยนตามเวอร์ชัน (บทนี้ตรวจกับ `@langchain/langgraph-sdk` 1.17)
- ตรรกะแปลง event เป็นสถานะ (5-25) ยังจำเป็นเมื่อคุณใช้เฟรมเวิร์กที่ไม่มี hook สำเร็จรูป

## บทถัดไป
จบคอร์สแล้ว บทเสริมที่เลื่อนไว้: router ด้วยโมเดลเล็ก (Jev)

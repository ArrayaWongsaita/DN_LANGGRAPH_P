# บทที่ 3-02: Command เปลี่ยน State และเลือกทางไปพร้อมกัน

## แนวคิด
ที่ผ่านมาการ "เปลี่ยน State" (node คืน object) กับ "เลือกทางไปต่อ" (conditional edge) แยกกัน บางครั้งการตัดสินใจเส้นทางผูกกับงานที่ node เพิ่งทำ จึงสะดวกกว่าที่ node ทำทั้งสองอย่างด้วย **`Command`**:

```ts
return new Command({
  update: { log: "ตรวจแล้ว" },   // เปลี่ยน State (เหมือน return object)
  goto: "premium",               // ไปต่อที่ node ชื่อนี้
});
```
กติกา: ถ้า node ใช้ `goto` ต้องประกาศปลายทางที่เป็นไปได้ตอน `addNode` ด้วย `{ ends: ["premium", "basic"] }` เพื่อให้ LangGraph (และภาพกราฟ) รู้เส้นทางล่วงหน้า โดยไม่ต้องมี `addConditionalEdges`

## ดูตัวอย่าง
`goto.ts` มี node `triage` ที่ดูยอดเงินแล้วต้องส่งต่อไป `premium` หรือ `basic` พร้อมจดบันทึก ขาดตัว `Command` และการประกาศ `ends`

## โจทย์
เติม 2 ข้อ แล้วรัน:

    pnpm test:lesson 3-02

## คุณทำได้แล้ว
- ใช้ `Command` ทำทั้ง update และ goto ใน node เดียว

## ข้อควรจำ
- ใช้ `Command` เมื่อ node เป็นคนตัดสินใจเส้นทางเอง ใช้ conditional edge เมื่ออยากแยกตรรกะเส้นทางออกจากงาน
- `Command` ใช้ในงาน multi-agent (handoff) บ่อยมาก (บท 3-23)

## บทถัดไป
บท 3-03: `Send` แตกงานออกเป็นหลายสาย

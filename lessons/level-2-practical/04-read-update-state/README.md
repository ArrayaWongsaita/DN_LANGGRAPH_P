# บทที่ 2-04: อ่านและแก้ไข State ของ thread

## แนวคิด
checkpointer เก็บ State ไว้ เราจึง **ดูย้อนหลัง** และ **แก้ไข** ได้จากนอก graph:

```ts
const snapshot = await graph.getState(config);
snapshot.values.messages   // ข้อความทั้งหมดของ thread นี้
snapshot.next              // node ที่จะทำต่อ ([] = จบแล้ว)

await graph.updateState(config, { messages: [...] }); // เขียน update เหมือน node หนึ่งตัวเขียน
```
`updateState` ผ่าน reducer เหมือนเดิม ดังนั้นการ "ลบข้อความ" ทำได้ด้วย `RemoveMessage` ที่ระบุ `id` ของข้อความที่จะลบ:

```ts
new RemoveMessage({ id: message.id })
```
ข้อความที่อยู่ใน State มี `id` ให้ทุกข้อความ

## ดูตัวอย่าง
`state.ts` มี graph แชตที่มีความจำให้แล้ว และคุยกันไปสองรอบ ที่ขาดคือ อ่านประวัติจาก State และลบข้อความแรกสุดออก

## โจทย์
เติม 2 ข้อ (ค้นหา `// 👉 ข้อ N` ในไฟล์) แล้วรัน:

    pnpm lesson 2-04

สคริปต์จะพิมพ์ผล แล้วท้ายไฟล์มีส่วนตรวจที่แสดง ✅/❌ (ไม่ต้องแก้และไม่ต้องอ่านก็ได้)

## คุณทำได้แล้ว
- อ่าน State ของ thread ด้วย `getState`
- แก้ไข/ลบข้อความด้วย `updateState` + `RemoveMessage`

## ข้อควรจำ
- `getState` คืน snapshot ไม่ใช่ค่าโดยตรง ค่าอยู่ที่ `.values`
- thread ที่ยังไม่เคยมีข้อความ `.values.messages` เป็น `undefined` ไม่ใช่ `[]` ให้จัดการเอง
- `updateState` ใช้ reducer เดียวกับ node: ส่งข้อความใหม่ = ต่อท้าย, ส่ง `RemoveMessage` = ลบ

## บทถัดไป
บท 2-05: ตัดประวัติให้สั้นก่อนส่งให้ LLM

# บทที่ 1-10 กำหนดข้อมูลของ Graph ด้วย `StateSchema`

มาลีกรอกแค่ชื่อในโปรไฟล์ แต่ขั้นตอนถัดไปต้องอ่านอายุและเมืองได้ด้วย บทนี้ใช้ Zod ที่พบใน [บท 1-09](../09-structured-output/README.md) เพื่อกำหนดชนิดข้อมูลและค่าเริ่มต้นของ State ซึ่งเป็นข้อมูลที่แต่ละ node อ่านและอัปเดตได้

## 1. ส่งแค่ชื่อให้ Graph

เปิด [`profile.ts`](./profile.ts) แล้วเติมข้อ 1 ให้ `age` เป็นตัวเลขที่มีค่าเริ่มต้น `0` ติดตั้ง dependencies ด้วย `pnpm install` ก่อน แล้วรันจากโฟลเดอร์หลักของโปรเจกต์ ตัวอย่างนี้รันในเครื่องได้โดยไม่ต้องมี API key

```sh
pnpm lesson 1-10
```

โค้ดส่วนหลักใช้ `StateSchema` และ `z` ที่ไฟล์ import มาให้ ส่วน `app` คือ Graph ที่สร้างจาก `ProfileState` ภายในไฟล์เดียวกัน

```ts
const ProfileState = new StateSchema({
  name: z.string(),
  age: z.number().default(0),
  city: z.string().default(""),
});

console.log(await app.invoke({ name: "มาลี" }));
console.log(await app.invoke({ name: "มาลี", age: 30, city: "เชียงใหม่" }));
```

```text
{ name: 'มาลี', age: 0, city: '' }
{ name: 'มาลี', age: 30, city: 'เชียงใหม่' }
✅ เมื่อส่งแค่ชื่อ age เป็น 0 และ city เป็นสตริงว่าง
✅ เมื่อส่งอายุและเมือง graph ใช้ค่าที่ส่งมา
✅ graph ปฏิเสธ age ที่เป็นข้อความ
```

เมื่อส่งแค่ชื่อ Graph เติม `age` และ `city` ตาม schema เมื่อส่งค่ามาครบ Graph ใช้ค่าจาก input

## 2. ค่าที่ส่งเข้า State ได้

| ช่อง | ชนิด | เมื่อเว้นไว้ |
|---|---|---|
| `name` | `string` | ต้องส่งค่า เพราะช่องนี้ไม่มีค่าเริ่มต้น |
| `age` | `number` | ได้ `0` |
| `city` | `string` | ได้ `""` |

ค่าเริ่มต้นทำงานเมื่อเว้นช่องนั้นหรือส่ง `undefined` ถ้าส่ง `age: "สามสิบ"` ค่าจะผิดชนิดและ Graph จะโยน error

## 3. เปลี่ยนค่าเริ่มต้นแล้วรัน input เดิม

คัดลอกโค้ดก่อนส่วนตรวจคำตอบจาก [เฉลย `profile.ts`](./solution/profile.ts) ไปที่ [`playground.ts`](./playground.ts) เก็บ import ไว้ชุดเดียวแล้วรัน `pnpm play 1-10` ผลในตารางมาจาก `app.invoke({ name: "มาลี" })` ครั้งแรก

| ค่าใน schema ของ `age` | `age` ที่ได้ |
|---|---|
| `z.number().default(0)` | `0` |
| `z.number().default(18)` | `18` |

[บทถัดไป 1-11](../11-node/README.md) จะให้ node อ่าน State แล้วคืนเฉพาะข้อมูลที่ต้องอัปเดต

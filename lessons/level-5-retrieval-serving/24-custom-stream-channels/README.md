# บทที่ 5-24: Custom stream channel (ส่งข้อมูลเฉพาะแอปไปให้ฝั่ง UI)

## แนวคิด
บท 5-07 และ 5-08 อ่าน event มาตรฐานของ `streamEvents` v3 (`lifecycle`, `tasks`, `values` ฯลฯ) แต่ UI มักต้องการข้อมูล **เฉพาะแอป** เช่น "node ไหนกำลังรัน/เสร็จ/พัง" หรือ "ปิดบังข้อมูลส่วนตัวไปกี่จุด" แทนที่จะให้ทุก client แกะ event ดิบเอง เราให้ **ฝั่ง server แปลงครั้งเดียว** ด้วย **stream transformer** แล้วเผยแพร่เป็น channel ชื่อของเรา

```ts
const channel = StreamChannel.remote<NodeStatus>("node-status");
const graph = builder.compile({
  transformers: [() => ({
    init: () => ({ nodeStatus: channel }),     // ลงทะเบียน channel (ชื่อ remote ถูกต่อเข้ากับสตรีมให้เอง)
    process(event) { /* ดู event ทุกตัว */ channel.push(status); return true; }, // true = ให้ event เดิมไหลต่อ
  })],
});
```
ผลที่สังเกตได้จากการรันจริง:
- option ชื่อ `transformers` ของ `compile` (ถ้าใส่ผิดชื่อ จะไม่มี error และ channel ไม่ทำงาน)
- ตัวที่ได้เป็น event เพิ่มในสตรีม ชื่อ method `custom:<ชื่อ channel>` เช่น `custom:node-status` ข้อมูลอยู่ที่ `params.data`
- transformer **สร้างใหม่ต่อการรันหนึ่งครั้ง** (เป็น factory `() => ...`) จึงเก็บสถานะต่อรอบไว้ใน closure ได้
- `StreamChannel.local()` (ไม่ต้องตั้งชื่อ) ใช้ในโปรเซสเท่านั้น ไม่ถูกส่งไปที่ client
- ต้องใช้ `@langchain/langgraph` ≥ 1.3.1

เรื่องที่ต้องระวังจากของจริง: event `tasks` บอกแค่ "เริ่ม" (มี `input`) และ "จบ" (มี `result`) เมื่อ node ล้ม **บางกรณีไม่มี event `tasks` ที่มี `error`** (เช่น node ที่สองเป็นต้นไป) มีแค่ `lifecycle` `failed` ของทั้ง graph (พร้อมข้อความ error) ดังนั้น transformer ต้องจำว่า node ไหนกำลังรันอยู่ แล้วทำเครื่องหมาย error ให้ node เหล่านั้นเมื่อเห็น `failed`

ฝั่ง client (บท 5-25) ในเฟรมเวิร์กต่าง ๆ มี `useExtension(stream, "node-status")` สำหรับค่าล่าสุด และ `useChannel(stream, ["custom:node-status"])` สำหรับประวัติ (แพ็กเกจ UI เหล่านั้นเป็นของ React/Vue/Svelte/Angular คอร์สนี้ไม่รัน แต่หลักการเดียวกัน)

## ดูตัวอย่าง
`channels.ts` ขาด 5 ส่วน: แปลง event เป็นสถานะ, transformer, ประกอบ graph, เก็บสถานะจากสตรีม, และสรุปสถานะล่าสุดต่อ node

## โจทย์
เติม 5 ข้อ แล้วรัน:

    pnpm test:lesson 5-24

ดูของจริง:

    pnpm lesson 5-24

## คุณทำได้แล้ว
- สร้าง channel ของตัวเองบนสตรีมของ graph พร้อมจัดการกรณี node ล้ม

## ข้อควรจำ
- ตัวแปลงต้องไม่ throw (ถ้าล้ม สตรีมทั้งเส้นล้มไปด้วย) event ที่ไม่รู้จักให้ปล่อยผ่าน
- อย่าใส่ข้อมูลลับใน channel (client เห็นทั้งหมด) ข้อความ error ควรผ่านการกรองก่อนส่งออกนอกระบบ (บท 5-16)
- ชื่อ channel เป็นสัญญากับ client เปลี่ยนแล้ว UI พัง

## บทถัดไป
บท 5-25: จัดการสถานะ UI จากสตรีม (ส่วนที่ไม่ผูกกับเฟรมเวิร์ก)

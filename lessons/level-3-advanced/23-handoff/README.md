# บทที่ 3-23: handoff (ส่งต่อระหว่าง agent)

## แนวคิด
ระบบ multi-agent คือหลาย agent ที่เชี่ยวชาญคนละเรื่องช่วยกันทำงาน กลไกพื้นฐานคือ **handoff**: agent ที่รับงานอยู่ตัดสินใจ "ส่งต่อ" ให้อีกคน ใน LangGraph ทำได้ด้วย `Command` (บท 3-02) ที่ `goto` ไปหาอีก agent:

```ts
return new Command({ update: { log: ... }, goto: "support" });
```
ถ้า agent แต่ละตัวเป็น **subgraph** (บท 3-21) และตัวที่อยู่ข้างในต้องการส่งไปหา agent พี่น้องในระดับแม่ ให้บอกว่า `goto` นี้เป็นของ **graph แม่**:

```ts
new Command({ update: {...}, goto: "support", graph: Command.PARENT })
```
และ node ที่เป็น subgraph ตัวนั้นต้องประกาศ `{ ends: ["support"] }`

## ดูตัวอย่าง
`handoff.ts` มี agent สองตัว: `sales` (subgraph) กับ `support` เมื่อลูกค้าพูดถึงปัญหา (คำว่า "พัง") sales ต้องส่งต่อให้ support

## โจทย์
เติม 2 ข้อ แล้วรัน:

    pnpm test:lesson 3-23

## คุณทำได้แล้ว
- ส่งต่องานระหว่าง agent ด้วย `Command` และ `Command.PARENT`

## ข้อควรจำ
- ส่ง context ที่จำเป็นไปกับ handoff (ใน `update`) agent ปลายทางไม่เห็นความคิดของต้นทาง
- ออกแบบให้ handoff วนกลับไปมาไม่รู้จบไม่ได้ (บท 3-09)

## บทถัดไป
บท 3-24: supervisor

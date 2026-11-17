# บทที่ 2-02: checkpointer ทำให้ graph "จำ"

## แนวคิด
บท 2-01 graph ลืมทุกอย่างหลังจบแต่ละ `invoke` ถ้าอยากให้จำข้ามรอบต้องมีที่เก็บ State ไว้ระหว่างการเรียก ที่เก็บนี้เรียกว่า **checkpointer** มันบันทึก State ทุกครั้งที่จบ step

ตัวที่ง่ายที่สุดคือ `MemorySaver` เก็บไว้ใน RAM (หายเมื่อปิดโปรแกรม บท 2-07 จะสอนตัวที่เก็บลงไฟล์):

```ts
const graph = builder.compile({ checkpointer: new MemorySaver() });
```
แต่ทุกครั้งที่ `invoke` ต้องบอกว่า "เก็บ/อ่านที่ช่องไหน" ผ่าน config ที่มี `thread_id`:

```ts
await graph.invoke(input, { configurable: { thread_id: "บทสนทนา-1" } });
```
ข้อความใหม่จะถูกต่อท้ายประวัติของ thread นั้น ข้อความตอบกลับเลยรวมประวัติเก่าอัตโนมัติ (รายละเอียดของ `thread_id` อยู่บท 2-03 ในบทนี้ใช้ค่าคงที่ให้ก่อน)

## ดูตัวอย่าง
`memory.ts` มี `chat` ที่ส่ง `thread_id` คงที่ให้แล้ว สิ่งที่ขาดคือการ "ติด" checkpointer ให้ graph

## โจทย์
เติม 1 ข้อ แล้วรัน:

    pnpm test:lesson 2-02

## คุณทำได้แล้ว
- เพิ่มความจำให้ graph ด้วย `MemorySaver`

## ข้อควรจำ
- ไม่มี checkpointer = ไม่จำ; มี checkpointer แต่ไม่ส่ง `thread_id` = error
- `MemorySaver` เหมาะกับทดลอง ไม่ใช่งานจริง (หายเมื่อปิดโปรแกรม)

## บทถัดไป
บท 2-03: `thread_id` แยกบทสนทนาของแต่ละคน

# บทที่ 5-10 ดูแลตาราง checkpoint บน Postgres (ลบของเก่า)

## แนวคิด

checkpointer เก็บ checkpoint **ทุกขั้นของทุกรอบ** ไม่ลบเอง: threads ที่คุยกันนาน ๆ จะบวมขึ้นเรื่อย ๆ (บท 4-24 ใช้ `PostgresSaver` แล้ว) ไลบรารีมีแค่ `deleteThread(threadId)` ลบทั้ง thread ไม่มีตัวลบ "เก็บ N อันล่าสุด" ให้ จึงต้องเขียนเอง และต้องระวัง เพราะข้อมูลกระจายในหลายตาราง:

| ตาราง | เก็บอะไร | ความสัมพันธ์ |
|---|---|---|
| `checkpoints` | ตัว checkpoint หนึ่งแถวต่อหนึ่งขั้น | `checkpoint->'channel_versions'` ชี้ไปที่ blob |
| `checkpoint_blobs` | ค่าจริงของแต่ละ channel ต่อ **เวอร์ชัน** | **ใช้ร่วมกันได้**: หลาย checkpoint อ้างเวอร์ชันเดียวกัน (ค่าที่ไม่เปลี่ยน) |
| `checkpoint_writes` | ผลเขียนค้างของ checkpoint | อ้างด้วย `checkpoint_id` |

กฎความปลอดภัย (ทำผิดแล้ว thread จะอ่านกลับไม่ได้):
1. เก็บ checkpoint ใหม่สุด N อัน **ต่อ namespace** (subgraph มี namespace ของตัวเอง) ลบที่เก่ากว่า (`checkpoint_id` เรียงตามเวลาได้)
2. ลบ blob ที่ **ไม่มี checkpoint ที่เหลืออ้างถึงแล้ว** เท่านั้น ห้ามลบ blob ที่ checkpoint ใหม่ยังใช้ร่วมอยู่
3. ทั้งหมดอยู่ใน **ธุรกรรมเดียว** ล้มกลางทางต้อง `ROLLBACK`
4. อย่างน้อยต้องเก็บ 1 อัน

ข้อแลกเปลี่ยน: ลบแล้ว time travel (บท 3-14) ย้อนไปจุดที่ถูกลบไม่ได้ และการ resume จาก interrupt ที่ค้างอยู่ใน checkpoint เก่าจะไม่ได้ ควรเก็บพอสำหรับงานย้อนของคุณ

## 1. ลองเติมช่องเดียว

เปิด [`housekeeping.ts`](./housekeeping.ts) แล้วเติมข้อ 1: เติมส่วนหลักของบท (ดูแลตาราง checkpoint บน Postgres (ลบของเก่า)) รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ใช้ Postgres: เปิดฐานข้อมูลด้วย `docker compose up -d --wait` และตั้ง `DATABASE_URL` ใน `.env` ก่อนรัน

```sh
pnpm lesson 5-10
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

`housekeeping.ts` ให้ข้อความ SQL (`SQL`) และ interface `Db` ไว้ (client ของ `pg` ใช้แทนได้) ส่วนอื่นของบทนี้เขียนไว้ให้แล้ว ขาดแค่ข้อ 1

โค้ดตามแนวทาง:

```ts
const used = new Set<string>();
for (const cp of kept) for (const [channel, version] of Object.entries(cp.channel_versions)) used.add(`${cp.ns}|${channel}|${version}`);
return blobs.filter((b) => !used.has(`${b.ns}|${b.channel}|${b.version}`));
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
ลบ: { checkpoints: 16, blobs: 25 }
checkpoints ก่อน/หลัง: 18 2  blobs หลังลบ: 5
✅ planPrune: เก็บใหม่สุด keep อันต่อ namespace ลบที่เหลือ (ลำดับอะไรก็ได้)
✅ planPrune: แต่ละ namespace นับแยกกัน (subgraph)
✅ planPrune: keep < 1 ไม่อนุญาต (ไม่งั้นลบหมดทั้ง thread)
✅ findOrphanBlobs: blob ที่ยังถูกอ้างโดย checkpoint ที่เหลือ (แม้ใช้ร่วม) ไม่ถูกนับเป็นกำพร้า
✅ findOrphanBlobs: เวอร์ชันเป็นตัวเลขก็เทียบได้ (เทียบเป็นสตริง)
✅ pruneThread: ลบ checkpoint เก่า, writes ของมัน และ blob กำพร้า แต่เก็บ blob ที่ใช้ร่วม
✅ pruneThread: อยู่ในธุรกรรม BEGIN … COMMIT และลบ writes ก่อน checkpoints
✅ pruneThread: ล้มกลางทาง ROLLBACK ไม่ COMMIT และโยน error เดิม
✅ pruneThread: ไม่มีอะไรต้องลบ ไม่ลบอะไร และปิดธุรกรรมเรียบร้อย
✅ pruneThread: keep < 1 ไม่แตะฐานข้อมูลเลย
✅ staleThreads: เก่ากว่าเกณฑ์จริง ๆ เท่านั้น (เท่ากับเกณฑ์ไม่นับ)
✅ Postgres จริง: ลบเหลือ 2 checkpoint, อ่านสถานะได้ n=6 และรันต่อได้ n=7
```

สิ่งที่ได้: ลบ checkpoint เก่าอย่างปลอดภัยโดยไม่ทำให้ thread พัง และตั้งนโยบายลบ thread ที่ไม่ได้ใช้

## ข้อควรจำ

- ทดสอบกับสำเนาก่อนใช้จริง และสำรองข้อมูล
- รันเป็นงานตามเวลา (cron) ในช่วงที่ไม่ค่อยมีคนใช้
- ถ้า thread กำลังรันอยู่ขณะลบ อาจชนกัน ควรลบเฉพาะ thread ที่เงียบมาสักพัก

## ลองต่อใน playground

รัน `pnpm play 5-10` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `housekeeping.ts`](./solution/housekeeping.ts) · ไปต่อ [บท 5-11 เข้ารหัส checkpoint ด้วย serializer](../11-encrypted-checkpoints/README.md)

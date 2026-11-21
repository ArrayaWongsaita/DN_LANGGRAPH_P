# บทที่ 5-11 เข้ารหัส checkpoint ด้วย serializer

## แนวคิด

Checkpoint เก็บ **state ทั้งก้อน** ของทุกขั้น: ข้อความของผู้ใช้ ผลของ tool ข้อมูลส่วนบุคคล ถ้าฐานข้อมูลรั่ว (สำรองข้อมูลหลุด, คนมีสิทธิ์อ่านตารางเกินจำเป็น) ทุกอย่างอ่านออกหมด ทางป้องกันคือ **เข้ารหัสก่อนเขียนลงฐานข้อมูล**

Checkpointer ทุกตัวรับ **serializer** (`SerializerProtocol`) ที่เปลี่ยนค่า ↔ ไบต์ มี 2 เมธอด:

```ts
interface SerializerProtocol {
  dumpsTyped(data: any): Promise<[string, Uint8Array]>;   // ค่า → [ชนิด, ไบต์]
  loadsTyped(type: string, data: Uint8Array | string): Promise<any>;
}
new PostgresSaver(pool, serde)   // ตัวที่สองคือ serializer; MemorySaver(serde) ก็เหมือนกัน
```
ห่อ `JsonPlusSerializer` ตัวเดิมด้วยตัวที่เข้ารหัสไบต์ผลลัพธ์ (AES-256-GCM: เข้ารหัสพร้อมตรวจว่าข้อมูลไม่ถูกแก้):

    รูปแบบไบต์ที่เก็บ:  "ENC1" (4) | iv สุ่ม (12) | auth tag (16) | ciphertext

เรื่องที่พลาดบ่อย (บทนี้ให้ทำถูก):
- **iv ต้องสุ่มใหม่ทุกครั้ง** ใช้ iv ซ้ำกับกุญแจเดิมทำลายความปลอดภัยของ GCM
- **ห้ามพึ่ง "ชื่อชนิด" (type) ในการบอกว่าเข้ารหัสแล้ว** เพราะ `MemorySaver` ทิ้งชนิดและเรียก `loadsTyped("json", ...)` เสมอ จึงใส่ตัวนำ (magic) `ENC1` ไว้ในไบต์เอง
- **อ่านข้อมูลเก่าที่ยังไม่เข้ารหัสได้** (ไม่มีตัวนำ → ส่งต่อให้ serializer เดิม) ทำให้เปิดเข้ารหัสกับฐานข้อมูลที่มีอยู่แล้วได้ทีละน้อย
- กุญแจผิดหรือข้อมูลถูกแก้ต้อง **ล้มเหลวดัง ๆ** ไม่ใช่คืนขยะ

## 1. ลองเติมช่องเดียว

เปิด [`encrypted.ts`](./encrypted.ts) แล้วเติมข้อ 1: เติมส่วนหลักของบท (เข้ารหัส checkpoint ด้วย serializer) รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ใช้ Postgres: เปิดฐานข้อมูลด้วย `docker compose up -d --wait` และตั้ง `DATABASE_URL` ใน `.env` ก่อนรัน

```sh
pnpm lesson 5-11
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

`encrypted.ts` ให้ตัวนำ `MAGIC` และ `isEncrypted` ไว้ ส่วนอื่นของบทนี้เขียนไว้ให้แล้ว ขาดแค่ข้อ 1

โค้ดตามแนวทาง:

```ts
const iv = randomBytes(IV_LENGTH);
const cipher = createCipheriv("aes-256-gcm", key, iv);
const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
return Buffer.concat([MAGIC, iv, cipher.getAuthTag(), ciphertext]);
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
  plainLeaks: true,
  encLeaks: false,
  dbRead: 'รหัสลับ-SECRET-999',
  dbWrongMsg: 'ถอดรหัสไม่ได้ (กุญแจผิดหรือข้อมูลถูกแก้)'
✅ parseKey: รับ hex 64 ตัว คืน 32 ไบต์
✅ parseKey: ปฏิเสธกุญแจสั้น/ยาว/ไม่ใช่ hex ด้วยข้อความที่อธิบายได้
✅ encrypt/decrypt: ไปกลับได้ ไบต์ที่เก็บขึ้นต้น ENC1 และไม่มีข้อความเดิม
✅ iv สุ่มใหม่ทุกครั้ง: ข้อความเดียวกันเข้ารหัสสองครั้งได้ไบต์ต่างกัน
✅ กุญแจผิด: โยน error ที่อ่านรู้เรื่อง
✅ ข้อมูลถูกแก้ (ciphertext หรือ tag): ถอดไม่ผ่าน
✅ isEncrypted: สตริงและไบต์ธรรมดาไม่ใช่
✅ EncryptedSerde: ไปกลับได้กับออบเจ็กต์ซ้อน และคงชนิดเดิม
✅ EncryptedSerde: metadata ของ checkpoint คงเป็น JSON ธรรมดา ข้อมูลอื่นเข้ารหัส
✅ EncryptedSerde: ข้อมูลเก่าที่ยังไม่เข้ารหัสยังอ่านได้
✅ EncryptedSerde: อ่านด้วยกุญแจอื่นไม่ได้
✅ กับกราฟจริง: อ่านสถานะกลับได้ แต่ที่เก็บไม่มีข้อความลับ (ตัวควบคุมที่ไม่เข้ารหัสมี)
✅ กับกราฟจริง: กุญแจอื่นอ่าน thread เดิมไม่ได้
✅ Postgres จริง: ไม่เข้ารหัสเห็นข้อความลับในตาราง เข้ารหัสไม่เห็น แต่อ่านกลับด้วยกุญแจเดิมได้
```

สิ่งที่ได้: เข้ารหัส state ที่เก็บในฐานข้อมูลโดยไม่ต้องแก้กราฟ

## ข้อควรจำ

- **ไม่ได้เข้ารหัสทุกอย่าง:** คอลัมน์ `checkpoints.checkpoint` (jsonb: รหัส thread, ชื่อ channel, เวอร์ชัน) และ `metadata` (`source`, `step`, `parents`) ยังอ่านได้ เพราะ `PostgresSaver` แปลง metadata เป็น JSON เพื่อกรองด้วย SQL (ที่เจอตอนรันจริง: ถ้าเข้ารหัส metadata จะล้ม `Unexpected token 'E'`) ที่เข้ารหัสคือค่าของ channel (state) และผลเขียนค้าง ดังนั้น **อย่าใส่ความลับใน metadata ของ config**
- กุญแจเก็บใน secret manager/env ไม่ใช่ในโค้ด และต้องวางแผนหมุนกุญแจ (ข้อมูลเก่าที่เข้ารหัสด้วยกุญแจเดิมยังต้องอ่านได้ จึงมักเก็บหลายกุญแจ)
- สร้างกุญแจ: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- ทำค้นหาด้วย SQL ในข้อมูลที่เข้ารหัสไม่ได้

## ลองต่อใน playground

รัน `pnpm play 5-11` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `encrypted.ts`](./solution/encrypted.ts) · ไปต่อ [บท 5-12 Functional API ให้ลึกขึ้น](../12-functional-depth/README.md)

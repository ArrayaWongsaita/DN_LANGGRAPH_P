# บทที่ 5-18 MCP ผ่าน HTTP และการยืนยันตัวตน

## แนวคิด

บท 4-22 ใช้ MCP แบบ **stdio** (เปิดโปรเซสลูกในเครื่อง) ของจริงมัก **เป็นบริการ HTTP** ที่หลายทีมเรียกร่วมกัน ซึ่งต้องตอบ 2 เรื่อง: (1) ฝั่งเซิร์ฟเวอร์ **ใครเรียกได้** (2) ฝั่ง client **ส่งกุญแจอย่างไรให้ปลอดภัย**

```ts
// ฝั่ง client (adapter) — ใส่หัว Authorization ต่อเซิร์ฟเวอร์
new MultiServerMCPClient({
  mcpServers: { calc: { transport: "http", url: "https://mcp.example.com/mcp", headers: { Authorization: `Bearer ${token}` } } },
});
```
ที่สังเกตจากการรันจริง: tool ที่ได้ชื่อมี prefix ของเซิร์ฟเวอร์ (`calc_add`) และถ้า token ผิด/ไม่ส่ง จะได้ `MCPClientError: Authentication failed for HTTP server "calc"...` จาก `getTools()`

**Bearer token** คือหัว `Authorization: Bearer <token>` ฝั่งเซิร์ฟเวอร์ต้อง:
1. แยก token จากหัวให้ถูก (scheme ไม่สนตัวพิมพ์, ต้องมี token เดียว)
2. **เทียบแบบ constant-time** (`timingSafeEqual`) กันการเดา token จากเวลาตอบ (`===` หยุดทันทีที่ตัวอักษรไม่ตรง)
3. ไม่ผ่านตอบ `401` พร้อมหัว `WWW-Authenticate: Bearer ...` และ **ห้ามสะท้อน token กลับ**
4. ผูก token กับ "ชื่อผู้เรียก" ไว้ใช้บันทึก/จำกัดสิทธิ์ต่อ client

ฝั่ง client:
- **ห้ามส่ง token ผ่าน `http://` ธรรมดาไปนอกเครื่อง** (ข้อมูลและ token เดินกลางทางเป็นข้อความเปล่า) ยอมเฉพาะ `https://` หรือ `localhost`
- แปลง error ให้อ่านรู้เรื่องโดยไม่เผย URL/รายละเอียดภายใน

(MCP มีมาตรฐาน OAuth สำหรับกรณีผู้ใช้หลายคน บทนี้ใช้ Bearer แบบ service-to-service ที่พบบ่อยที่สุดและทดสอบได้ในเครื่อง)

## 1. ลองเติมช่องเดียว

เปิด [`auth.ts`](./auth.ts) แล้วเติมข้อ 1: เติมส่วนหลักของบท (MCP ผ่าน HTTP และการยืนยันตัวตน) รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้เรียกโมเดลจริง ตั้ง provider และ API key ใน `.env` ตาม [บท 1-02](../../level-1-basics/02-llm-config/README.md) ก่อนรัน

```sh
pnpm lesson 5-18
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มีส่วนอื่นของบทนี้เขียนไว้ให้แล้ว ขาดแค่ข้อ 1

โค้ดตามแนวทาง:

```ts
if (!header) return null;
const parts = header.trim().split(/\s+/);
if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer" || parts[1] === "") return null;
return parts[1];
```

## 2. ผลที่ได้

ตัวอย่างผลที่รันจากเฉลย ข้อความจากโมเดลเปลี่ยนได้ทุกรอบ

```text
  right: { tools: [ 'calc_add' ], sum: '5' },
  wrong: {
    tools: [],
  missing: {
    tools: [],
✅ parseBearer: รับเฉพาะ 'Bearer <token>' (scheme ไม่สนตัวพิมพ์)
✅ parseBearer: รูปแบบอื่นทั้งหมดเป็น null
✅ safeEqual: เท่ากัน/ไม่เท่ากัน รวมความยาวต่างกันต้องไม่ throw
✅ authenticate: token ถูก → ได้ชื่อผู้เรียก
✅ authenticate: ไม่มี/ผิดรูป/ผิด token → ปฏิเสธ และเหตุผลไม่มี token ที่ส่งมา
✅ authenticate: token ที่เป็นแค่ส่วนหน้า/ส่วนหนึ่งของ token จริงไม่ผ่าน, ไม่มี token ในระบบก็ไม่ผ่าน
✅ authenticate: token ว่างในระบบไม่ทำให้ใครผ่านด้วยหัวว่าง
✅ unauthorizedResponse: 401 + WWW-Authenticate + JSON ที่ไม่มีความลับ
✅ buildMcpConfig: transport http + หัว Authorization เมื่อมี token
✅ buildMcpConfig: ไม่มี token ก็ไม่มีคีย์ headers
✅ buildMcpConfig: localhost ใช้ http พร้อม token ได้ (รวมไม่มีพอร์ต/พาธ)
✅ buildMcpConfig: token ผ่าน http ธรรมดาไปนอกเครื่อง → ปฏิเสธ และข้อความไม่มี token
✅ buildMcpConfig: หลายเซิร์ฟเวอร์ในคำขอเดียว
✅ describeMcpError: ข้อความที่ผู้ใช้อ่านรู้เรื่อง ไม่เผยรายละเอียดภายใน
✅ เซิร์ฟเวอร์จริง: token ถูกได้ tool add และ 2+3 = 5
✅ เซิร์ฟเวอร์จริง: token ผิดและไม่ส่ง token ถูกปฏิเสธด้วยข้อความที่อ่านรู้เรื่อง
```

สิ่งที่ได้: ทำเซิร์ฟเวอร์ MCP ผ่าน HTTP ที่ยืนยันตัวตนด้วย Bearer และ client ที่ส่ง token อย่างปลอดภัย

## ข้อควรจำ

- token เก็บใน secret manager/env ไม่ใช่ในโค้ดหรือ log
- หมุน token ได้ (เก็บหลายตัวต่อ client ช่วงเปลี่ยน) และเพิกถอนรายตัวได้
- MCP server ภายนอกที่ไม่น่าเชื่อถือ: ผลลัพธ์ของมันคือข้อมูลภายนอก (บท 4-14)

## ลองต่อใน playground

รัน `pnpm play 5-18` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `auth.ts`](./solution/auth.ts) · ไปต่อ [บท 5-19 middleware สำเร็จรูปเพิ่มเติม (tool selector, to-do list, tool emulator)](../19-more-middleware/README.md)

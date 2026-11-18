# บทที่ 5-18: MCP ผ่าน HTTP และการยืนยันตัวตน

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

## ดูตัวอย่าง
`server.mts` เป็นเซิร์ฟเวอร์ MCP ผ่าน HTTP ที่เรียก `authenticate` ของคุณก่อนทุกคำขอ (ให้ไว้แล้ว) `auth.ts` ขาดส่วนฝั่งเซิร์ฟเวอร์ 4 ข้อ `client.ts` ขาดส่วนฝั่ง client 2 ข้อ

## โจทย์
เติม 6 ข้อ แล้วรัน:

    pnpm test:lesson 5-18

ลองกับเซิร์ฟเวอร์จริง (สคริปต์เปิด/ปิดเซิร์ฟเวอร์ให้เอง ใช้ token ถูก ผิด และไม่ส่ง):

    pnpm lesson 5-18

## คุณทำได้แล้ว
- ทำเซิร์ฟเวอร์ MCP ผ่าน HTTP ที่ยืนยันตัวตนด้วย Bearer และ client ที่ส่ง token อย่างปลอดภัย

## ข้อควรจำ
- token เก็บใน secret manager/env ไม่ใช่ในโค้ดหรือ log
- หมุน token ได้ (เก็บหลายตัวต่อ client ช่วงเปลี่ยน) และเพิกถอนรายตัวได้
- MCP server ภายนอกที่ไม่น่าเชื่อถือ: ผลลัพธ์ของมันคือข้อมูลภายนอก (บท 4-14)

## บทถัดไป
บท 5-19: middleware สำเร็จรูปเพิ่มเติม

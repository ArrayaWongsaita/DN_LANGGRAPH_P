# บทที่ 4-22: MCP (ใช้ tool จากเซิร์ฟเวอร์ภายนอก)

## แนวคิด
**MCP (Model Context Protocol)** เป็นมาตรฐานเปิดให้โปรแกรมหนึ่ง "เปิดเผยเครื่องมือ" ให้ agent ใด ๆ เรียกใช้ โดยไม่ต้องเขียน tool ใหม่ทุกครั้ง (เช่นเซิร์ฟเวอร์ MCP ของฐานข้อมูล ระบบไฟล์ หรือบริการภายในบริษัท) ฝั่ง agent ใช้แพ็กเกจ `@langchain/mcp-adapters`:

```ts
const client = new MultiServerMCPClient({
  mcpServers: { calc: { transport: "stdio", command: "node", args: ["--import", "tsx", "server.mts"] } },
});
const tools = await client.getTools();       // tool ของ LangChain พร้อมใช้ (ชื่อขึ้นต้นด้วยชื่อเซิร์ฟเวอร์: calc_add)
const agent = createAgent({ model, tools });
...
await client.close();                          // ต้องปิดเสมอ ไม่งั้นโปรเซสลูกค้างอยู่
```
- `transport: "stdio"` เปิดเซิร์ฟเวอร์เป็นโปรเซสลูก (เหมาะกับเครื่องมือในเครื่อง) ส่วน `http` ใช้เซิร์ฟเวอร์ระยะไกล (มีเรื่อง authentication)
- ชื่อ tool ถูกเติมคำนำหน้าด้วยชื่อเซิร์ฟเวอร์เมื่อมีหลายเซิร์ฟเวอร์ กันชื่อซ้ำ
- **ความปลอดภัย:** MCP server คือโค้ดที่คุณรันหรือเชื่อมต่อ ใช้เฉพาะที่ไว้ใจ และใช้หลักสิทธิ์น้อยที่สุดตามบท 4-14

โฟลเดอร์ของบทนี้มี `server.mts` เป็น MCP server จำลอง (เครื่องมือ `add`) ที่ใช้ทดสอบ ไม่ต้องแก้

## ดูตัวอย่าง
`mcp.ts` ขาด 3 จุด: ตั้งค่า client, ดึง tool มาสร้าง agent และปิด client ใน `finally`

## โจทย์
เติม 3 ข้อ แล้วรัน:

    pnpm test:lesson 4-22

## คุณทำได้แล้ว
- ต่อ agent เข้ากับ tool จากภายนอกด้วยมาตรฐานกลาง

## ข้อควรจำ
- ปิด client ใน `finally` แม้เกิด error
- คำอธิบาย tool จากเซิร์ฟเวอร์ภายนอกอาจชี้นำโมเดลได้ (ดูบท 4-14)

## บทถัดไป
บท 4-23: tool ที่รายงานความคืบหน้า

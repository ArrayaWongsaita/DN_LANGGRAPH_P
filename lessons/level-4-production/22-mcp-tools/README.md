# บทที่ 4-22 MCP (ใช้ tool จากเซิร์ฟเวอร์ภายนอก)

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
- ชื่อ tool ถูกเติมคำนำหน้าด้วยชื่อเซิร์ฟเวอร์เสมอ (แม้มีเซิร์ฟเวอร์เดียว) กันชื่อซ้ำเมื่อรวมหลายเซิร์ฟเวอร์
- **ความปลอดภัย:** MCP server คือโค้ดที่คุณรันหรือเชื่อมต่อ ใช้เฉพาะที่ไว้ใจ และใช้หลักสิทธิ์น้อยที่สุดตามบท 4-14

โฟลเดอร์ของบทนี้มี `server.mts` เป็น MCP server จำลอง (เครื่องมือ `add`) ที่ใช้ทดสอบ ไม่ต้องแก้

## 1. ลองเติมช่องเดียว

เปิด [`mcp.ts`](./mcp.ts) แล้วเติมข้อ 1: ตั้งค่า `MultiServerMCPClient` ที่เปิด MCP server เป็นโปรเซสลูกผ่าน stdio รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้เรียกโมเดลจริง ตั้ง provider และ API key ใน `.env` ตาม [บท 1-02](../../level-1-basics/02-llm-config/README.md) ก่อนรัน

```sh
pnpm lesson 4-22
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มี MCP server เครื่องคิดเลขของคอร์ส (`SERVER_PATH`) และโค้ดดึง tool สร้าง agent กับปิด client ใน `finally` ให้แล้ว ขาดแค่การสร้าง client

โค้ดตามแนวทาง:

```ts
const client = new MultiServerMCPClient({
  mcpServers: { calc: { transport: "stdio", command: "node", args: ["--import", "tsx", SERVER_PATH] } },
});
```

## 2. ผลที่ได้

ตัวอย่างผลที่รันจากเฉลย ข้อความจากโมเดลเปลี่ยนได้ทุกรอบ

```text
  toolNames: [ 'calc_add' ],
  answer: 'ผลลัพธ์คือ **5** ครับ (2 + 3 = 5)'
✅ ดึง tool จากเซิร์ฟเวอร์ MCP: ชื่อมีคำนำหน้าเป็นชื่อเซิร์ฟเวอร์
✅ agent เรียก tool ของ MCP ได้จริง: ผลบวกคือ 5
✅ ปิด client หลังใช้เสร็จ (ใน finally)
```

สิ่งที่ได้: ต่อ agent เข้ากับ tool จากภายนอกด้วยมาตรฐานกลาง

## 3. ส่วนประกอบที่ใช้ในบทนี้

| ส่วน | ตัวอย่าง | หน้าที่ |
|---|---|---|
| `transport` | `"stdio"` | เปิด server เป็นโปรเซสลูกและคุยผ่าน stdin/stdout |
| `command` และ `args` | `node --import tsx SERVER_PATH` | คำสั่งที่เปิด server |
| `client.getTools()` | — | ได้ tool จาก server ไปใช้กับ `createAgent` |

## ข้อควรจำ

- ปิด client ใน `finally` แม้เกิด error
- คำอธิบาย tool จากเซิร์ฟเวอร์ภายนอกอาจชี้นำโมเดลได้ (ดูบท 4-14)

## ลองต่อใน playground

รัน `pnpm play 4-22` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `mcp.ts`](./solution/mcp.ts) · ไปต่อ [บท 4-23 tool ที่รายงานความคืบหน้า (stream mode `tools`)](../23-tool-progress/README.md)

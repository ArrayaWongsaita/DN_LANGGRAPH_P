# บทที่ 5-08 แปลงเหตุการณ์เป็นความคืบหน้าสำหรับหน้าจอ

## แนวคิด

เหตุการณ์ดิบของ `streamEvents` (บท 5-07) ไม่ควรส่งตรงไปหน้าเว็บ: มีทั้ง state ก้อนใหญ่ (อาจมีข้อมูลที่ผู้ใช้ไม่ควรเห็น), checkpoint และรายละเอียดภายใน หน้าจอต้องการแค่ไม่กี่อย่าง: "กำลังทำขั้นไหน", "เรียก tool อะไร ได้ผลอะไร", "ข้อความที่ค่อย ๆ พิมพ์ออกมา", "เสร็จแล้ว" หรือ "ล้มเหลว" บทนี้ทำชั้นแปลที่ **ส่งออกเฉพาะสิ่งที่อนุญาต** (allowlist) เหตุการณ์ที่ไม่รู้จักถูกทิ้ง ผลพลอยได้คือรูปแบบข้อความที่หน้าจอพึ่งพาจะคงที่ แม้ภายในของ LangGraph เปลี่ยน

```ts
type Progress =
  | { type: "node"; node: string }                      // node เริ่มทำงาน
  | { type: "tool-start"; tool: string; input: string }
  | { type: "tool-end"; tool: string; output: string }
  | { type: "token"; text: string }                     // ข้อความที่ค่อย ๆ มา
  | { type: "done" }
  | { type: "error"; message: string };
```

ข้อควรระวัง:
- `tool-end` ไม่มีชื่อ tool ในตัวเอง ต้องจำจาก `tool-started` (บท 5-07) จึงต้องมีตัวแปลที่มีสถานะ
- token อยู่ในช่อง `messages` ที่ `event === "content-block-delta"` และ `delta.type === "text-delta"` (namespace ไม่ว่างเพราะอยู่ใน node)
- ถ้ากราฟล้ม จะมีเหตุการณ์ `lifecycle` `failed` **แล้วการวนอ่านจึง throw** ต้องส่ง `error` ให้หน้าจอครั้งเดียว ไม่ซ้ำ

## 1. ลองเติมช่องเดียว

เปิด [`progress.ts`](./progress.ts) แล้วเติมข้อ 1: เติมส่วนหลักของบท (แปลงเหตุการณ์เป็นความคืบหน้าสำหรับหน้าจอ) รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 5-08
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

`progress.ts` ให้ตัวแปล `lifecycleProgress` และโครงของตัวแปลไว้แล้ว ส่วนอื่นของบทนี้เขียนไว้ให้แล้ว ขาดแค่ข้อ 1

โค้ดตามแนวทาง:

```ts
if (ev.method !== "messages") return null;
const data = ev.params.data as { event?: string; delta?: { type?: string; text?: string } };
if (data.event === "content-block-delta" && data.delta?.type === "text-delta" && data.delta.text) return { type: "token", text: data.delta.text };
return null;
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
{ type: 'node', node: 'model_request' }
{ type: 'node', node: 'tools' }
{ type: 'tool-start', tool: 'add', input: '{"a":1,"b":2}' }
{ type: 'tool-end', tool: 'add', output: '3' }
{ type: 'node', node: 'model_request' }
{ type: 'token', text: 'ผลคือ 3' }
{ type: 'done' }
✅ เอเจนต์ตัวอย่าง: ลำดับความคืบหน้า node → tool → token → done
✅ allowlist: state, checkpoint และอินพุตของ node ไม่รั่วออกไป
✅ ตัวแปล: เหตุการณ์ที่ไม่รู้จักและงานใน namespace ย่อยคืน null
✅ token: เฉพาะ text-delta ที่ไม่ว่าง
✅ tool-end: จับคู่ชื่อด้วย tool_call_id (ผลสลับลำดับได้) และ id ที่ไม่เคยเห็นได้ ?
✅ กราฟล้มจริง: ส่ง error หนึ่งครั้ง (ไม่ซ้ำ) และไม่ throw ออกมา
✅ ท่อที่ throw กลางทางโดยไม่มี lifecycle: ส่ง error ให้ครั้งเดียว
```

สิ่งที่ได้: แปลงท่อเหตุการณ์เป็นความคืบหน้าที่ปลอดภัยและคงที่สำหรับ UI รวมถึงกรณีล้มเหลว

## ข้อควรจำ

- allowlist ปลอดภัยกว่า denylist: เหตุการณ์ชนิดใหม่ในอนาคตจะไม่รั่วออกไปเอง
- อย่าส่ง input/output ของ tool ที่อาจมีความลับไปหน้าจอโดยไม่คิด (ใช้ `redact` จากบท 4-13/4-14 ถ้าจำเป็น)

## ลองต่อใน playground

รัน `pnpm play 5-08` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `progress.ts`](./solution/progress.ts) · ไปต่อ [บท 5-09 ส่งความคืบหน้าผ่าน HTTP ด้วย Express (SSE)](../09-sse-express/README.md)

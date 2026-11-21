# บทที่ 3-32 ดูภาพของ graph (Mermaid)

## แนวคิด

graph ที่ซับซ้อนขึ้น (เงื่อนไข ลูป subgraph) ยากจะเห็นภาพจากโค้ดล้วน ๆ LangGraph วาดโครงสร้างให้เป็นข้อความ **Mermaid** ที่เอาไปแปะในเอกสารหรือ Markdown (GitHub, VS Code, mermaid.live) แสดงเป็นแผนภาพได้:

```ts
const g = await graph.getGraphAsync();
g.drawMermaid()                    // ข้อความ Mermaid
Object.keys(g.nodes)               // ชื่อ node (รวม __start__ และ __end__)
```
- เส้นทึบ = edge ปกติ เส้นประ = เส้นทางแบบมีเงื่อนไข
- subgraph ที่ใส่เป็น node แสดงเป็น node เดียวในภาพของแม่ ถ้าอยากดูข้างใน ให้เรียก `getGraphAsync()` ของ subgraph นั้นเอง

ใช้เป็นเอกสารของระบบ ตรวจว่าเส้นทางเป็นอย่างที่ตั้งใจ และอธิบายให้เพื่อนร่วมทีมฟัง

## 1. ลองเติมช่องเดียว

เปิด [`visualize.ts`](./visualize.ts) แล้วเติมข้อ 1: วาด graph เป็น Mermaid ด้วย `getGraphAsync()` แล้ว `drawMermaid()` รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 3-32
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มี graph ตัวอย่างที่มีเงื่อนไขและลูป และโค้ดดึงรายชื่อ node ให้แล้ว ขาดแค่การวาด Mermaid

โค้ดตามแนวทาง:

```ts
const g = await graph.getGraphAsync();
const mermaid: string = g.drawMermaid();
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
%%{init: {'flowchart': {'curve': 'linear'}}}%%
graph TD;
	__start__([<p>__start__</p>]):::first
	inc(inc)
	done(done)
	__end__([<p>__end__</p>]):::last
	__start__ --> inc;
	done --> __end__;
	inc -.-> done;
	inc -.-> inc;
	classDef default fill:#f2f0ff,line-height:1.2;
	classDef first fill-opacity:0;
	classDef last fill:#bfb6fc;

node: [ 'inc', 'done' ]
✅ ได้แผนภาพ Mermaid ที่มีชื่อ node inc และ done
✅ รายชื่อ node ที่ประกาศเองมีแค่ inc และ done
```

สิ่งที่ได้: สร้างแผนภาพของ graph และอ่านรายชื่อ node

## 3. ส่วนประกอบที่ใช้ในบทนี้

| เมธอด | ได้อะไร |
|---|---|
| `graph.getGraphAsync()` | ออบเจ็กต์โครงสร้าง graph (node และ edge ที่ประกาศไว้) |
| `g.drawMermaid()` | ข้อความ Mermaid ที่แปะใน Markdown ของ GitHub หรือ mermaid.live ได้ |

## ข้อควรจำ

- ภาพสร้างจากโครงสร้างที่ประกาศ (edge/ends) ถ้า node ใช้ `Command` ต้องประกาศ `ends` ภาพถึงครบ
- เก็บภาพล่าสุดไว้ใน README ของโปรเจกต์จริง

## ลองต่อใน playground

รัน `pnpm play 3-32` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `visualize.ts`](./solution/visualize.ts) · ไปต่อ [บท 3-33 ตั้งค่า tracing (ทางเลือก)](../33-tracing-config/README.md)

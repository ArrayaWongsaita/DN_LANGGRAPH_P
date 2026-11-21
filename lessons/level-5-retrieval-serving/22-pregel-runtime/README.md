# บทที่ 5-22 Pregel runtime เบื้องหลัง graph

## แนวคิด

`StateGraph` ที่คุณเขียนถูกคอมไพล์เป็นตัวรันชื่อ **Pregel** (แนวคิดจากระบบประมวลผล graph ขนาดใหญ่) ความเข้าใจ 3 ข้อนี้อธิบาย "ข้อควรระวัง" ที่เจอมาตลอดคอร์ส:

**1. Superstep (ก้าวรัน):** runtime รันเป็นรอบ ๆ ในแต่ละรอบ:
1. **Plan** หา node ที่พร้อมรัน (ได้รับข้อความจาก channel ในรอบก่อน)
2. **Execute** รัน node เหล่านั้น **พร้อมกัน** โดยทุกตัวเห็น State ณ ต้นรอบ (ยังไม่เห็นผลของกันและกัน)
3. **Update** นำผลเขียนลง channel ทีเดียวทั้งรอบ แล้ว checkpoint (บท 2-02) หนึ่งครั้ง

กราฟ `a → (b, c) → d` จึงมี 3 รอบ: `[a]`, `[b, c]`, `[d]` (b กับ c อยู่รอบเดียวกัน) สังเกตได้จาก `streamMode: "debug"` ที่มี event `task` พร้อมเลข `step`

**2. Channel:** State แต่ละฟิลด์คือ channel ที่มีกติการวมค่า ฟิลด์ธรรมดาเป็น `LastValue` **รับได้ค่าเดียวต่อรอบ** ถ้า b กับ c เขียนฟิลด์เดียวกันในรอบเดียว จะได้ `InvalidUpdateError` (`INVALID_CONCURRENT_GRAPH_UPDATE`) ทางแก้คือใช้ reducer (`ReducedValue`, บท 1-14) ที่บอกวิธีรวมค่า
runtime ยังสร้าง channel ภายใน เช่น `branch:to:<node>` (สัญญาณ "node นี้ต้องรัน") และ `__pregel_tasks` คุณไม่ควรไปแตะ

**3. ทำไมชื่อ node ห้ามซ้ำชื่อฟิลด์ State:** node ก็ถูกจัดการผ่าน channel ชื่อเดียวกันกับที่ใช้ในกราฟ จึงชนกันได้ LangGraph จึงโยน error ตอน `addNode`: `x is already being used as a state attribute (a.k.a. a channel), cannot also be used as a node name.`

ผลต่อการออกแบบ:
- node ในรอบเดียวกันรันขนานได้จริง (เร็วขึ้น) แต่ **อย่าให้เขียนฟิลด์เดียวกันโดยไม่มี reducer**
- checkpoint เกิดต่อรอบ ไม่ใช่ต่อ node (ข้อมูลที่ไม่เสร็จครบรอบจะไม่ถูกบันทึก บท 4-01)
- ลำดับผลลัพธ์ในรอบเดียวกันไม่ควรถูกคาดหวัง (ถ้าต้องเรียง ให้เรียงเองใน reducer/โหนดถัดไป)

## 1. ลองเติมช่องเดียว

เปิด [`pregel.ts`](./pregel.ts) แล้วเติมข้อ 1: เติมส่วนหลักของบท (Pregel runtime เบื้องหลัง graph) รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 5-22
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

`pregel.ts` มีฟังก์ชันวิเคราะห์ event ของ runtime จริง ส่วนอื่นของบทนี้เขียนไว้ให้แล้ว ขาดแค่ข้อ 1

โค้ดตามแนวทาง:

```ts
const byStep = new Map<number, string[]>();
for (const e of events) {
  const name = e.type === "task" ? e.payload?.name : undefined;
  if (!name) continue;
  byStep.set(e.step, [...(byStep.get(e.step) ?? []), name]);
}
return [...byStep.entries()].sort((x, y) => x[0] - y[0]).map(([step, nodes]) => ({ step, nodes: nodes.sort() }));
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
รอบรัน: #1 [a]  #2 [b, c]  #3 [d]
ขนานสูงสุด: 2 node
channel ทั้งหมด: log, __start__, __pregel_tasks, branch:to:a, branch:to:b, branch:to:c, branch:to:d
channel ของผู้ใช้: log
ไม่มี reducer → error ความขนาน: Invalid update for channel "log" with values [["b"],["c"]]: LastValue can only receive one value per step.
ชื่อ node ที่ชนกับฟิลด์: [ 'log' ]
addNode ชื่อ log → log is already being used as a state attribute (a.k.a. a channel), cannot also be used as a node name.
✅ diamond มี 3 รอบ และ b กับ c อยู่รอบเดียวกัน (เลขรอบเรียงและไม่ซ้ำ)
✅ มี reducer: ผลของ node ขนานถูกรวมครบ
✅ ไม่มี reducer: สอง node เขียนฟิลด์เดียวกันในรอบเดียว → error ความขนาน
✅ groupSupersteps: เรียงรอบ, เรียงชื่อ, ข้าม event ที่ไม่ใช่ task และ task ที่ไม่มีชื่อ
✅ groupSupersteps: เรียงเลขรอบเป็นตัวเลข (10 มาหลัง 2)
✅ maxParallelism
✅ findNameClashes: เจอชื่อซ้ำ ไม่ซ้ำกันเอง ตามลำดับ node
✅ isConcurrentUpdateError: รู้จักด้วยรหัสหรือข้อความ และไม่หลงทางกับ error อื่น
✅ userChannels: ตัด channel ภายในของ runtime (เช็กเฉพาะคำขึ้นต้น)
✅ channel จริงของ graph: ฟิลด์ของเรามีอยู่ และมี channel ภายในปนอยู่
✅ addNode ชื่อเดียวกับฟิลด์ State → LangGraph ปฏิเสธ
```

สิ่งที่ได้: อ่านการรันของ graph เป็น superstep และอธิบายที่มาของ error ด้านความขนานและชื่อ node

## ข้อควรจำ

- รายละเอียดภายใน (ชื่อ channel ภายใน) เปลี่ยนได้ตามเวอร์ชัน ใช้เพื่อทำความเข้าใจ/ดีบัก ไม่ใช่เขียนโค้ดพึ่งพา
- ถ้า reducer ไม่สลับที่ได้ (commutative) ผลจะไม่ขึ้นกับลำดับที่ node ขนานเสร็จ

## ลองต่อใน playground

รัน `pnpm play 5-22` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `pregel.ts`](./solution/pregel.ts) · ไปต่อ [บท 5-23 (โครงงานปิดท้าย): ผู้ช่วยความรู้ขององค์กร](../23-capstone-knowledge-assistant/README.md)

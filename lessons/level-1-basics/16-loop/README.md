# บทที่ 1-16 วนซ้ำด้วย Conditional Edge

สมมติว่างานหนึ่งต้องปรับหลายรอบ ให้ Graph กลับมาที่ `refine` เมื่อยังต้องแก้ และหยุดเมื่อได้ `OK` หรือทำครบสามรอบ บทนี้ใช้ router แบบ [บท 1-15](../15-conditional-edge/README.md) โดยเลือกได้ระหว่าง node เดิมกับ `END`

## 1. วนจนได้ `OK` หรือครบรอบ

เปิด [`refineLoop.ts`](./refineLoop.ts) แล้วเติมข้อ 1 ให้ `shouldContinue` คืน `END` เมื่อข้อความล่าสุดตัดช่องว่างแล้วเป็น `"OK"` หรือจำนวนรอบถึง `maxRounds` ถ้ายังทำต่อได้ให้คืน `"refine"` หลังติดตั้ง dependencies ด้วย `pnpm install` ให้รันจากโฟลเดอร์หลักของโปรเจกต์ ข้อความแต่ละรอบมาจากรายการในเครื่อง จึงรันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 1-16
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

`State` และ `maxRounds` มาจากไฟล์ Node `refine` อ่านคำตอบของรอบนี้ แล้วเพิ่ม `rounds` ก่อนที่ router จะเลือกทาง

```ts
function shouldContinue(state: typeof State.State): "refine" | typeof END {
  return state.last.trim() === "OK" || state.rounds >= maxRounds ? END : "refine";
}

const app = new StateGraph(State)
  .addNode("refine", (state) => ({
    last: state.replies[state.rounds] ?? "ยังต้องปรับ",
    rounds: state.rounds + 1,
  }))
  .addEdge(START, "refine")
  .addConditionalEdges("refine", shouldContinue, ["refine", END])
  .compile();

const approved = await app.invoke({ replies: ["ฉบับปรับครั้งแรก", " OK "] });
const capped = await app.invoke({
  replies: ["ฉบับปรับครั้งแรก", "OK แต่ยังต้องปรับ", "ฉบับปรับครั้งที่สาม"],
});
console.log(`${approved.rounds} รอบ -> ${JSON.stringify(approved.last)}`);
console.log(`${capped.rounds} รอบ -> ${JSON.stringify(capped.last)}`);
```

```text
2 รอบ -> " OK "
3 รอบ -> "ฉบับปรับครั้งที่สาม"
✅ วนอีกรอบเมื่อผลแรกยังไม่ใช่ OK
✅ หยุดทันทีที่ได้ OK แม้มีช่องว่าง
✅ หยุดที่รอบสูงสุดแม้ยังต้องปรับ
```

ชุดแรกได้ `" OK "` จึงหยุดรอบที่สอง ชุดที่สองได้ `"OK แต่ยังต้องปรับ"` ในรอบที่สอง ซึ่งมีคำอื่นต่อท้าย จึงทำต่อถึงเพดานสามรอบ

## 2. ตัวนับและเงื่อนไขหยุด

| ค่า | ชนิดและความหมาย |
|---|---|
| `replies` | อาร์เรย์ของข้อความที่ส่งเข้า Graph ตัวอย่างใช้สมาชิกตำแหน่ง `rounds` ถ้าไม่มีสมาชิกที่ตำแหน่งนั้นจะใช้ `"ยังต้องปรับ"` |
| `last` | ข้อความล่าสุด เริ่มที่ `""` และถูกแทนที่ในทุกครั้งที่ `refine` ทำงาน |
| `rounds` | จำนวนรอบที่ทำไปแล้ว เริ่มที่ `0` และเพิ่มทีละ `1` |
| `maxRounds` | ค่าคงที่ของตัวอย่าง เริ่มที่ `3` ควรใช้จำนวนเต็มบวก เพราะ Graph เข้า `refine` หนึ่งครั้งก่อนตรวจเงื่อนไข |

## 3. ใช้คำตอบเดิมแล้วเปลี่ยนเพดานรอบ

คัดลอกโค้ดก่อนส่วนตรวจคำตอบจาก [เฉลย `refineLoop.ts`](./solution/refineLoop.ts) ไปที่ [`playground.ts`](./playground.ts) เก็บ import ไว้ชุดเดียว เปลี่ยน `maxRounds` แล้วรัน `pnpm play 1-16` ดูผลของ input ชุดแรกชุดเดียว

| `maxRounds` | `rounds` | `last` |
|---|---|---|
| `3` | `2` | `" OK "` |
| `1` | `1` | `"ฉบับปรับครั้งแรก"` |

[บทถัดไป 1-17](../17-reducers/README.md) จะใช้ reducer กำหนดว่าจะรวมค่าจากการอัปเดต State อย่างไร

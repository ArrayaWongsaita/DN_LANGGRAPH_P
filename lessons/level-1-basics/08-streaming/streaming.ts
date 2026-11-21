import { AIMessageChunk } from "@langchain/core/messages";
import { FakeStreamingChatModel } from "@langchain/core/utils/testing";
import { check } from "@src/check";
import { todo } from "@src/todo";

const model = new FakeStreamingChatModel({
  chunks: [new AIMessageChunk("ไปเที่ยว "), new AIMessageChunk("เชียงใหม่กัน")],
});
const question = "ชวนเพื่อนไปเที่ยวเชียงใหม่";
// 👉 ข้อ 1 เปิด stream จาก model ด้วย question แล้วรอ stream ด้วย await
// แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
//   const stream = await model.stream(question);
const stream: AsyncIterable<AIMessageChunk> = todo(1);

const parts: string[] = [];
for await (const chunk of stream) {
  parts.push(chunk.text);
  process.stdout.write(chunk.text);
}
process.stdout.write("\n");
console.log("ชิ้นข้อความ", parts);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("อ่านสองชิ้นตามลำดับ", parts.length === 2 && parts[0] === "ไปเที่ยว " && parts[1] === "เชียงใหม่กัน", "เปิด stream แล้ววนอ่าน chunk.text");

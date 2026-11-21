// รันแบบออฟไลน์ ตัวหลักและตัวสำรองจำลองด้วย RunnableLambda
import { AIMessage } from "@langchain/core/messages";
import { RunnableLambda, type Runnable } from "@langchain/core/runnables";
import { check } from "@src/check";

const failuresBeforeSuccess = 2;
const calls: string[] = [];
let attempts = 0;

const primary = RunnableLambda.from((_input: string) => {
  calls.push("primary");
  attempts++;
  if (attempts <= failuresBeforeSuccess) throw new Error("primary ยังไม่พร้อม");
  return new AIMessage("ตอบจากตัวหลัก");
});
const backup = RunnableLambda.from((_input: string) => {
  calls.push("backup");
  return new AIMessage("ตอบจากตัวสำรอง");
});

const reliable: Runnable<string, AIMessage> = primary
  .withRetry({ stopAfterAttempt: 2 })
  .withFallbacks({ fallbacks: [backup] });

const reply = await reliable.invoke("ทักทายหนึ่งประโยค");
console.log(JSON.stringify({ calls, answer: reply.text }));












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check(
  "ลองตัวหลัก 2 ครั้งแล้วเรียกตัวสำรอง",
  calls.join(",") === "primary,primary,backup" && reply.text === "ตอบจากตัวสำรอง",
  "ต่อ withRetry ที่ตัวหลักก่อน แล้วจึงต่อ withFallbacks",
);

import type { BaseMessage } from "@langchain/core/messages";
import type { ChatResult } from "@langchain/core/outputs";
import { FakeToolLLM, fakeToolLLM } from "@src/fakeToolLLM";
import { ask, buildResilientAgent } from "./resilient";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) โมเดลปลอมที่ล้มเหลวตามจำนวนครั้งที่กำหนด
class Flaky extends FakeToolLLM {
  attempts = 0;
  constructor(script: string[], private failures: number) {
    super(script);
  }
  async _generate(messages: BaseMessage[]): Promise<ChatResult> {
    this.attempts++;
    if (this.failures > 0) {
      this.failures--;
      throw new Error("เครือข่ายล่ม");
    }
    return super._generate(messages);
  }
}

test("ล้มสองครั้งแล้วผ่าน: retry ช่วย ไม่ต้องใช้ตัวสำรอง", async () => {
  const primary = new Flaky(["หลัก"], 2);
  const backup = fakeToolLLM(["สำรอง"]);
  expect(await ask(buildResilientAgent(primary, backup, []), "x")).toBe("หลัก");
  expect(primary.attempts).toBe(3);
  expect(backup.calls).toHaveLength(0);
});

test("ตัวหลักล่มตลอด: สลับไปตัวสำรอง", async () => {
  const primary = new Flaky(["หลัก"], 99);
  expect(await ask(buildResilientAgent(primary, fakeToolLLM(["สำรอง"]), []), "x")).toBe("สำรอง");
});

test("middleware ที่เขียนเองจดจำนวนข้อความก่อนเรียกโมเดล", async () => {
  const seen: number[] = [];
  await ask(buildResilientAgent(new Flaky(["หลัก"], 0), fakeToolLLM([]), seen), "x");
  expect(seen).toEqual([1]);
});

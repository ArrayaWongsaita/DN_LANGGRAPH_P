import type { BaseMessage } from "@langchain/core/messages";
import type { ChatResult } from "@langchain/core/outputs";
import { FakeToolLLM, fakeToolLLM } from "@src/fakeToolLLM";
import { askSturdy } from "./reliable";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
// withRetry รอระหว่างลองใหม่ (เพิ่มเป็นสองเท่า) จึงให้เวลา test มากกว่าปกติ
vi.setConfig({ testTimeout: 30000 });
// LLM ปลอมที่ล้มเหลวตามจำนวนครั้งที่กำหนดก่อน แล้วค่อยตอบปกติ
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

test("ปกติ: ตัวหลักตอบ ตัวสำรองไม่ถูกเรียก", async () => {
  const primary = new Flaky(["หลัก"], 0);
  const backup = fakeToolLLM(["สำรอง"]);
  expect(await askSturdy(primary, backup, "x")).toBe("หลัก");
  expect(backup.calls).toHaveLength(0);
});

test("ล้มเหลว 2 ครั้งแล้วผ่าน: retry ช่วยไว้ ไม่ต้องใช้ตัวสำรอง", async () => {
  const primary = new Flaky(["หลัก"], 2);
  const backup = fakeToolLLM(["สำรอง"]);
  expect(await askSturdy(primary, backup, "x")).toBe("หลัก");
  expect(primary.attempts).toBe(3);
  expect(backup.calls).toHaveLength(0);
});

test("ตัวหลักล่มตลอด: ลองครบ 3 ครั้งแล้วสลับไปตัวสำรอง", async () => {
  const primary = new Flaky(["หลัก"], 99);
  const backup = fakeToolLLM(["สำรอง"]);
  expect(await askSturdy(primary, backup, "x")).toBe("สำรอง");
  expect(primary.attempts).toBe(3);
});

test("ตัวสำรองล่มด้วย: error ถูกโยนออกมา", async () => {
  const primary = new Flaky(["หลัก"], 99);
  await expect(askSturdy(primary, fakeToolLLM([]), "x")).rejects.toThrow();
});

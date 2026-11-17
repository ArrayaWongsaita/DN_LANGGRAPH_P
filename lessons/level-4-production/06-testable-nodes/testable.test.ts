import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildPipeline, cleanText, makeSummarizeNode } from "./testable";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) สังเกตว่าทดสอบได้สามชั้น: ตรรกะล้วน, node เดี่ยว, graph ทั้งเส้น
test("ชั้นตรรกะล้วน: cleanText ไม่ต้องใช้โมเดลเลย", () => {
  expect(cleanText("  สวัสดี   ชาว  โลก \n")).toBe("สวัสดี ชาว โลก");
});

test("ชั้น node เดี่ยว: ส่ง State เข้าตรง ๆ และเห็นสิ่งที่โมเดลได้รับ", async () => {
  const llm = fakeToolLLM(["สรุปแล้ว"]);
  const result = await makeSummarizeNode(llm)({ text: "ข้อความยาว" });
  expect(result).toEqual({ summary: "สรุปแล้ว" });
  expect(llm.calls[0][0].text).toBe("สรุปสั้น ๆ: ข้อความยาว");
});

test("ชั้น graph: ทำความสะอาดก่อน แล้วโมเดลเห็นข้อความที่สะอาดแล้ว", async () => {
  const llm = fakeToolLLM(["ย่อ"]);
  const r = await buildPipeline(llm).invoke({ text: "  a   b  " });
  expect(r.summary).toBe("ย่อ");
  expect(llm.calls[0][0].text).toBe("สรุปสั้น ๆ: a b");
});

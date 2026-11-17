import { classify, runAssistant, type Ask } from "./assistant";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
// ask ปลอมที่ตอบตามลำดับที่เขียนไว้ และจดว่าถูกถามอะไรบ้าง
function scriptedAsk(replies: string[]) {
  const prompts: string[] = [];
  const ask: Ask = async (prompt) => {
    prompts.push(prompt);
    const reply = replies[prompts.length - 1];
    if (reply === undefined) throw new Error("ask ถูกเรียกเกินที่เขียนไว้");
    return reply;
  };
  return { ask, prompts };
}

test("classify: ตอบ greeting -> 'greeting' (ไม่สนตัวพิมพ์ใหญ่เล็กและช่องว่าง)", async () => {
  expect(await classify(scriptedAsk(["  Greeting \n"]).ask, "สวัสดี")).toBe("greeting");
});

test("classify: อย่างอื่นนับเป็น 'question'", async () => {
  expect(await classify(scriptedAsk(["question"]).ask, "ทำไมฟ้าสีฟ้า")).toBe("question");
  expect(await classify(scriptedAsk(["ไม่รู้"]).ask, "x")).toBe("question");
});

test("classify: ส่งข้อความผู้ใช้ไปให้ ask", async () => {
  const s = scriptedAsk(["question"]);
  await classify(s.ask, "คำถามพิเศษ");
  expect(s.prompts[0]).toContain("คำถามพิเศษ");
});

test("ทักทาย: ตอบสำเร็จรูป ไม่เรียก ask เพิ่มหลังจัดประเภท และไม่ปรับปรุงคำตอบ", async () => {
  const s = scriptedAsk(["greeting"]);
  const result = await runAssistant(s.ask, "สวัสดี");
  expect(result.category).toBe("greeting");
  expect(result.answer).toContain("สวัสดี");
  expect(result.rounds).toBe(0);
  expect(s.prompts).toHaveLength(1);
});

test("คำถาม: ได้คำตอบร่าง แล้วปรับปรุงจนได้ OK ใช้ฉบับล่าสุดที่ดีขึ้น", async () => {
  const s = scriptedAsk(["question", "ร่างแรก", "ฉบับดีขึ้น", "OK"]);
  const result = await runAssistant(s.ask, "LangGraph คืออะไร");
  expect(result).toEqual({ category: "question", answer: "ฉบับดีขึ้น", rounds: 2 });
});

test("คำถาม: ปรับปรุงเกินจำนวนรอบสูงสุดไม่ได้ (หยุดที่ maxRounds)", async () => {
  const s = scriptedAsk(["question", "ร่าง", "ดีขึ้น 1", "ดีขึ้น 2", "ไม่ควรถูกเรียก"]);
  const result = await runAssistant(s.ask, "q", 2);
  expect(result).toEqual({ category: "question", answer: "ดีขึ้น 2", rounds: 2 });
  expect(s.prompts).toHaveLength(4);
});

test("คำถาม: ร่างแรกดีอยู่แล้ว (ปรับปรุงรอบแรกตอบ OK) ใช้ร่างเดิม", async () => {
  const s = scriptedAsk(["question", "ร่างดีแล้ว", "OK"]);
  const result = await runAssistant(s.ask, "q");
  expect(result).toEqual({ category: "question", answer: "ร่างดีแล้ว", rounds: 1 });
});

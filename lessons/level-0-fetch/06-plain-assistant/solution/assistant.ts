export type Ask = (prompt: string) => Promise<string>;

export type Category = "greeting" | "question";

export async function classify(ask: Ask, question: string): Promise<Category> {
  const raw = await ask(`จัดประเภทข้อความนี้ ตอบคำเดียว: greeting หรือ question\nข้อความ: ${question}`);
  return raw.trim().toLowerCase() === "greeting" ? "greeting" : "question";
}

export async function runAssistant(
  ask: Ask,
  question: string,
  maxRounds = 3,
): Promise<{ category: Category; answer: string; rounds: number }> {
  const category = await classify(ask, question);

  if (category === "greeting") {
    return { category, answer: "สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ", rounds: 0 };
  }

  let answer = await ask(question);
  let rounds = 0;

  while (rounds < maxRounds) {
    rounds++;
    const improved = await ask(`ปรับปรุงคำตอบนี้ให้ดีขึ้น ตอบด้วยคำตอบที่ปรับปรุงแล้วเท่านั้น แต่ถ้าดีอยู่แล้วให้ตอบคำว่า OK คำเดียว ห้ามใส่ OK ปนในคำตอบ:\n${answer}`);
    if (improved.trim() === "OK") break;
    answer = improved;
  }

  return { category, answer, rounds };
}

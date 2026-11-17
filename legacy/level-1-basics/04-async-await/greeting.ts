export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// จำลองการเรียกที่ใช้เวลา (เหมือนการเรียก LLM)
export async function fetchGreeting(name: string): Promise<string> {
  await delay(10);
  if (!name) throw new Error("ต้องมีชื่อ");
  return `สวัสดี ${name}`;
}

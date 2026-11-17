import { todo } from "@src/todo";

export interface Turn {
  role: "user" | "assistant";
  content: string;
}

interface ChatArgs {
  fetchFn: typeof fetch;
  url: string;
  apiKey: string;
  model: string;
  system: string; // คำสั่งตั้งต้น เช่น "ตอบสั้น ๆ"
  history: Turn[]; // บทสนทนาที่ผ่านมา
  question: string; // คำถามใหม่
}

// LLM "จำอะไรไม่ได้เลย" ทุกครั้งที่เรียกคือเริ่มใหม่ ความจำของแชตบอทคือการส่งบทสนทนาทั้งหมดไปให้ใหม่ทุกครั้ง
export async function chat({ fetchFn, url, apiKey, model, system, history, question }: ChatArgs): Promise<string> {
  // 👉 ข้อ 1: สร้าง array messages ตามลำดับ: ข้อความ system, ประวัติทั้งหมด, แล้วปิดท้ายด้วยคำถามใหม่ (role "user")
  //   ข้อความ system หน้าตา { role: "system", content: system }
  // แนวทาง: [{ role: "system", content: system }, ...history, { role: "user", content: question }]
  const messages = todo(1);

  // ส่วนที่เหลือคือโค้ดที่คุ้นเคยจากบท 0-01 (ให้มาแล้ว)
  const res = await fetchFn(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages }),
  });
  const data = await res.json();
  return data.choices[0].message.content;
}

// เพิ่มรอบสนทนาใหม่ (คำถามและคำตอบ) ต่อท้ายประวัติ โดยคืน array ใหม่ ไม่แก้ของเดิม
export function appendTurn(history: Turn[], question: string, answer: string): Turn[] {
  // 👉 ข้อ 2: คืน array ใหม่ = history ตามด้วย { role: "user", content: question } และ { role: "assistant", content: answer }
  return todo(2);
}

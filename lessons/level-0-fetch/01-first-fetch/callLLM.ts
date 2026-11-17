import { todo } from "@src/todo";

interface CallArgs {
  fetchFn: typeof fetch; // ตัวส่ง HTTP request (ของจริงคือ fetch ในตัว Node ตอนตรวจงานเราส่งตัวปลอมเข้ามา)
  url: string; // ที่อยู่ของ API
  apiKey: string; // รหัสของคุณ
  model: string; // ชื่อโมเดล
  question: string; // คำถาม
}

// เรียก LLM ด้วย HTTP ตรง ๆ ไม่ผ่านไลบรารีใด แล้วคืนข้อความคำตอบ
export async function callLLM({ fetchFn, url, apiKey, model, question }: CallArgs): Promise<string> {
  // 👉 ข้อ 1: ส่ง HTTP request แล้ว "รอ" ผล
  //   - method: "POST"
  //   - headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }
  //   - body: ข้อความ JSON ที่มี model และ messages (array ที่มีข้อความเดียว: { role: "user", content: question })
  // แนวทาง: const res = await fetchFn(url, {
  //           method: "POST",
  //           headers: { ... },
  //           body: JSON.stringify({ model, messages: [{ role: "user", content: question }] }),
  //         });
  const res = todo(1);

  // 👉 ข้อ 2: อ่านผลลัพธ์เป็น JSON แล้วคืนข้อความคำตอบ ซึ่งอยู่ที่ choices[0].message.content
  // แนวทาง: const data = await res.json();  แล้ว return data.choices[0].message.content;
  return todo(2);
}

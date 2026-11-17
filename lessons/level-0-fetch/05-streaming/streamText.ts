import { todo } from "@src/todo";

interface StreamArgs {
  fetchFn: typeof fetch;
  url: string;
  apiKey: string;
  model: string;
  question: string;
}

// ขอคำตอบแบบ stream (SSE): เซิร์ฟเวอร์ส่งทีละชิ้น แต่ละ event คือบรรทัด "data: {json}" ปิดท้ายด้วย "data: [DONE]"
// ฟังก์ชันนี้เป็น async generator: ใช้ yield ส่งข้อความทีละชิ้นออกไป ให้ผู้เรียกวน `for await` อ่านได้
export async function* streamText({ fetchFn, url, apiKey, model, question }: StreamArgs): AsyncGenerator<string> {
  const res = await fetchFn(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, stream: true, messages: [{ role: "user", content: question }] }),
  });

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    // 👉 ข้อ 1: เอาข้อมูลที่เพิ่งอ่านได้ต่อท้าย buffer แล้วแยกเป็นบรรทัด
    //   ข้อควรระวัง: การอ่านจากเครือข่าย "ไม่ตรงกับขอบเขตของบรรทัด" บรรทัดสุดท้ายอาจยังมาไม่ครบ
    //   จึงต้องเก็บบรรทัดสุดท้ายที่ยังไม่ครบไว้ใน buffer ไปต่อกับการอ่านรอบหน้า
    // แนวทาง: buffer += decoder.decode(value, { stream: true });
    //         const lines = buffer.split("\n");
    //         buffer = lines.pop() ?? "";   // บรรทัดสุดท้าย (อาจไม่ครบ) เก็บไว้
    const lines: string[] = todo(1);

    for (const line of lines) {
      // 👉 ข้อ 2: จัดการทีละบรรทัดที่ครบแล้ว
      //   - ข้ามบรรทัดที่ไม่ขึ้นต้นด้วย "data: " (เช่นบรรทัดว่าง)
      //   - ถ้าเป็น "data: [DONE]" ให้จบฟังก์ชัน (return)
      //   - นอกนั้นตัด "data: " ออกแล้ว JSON.parse ข้อความอยู่ที่ choices[0].delta.content
      //     ถ้าเป็น string และไม่ว่าง ให้ yield ออกไป (บาง chunk ไม่มี content เช่น chunk ความคิดของโมเดล)
      todo(2);
    }
  }
}

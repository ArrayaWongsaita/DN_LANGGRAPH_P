import { todo } from "@src/todo";

interface CallArgs {
  fetchFn: typeof fetch;
  url: string;
  apiKey: string;
  model: string;
  question: string;
}

// แปลง "เลขสถานะ HTTP" เป็นข้อความที่ผู้ใช้อ่านแล้วรู้ว่าต้องทำอะไรต่อ
// serverMessage = ข้อความใน body.error.message ที่เซิร์ฟเวอร์ส่งมา, retryAfter = ค่าจาก header retry-after (วินาที)
export function explainStatus(status: number, serverMessage: string, retryAfter?: string): string {
  // 👉 ข้อ 1: คืนข้อความไทยตามสถานะ
  //   401 -> บอกว่า API key ไม่ถูกต้องหรือยังไม่ได้ตั้ง ให้ตรวจ .env
  //   404 -> บอกว่าไม่พบโมเดลหรือบัญชีไม่มีสิทธิ์ แล้วต่อด้วย serverMessage
  //   429 -> บอกว่าเรียกถี่เกินโควตา ให้รอ ถ้ามี retryAfter ให้บอกจำนวนวินาทีที่ต้องรอ
  //   อื่น ๆ -> `HTTP ${status}: ${serverMessage}`
  // แนวทาง: ใช้ switch (status) { case 401: return "..."; ... default: return "..."; }
  return todo(1);
}

export async function callLLM({ fetchFn, url, apiKey, model, question }: CallArgs): Promise<string> {
  let res: Response;
  try {
    res = await fetchFn(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: [{ role: "user", content: question }] }),
    });
  } catch {
    // 👉 ข้อ 2: fetch ล้มเหลวทั้งที่ยังไม่ได้ response (เครือข่ายล่ม, URL ผิด) ให้ throw Error ข้อความไทยที่มีคำว่า "เชื่อมต่อ"
    //          เช่น "เชื่อมต่อ LLM ไม่ได้: ตรวจอินเทอร์เน็ตและ URL"
    todo(2);
  }

  if (!res.ok) {
    // 👉 ข้อ 3: response กลับมาแล้วแต่เป็น error
    //   - อ่าน body เป็น JSON แต่ต้องไม่พังซ้อนถ้า body ไม่ใช่ JSON: await res.json().catch(() => undefined)
    //   - ข้อความจากเซิร์ฟเวอร์อยู่ที่ body?.error?.message (ถ้าไม่มีใช้ "")
    //   - ค่า retry-after อยู่ที่ res.headers.get("retry-after") (อาจเป็น null)
    //   - throw new Error(explainStatus(res.status, ข้อความ, retryAfter ?? undefined))
    todo(3);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

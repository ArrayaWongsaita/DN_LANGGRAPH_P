import { todo } from "@src/todo";
import { describeProvider } from "@src/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 0-02  (ต้องตั้ง key ใน .env)
// เมื่อ request พัง ต้องบอกผู้ใช้ให้รู้เรื่องว่าต้องแก้อะไร: สคริปต์นี้แกล้งทำให้พังสามแบบ (key มั่ว โมเดลไม่มี URL ผิด) แล้วดูข้อความที่ได้
const { model, chatUrl, apiKey } = describeProvider();

// แปลง "เลขสถานะ HTTP" เป็นข้อความที่ผู้ใช้อ่านแล้วรู้ว่าต้องทำอะไรต่อ
// serverMessage = ข้อความใน body.error.message ที่เซิร์ฟเวอร์ส่งมา, retryAfter = ค่าจาก header retry-after (วินาที)
function explainStatus(status: number, serverMessage: string, retryAfter?: string): string {
  // 👉 ข้อ 1: คืนข้อความไทยตามสถานะ
  //   401 -> บอกว่า API key ไม่ถูกต้องหรือยังไม่ได้ตั้ง ให้ตรวจ .env
  //   404 -> บอกว่าไม่พบโมเดลหรือบัญชีไม่มีสิทธิ์ แล้วต่อด้วย serverMessage
  //   429 -> บอกว่าเรียกถี่เกินโควตา ให้รอ ถ้ามี retryAfter ให้บอกจำนวนวินาทีที่ต้องรอ
  //   อื่น ๆ -> `HTTP ${status}: ${serverMessage}`
  // แนวทาง: ใช้ switch (status) { case 401: return "..."; ... default: return "..."; }
  return todo(1);
}

// เรียก LLM หนึ่งครั้ง (เปลี่ยน url / apiKey / model ได้เพื่อแกล้งทำให้พัง) คืนข้อความคำตอบ หรือ throw Error ที่อ่านรู้เรื่อง
async function callLLM(url: string, key: string, modelName: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: modelName, messages: [{ role: "user", content: "ตอบว่า ok" }] }),
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

// รันสี่สถานการณ์ เก็บข้อความ error ไว้ดู (ไม่ให้สคริปต์ล้มทั้งไฟล์)
async function attempt(url: string, key: string, modelName: string): Promise<{ ok: boolean; text: string }> {
  try {
    return { ok: true, text: await callLLM(url, key, modelName) };
  } catch (e) {
    return { ok: false, text: e instanceof Error ? e.message : String(e) };
  }
}

const normal = await attempt(chatUrl, apiKey, model);
const badKey = await attempt(chatUrl, "key-มั่ว-ที่ใช้ไม่ได้", model);
const badModel = await attempt(chatUrl, apiKey, "model-that-does-not-exist");
const badUrl = await attempt("http://127.0.0.1:1/v1/chat/completions", apiKey, model); // พอร์ตที่ไม่มีใครฟังอยู่
console.log({ normal, badKey, badModel, badUrl });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("explainStatus 401: บอกให้ตรวจ key ใน .env", /key/i.test(explainStatus(401, "x")) && explainStatus(401, "x").includes(".env"));
check("explainStatus 404: บอกว่าไม่พบโมเดล และมีข้อความจากเซิร์ฟเวอร์", explainStatus(404, "model abc missing").includes("โมเดล") && explainStatus(404, "model abc missing").includes("model abc missing"));
check("explainStatus 429: บอกให้รอ และบอกจำนวนวินาทีถ้ารู้", explainStatus(429, "").includes("รอ") && explainStatus(429, "", "7").includes("7"));
check("explainStatus สถานะอื่น: แสดงเลขสถานะและข้อความจากเซิร์ฟเวอร์", explainStatus(500, "boom").includes("500") && explainStatus(500, "boom").includes("boom"));
check("เรียกปกติได้คำตอบ", normal.ok && normal.text.length > 0, "ตรวจ key ใน .env");
check("key มั่ว: ได้ Error ข้อความที่อ่านรู้เรื่อง (ไม่ใช่ JSON ดิบ)", !badKey.ok && badKey.text.length > 0 && !badKey.text.includes("[object"), "ตรวจ !res.ok แล้ว throw Error(explainStatus(...))");
check("โมเดลไม่มี: ได้ Error ที่มีข้อความจากเซิร์ฟเวอร์ประกอบ", !badModel.ok && badModel.text.length > 10, "ส่ง body.error.message เข้า explainStatus");
check("URL ผิด: ได้ Error ที่มีคำว่า 'เชื่อมต่อ'", !badUrl.ok && badUrl.text.includes("เชื่อมต่อ"), "ครอบ fetch ด้วย try/catch");

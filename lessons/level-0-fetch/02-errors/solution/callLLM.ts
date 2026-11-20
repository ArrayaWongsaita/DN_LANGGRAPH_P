import { check } from "@src/check";

// ใช้ Response ตัวอย่างและจำลองการเชื่อมต่อที่ล้มเหลว
const replies = [
  ["202", Response.json({ choices: [{ message: { content: "สวัสดี" } }] }, { status: 202 })],
  ["401", Response.json({ error: { message: "Invalid key" } }, { status: 401 })],
  ["404", Response.json({ error: { message: "Model unavailable" } }, { status: 404 })],
  ["429", new Response(null, { status: 429, headers: { "Retry-After": "7" } })],
  ["503", new Response("Maintenance", { status: 503, statusText: "Service Unavailable" })],
  ["เครือข่าย", null],
] as const;

const results: string[] = [];
for (const [label, reply] of replies) {
  // Promise มีพฤติกรรมเดียวกับ fetch ตรงที่ได้รับ Response หรือเชื่อมต่อไม่สำเร็จ
  const pending = reply ? Promise.resolve(reply) : Promise.reject(new TypeError("fetch failed"));
  const response = await pending.catch(() => undefined);

  let result: string;
  if (!response) {
    result = "เชื่อมต่อไม่ได้ ตรวจอินเทอร์เน็ตและ URL";
  } else {
    const succeeded = response.ok;
    if (succeeded) {
      const data = await response.json();
      result = data.choices[0].message.content;
    } else {
      const body = await response.json().catch(() => undefined);
      const message = body?.error?.message ?? response.statusText;
      const retryAfter = response.headers.get("Retry-After");

      switch (response.status) {
        case 401:
          result = "ตรวจ API key ใน .env";
          break;
        case 404:
          result = `ไม่พบโมเดลหรือปลายทาง (${message})`;
          break;
        case 429:
          result = retryAfter && /^\d+$/.test(retryAfter)
            ? `เรียกถี่เกินไป รอ ${retryAfter} วินาทีแล้วลองใหม่`
            : "เรียกถี่เกินไป รอแล้วลองใหม่";
          break;
        default:
          result = `HTTP ${response.status} ${message}`.trim();
      }
    }
  }

  results.push(result);
  console.log(`[${label}] ${result}`);
}

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
// ─────────────────────────────────────────────────────────────
const [success, unauthorized, notFound, limited, unavailable, network] = results;
check("อ่านคำตอบเมื่อได้สถานะในช่วง 2xx", success === "สวัสดี");
check("แยกปัญหา API key กับโมเดลที่หาไม่เจอ", unauthorized.includes(".env") && notFound.includes("Model unavailable"));
check("อ่านเวลารอจาก Retry-After", limited.includes("7 วินาที"));
check("ใช้สถานะได้แม้ body เป็นข้อความธรรมดา", unavailable.includes("503") && unavailable.includes("Service Unavailable"));
check("อธิบายกรณีที่ไม่ได้รับ Response", network.includes("เชื่อมต่อไม่ได้"));

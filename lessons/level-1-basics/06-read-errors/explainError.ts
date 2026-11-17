// แปลง error ที่เจอบ่อยตอนเรียก LLM ให้เป็นคำอธิบายภาษาไทยที่แก้ได้เอง
export function explainError(e: unknown): string {
  const err = (e ?? {}) as { status?: number; code?: string; message?: string };

  if (err.status === 401) {
    return "401: key ไม่ถูกต้อง ตรวจ OLLAMA_API_KEY ในไฟล์ .env (ไม่มีเครื่องหมายคำพูดหรือช่องว่างเกิน)";
  }
  if (err.status === 404) {
    return "404: ไม่พบปลายทาง ตรวจ OLLAMA_BASE_URL (baseUrl) ว่าเป็น https://ollama.com และห้ามต่อท้ายด้วย /api หรือชื่อโมเดลอาจผิด";
  }
  if (err.status === 429) {
    return "429: เรียกถี่เกินไปหรือโควตาหมด รอสักครู่แล้วลองใหม่";
  }
  if (err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") {
    return "เชื่อมต่อเครือข่ายไม่ได้: ตรวจอินเทอร์เน็ตและค่า OLLAMA_BASE_URL";
  }
  return err.message ?? String(e);
}

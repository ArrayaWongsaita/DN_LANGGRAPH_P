// อ่าน OLLAMA_API_KEY จาก environment (ส่ง env เข้ามาเพื่อให้ test ง่าย)
export function readKey(env: Record<string, string | undefined>): string {
  const key = (env.OLLAMA_API_KEY ?? "").trim();
  if (!key) {
    throw new Error(
      "ยังไม่ได้ตั้ง OLLAMA_API_KEY: สร้าง key ที่ https://ollama.com/settings/keys แล้วใส่ในไฟล์ .env",
    );
  }
  return key;
}

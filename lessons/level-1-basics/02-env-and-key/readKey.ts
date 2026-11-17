import { todo } from "@src/todo";

// อ่าน API key จากตัวแปร environment (เช่น process.env ที่ถูกเติมจากไฟล์ .env)
export function readKey(env: Record<string, string | undefined>, keyVar: string): string | undefined {
  // 👉 ข้อ 1: คืนค่าของ env[keyVar] ที่ตัดช่องว่างหัวท้ายแล้ว
  //          ถ้าไม่มีตัวแปร หรือว่างเปล่า ให้คืน undefined
  // แนวทาง: const value = env[keyVar]?.trim();  แล้วคืน value || undefined
  return todo(1);
}

// ซ่อน key ก่อนพิมพ์ลงจอ (ห้ามพิมพ์ key เต็มเด็ดขาด เพราะอาจหลุดตอนแคปหน้าจอ)
export function maskKey(key: string): string {
  // 👉 ข้อ 2: คืน 4 ตัวอักษรแรกของ key ตามด้วย "..."  เช่น "gsk_abc123" -> "gsk_..."
  //          ถ้า key สั้นกว่า 4 ตัว คืนแค่ "..."
  // แนวทาง: key.length < 4 ? "" : key.slice(0, 4)
  return todo(2);
}

// error จริงจาก provider หน้าตาไม่เหมือนกัน: ollama ใช้ status_code, fetch ที่ล้มใส่ code ไว้ใน cause
// ฟังก์ชันสองตัวนี้ทำให้ทุกที่อ่านค่าเดียวกันได้

type Loose = {
  status?: unknown;
  status_code?: unknown;
  response?: { status?: unknown };
  code?: unknown;
  cause?: { code?: unknown };
};

const asObject = (e: unknown): Loose => (typeof e === "object" && e !== null ? (e as Loose) : {});

export function errorStatus(e: unknown): number | undefined {
  const o = asObject(e);
  const value = o.status ?? o.status_code ?? o.response?.status;
  return typeof value === "number" ? value : undefined;
}

export function errorCode(e: unknown): string | undefined {
  const o = asObject(e);
  const value = o.code ?? o.cause?.code;
  return typeof value === "string" ? value : undefined;
}

interface CallArgs {
  fetchFn: typeof fetch;
  url: string;
  apiKey: string;
  model: string;
  question: string;
}

export function explainStatus(status: number, serverMessage: string, retryAfter?: string): string {
  switch (status) {
    case 401:
      return "API key ไม่ถูกต้องหรือยังไม่ได้ตั้ง: ตรวจค่าใน .env";
    case 404:
      return `ไม่พบโมเดลนี้หรือบัญชีของคุณไม่มีสิทธิ์ใช้ (ตรวจ LLM_MODEL): ${serverMessage}`;
    case 429:
      return retryAfter
        ? `เรียกถี่เกินโควตา รอ ${retryAfter} วินาทีแล้วลองใหม่`
        : "เรียกถี่เกินโควตา รอสักครู่แล้วลองใหม่";
    default:
      return `HTTP ${status}: ${serverMessage}`;
  }
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
    throw new Error("เชื่อมต่อ LLM ไม่ได้: ตรวจอินเทอร์เน็ตและ URL");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    const message = body?.error?.message ?? "";
    throw new Error(explainStatus(res.status, message, res.headers.get("retry-after") ?? undefined));
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

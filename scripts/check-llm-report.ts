export interface CheckResult {
  name: "basic" | "streaming" | "tools" | "structured";
  ok: boolean;
  detail: string;
}

const HINTS: Record<CheckResult["name"], string> = {
  basic: "เรียก LLM พื้นฐานไม่ได้: ตรวจ API key / ชื่อโมเดลใน .env ทุกบทที่ใช้ npm run lesson จะใช้ไม่ได้",
  streaming: "streaming ไม่ทำงาน: บท streaming อาจพังกับโมเดลนี้",
  tools: "tool calling ไม่ทำงาน: บทเรื่อง tools และ agent (Level 2) จะพังกับโมเดลนี้ ลองเปลี่ยน LLM_MODEL",
  structured: "structured output ไม่ทำงาน: บท structured output จะพังกับโมเดลนี้ ลองเปลี่ยน LLM_MODEL",
};

export function formatReport(provider: string, model: string, results: CheckResult[]): string {
  const lines = [`provider: ${provider}  model: ${model}`];
  for (const r of results) {
    lines.push(`${r.ok ? "✓" : "✗"} ${r.name}: ${r.detail}`);
  }
  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    lines.push("", "ข้อควรระวัง:");
    for (const r of failed) lines.push(`- ${HINTS[r.name]}`);
  }
  return lines.join("\n");
}

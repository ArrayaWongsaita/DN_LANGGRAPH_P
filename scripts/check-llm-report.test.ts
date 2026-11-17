import { formatReport, type CheckResult } from "./check-llm-report";

const ok = (name: CheckResult["name"]): CheckResult => ({ name, ok: true, detail: "ok" });

describe("formatReport", () => {
  const all: CheckResult[] = [ok("basic"), ok("streaming"), ok("tools"), ok("structured")];

  test("ทุกข้อผ่าน: มี ✓ สี่บรรทัด และไม่มีคำแนะนำ", () => {
    const text = formatReport("groq", "m1", all);
    expect(text.match(/✓/g)).toHaveLength(4);
    expect(text).not.toMatch(/✗/);
  });

  test("provider และโมเดลอยู่ในบรรทัดแรก", () => {
    const first = formatReport("groq", "m1", all).split("\n")[0];
    expect(first).toContain("groq");
    expect(first).toContain("m1");
  });

  test("tools ไม่ผ่าน: มี ✗ และคำแนะนำเรื่อง agent", () => {
    const results = all.map((r) => (r.name === "tools" ? { ...r, ok: false, detail: "no tool_calls" } : r));
    const text = formatReport("groq", "m1", results);
    expect(text).toMatch(/✗.*tools/);
    expect(text).toMatch(/agent/);
  });

  test("structured ไม่ผ่าน: คำแนะนำพูดถึง structured output", () => {
    const results = all.map((r) => (r.name === "structured" ? { ...r, ok: false, detail: "x" } : r));
    expect(formatReport("groq", "m1", results)).toMatch(/structured output/);
  });
});

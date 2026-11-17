import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { describeProvider, getLLM } from "../src/llm";
import { formatReport, type CheckResult } from "./check-llm-report";

// รันเอง: pnpm check:llm  (ยิง API จริง 4 ครั้ง) ใช้ดูว่า provider/โมเดลที่ตั้งใน .env รองรับอะไรบ้าง
async function attempt(name: CheckResult["name"], fn: () => Promise<string>): Promise<CheckResult> {
  try {
    return { name, ok: true, detail: await fn() };
  } catch (e) {
    return { name, ok: false, detail: e instanceof Error ? e.message.slice(0, 200) : String(e) };
  }
}

const info = describeProvider();
const llm = getLLM({ temperature: 0 });

const add = tool(({ a, b }: { a: number; b: number }) => String(a + b), {
  name: "add",
  description: "บวกเลขสองตัว",
  schema: z.object({ a: z.number(), b: z.number() }),
});

const results: CheckResult[] = [];

results.push(
  await attempt("basic", async () => {
    const reply = (await llm.invoke("ตอบว่า OK คำเดียว")).text;
    if (!reply.trim()) throw new Error("ได้คำตอบว่าง");
    return `ตอบว่า "${reply.trim().slice(0, 40)}"`;
  }),
);

results.push(
  await attempt("streaming", async () => {
    let chunks = 0;
    for await (const _ of await llm.stream("นับ 1 ถึง 5")) chunks++;
    if (chunks < 2) throw new Error(`ได้ chunk เดียว (${chunks})`);
    return `ได้ ${chunks} chunks`;
  }),
);

results.push(
  await attempt("tools", async () => {
    const res = await llm.bindTools!([add]).invoke("ใช้ tool add บวก 2 กับ 3");
    const calls = res.tool_calls ?? [];
    if (calls.length === 0) throw new Error("ไม่มี tool_calls ในคำตอบ");
    return `เรียก ${calls[0].name}(${JSON.stringify(calls[0].args)})`;
  }),
);

results.push(
  await attempt("structured", async () => {
    const out = await llm
      .withStructuredOutput(z.object({ name: z.string(), age: z.number() }))
      .invoke("คุณสมชาย อายุ 42 ปี");
    if (typeof out.name !== "string" || typeof out.age !== "number") throw new Error("รูปร่างผิด");
    return JSON.stringify(out);
  }),
);

console.log(formatReport(info.provider, info.model, results));
process.exit(results[0].ok ? 0 : 1);

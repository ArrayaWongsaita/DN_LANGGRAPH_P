import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { todo } from "@src/todo";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-08
// eval = ชุดข้อสอบที่รันซ้ำได้ ตอบว่า "ระบบของเราเก่งขึ้นหรือแย่ลง" เป็นตัวเลข มี scorer แบบกฎ (มีคำที่คาดหวังไหม) และแบบ "กรรมการ" (ให้ LLM ตัดสิน)
interface Case {
  input: string;
  expected: string;
}
type Scorer = (output: string, testCase: Case) => boolean | Promise<boolean>;

// scorer แบบกฎ: ผ่านเมื่อคำตอบ "มี" expected อยู่ (ไม่สนตัวพิมพ์เล็ก-ใหญ่)
const containsScorer: Scorer = (output, testCase) => {
  return output.toLowerCase().includes(testCase.expected.toLowerCase());
};

interface EvalResult {
  passed: number;
  total: number;
  rate: number;
  failures: string[]; // input ของข้อที่ไม่ผ่าน
}

async function runEval(run: (input: string) => Promise<string>, cases: Case[], scorer: Scorer): Promise<EvalResult> {
  const failures: string[] = [];
  for (const testCase of cases) {
    // 👉 ข้อ 1 const output = await run(testCase.input); ถ้า !(await scorer(output, testCase)) ให้ failures.push(testCase.input)
    // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
    //   const output = await run(testCase.input);
    //   if (!(await scorer(output, testCase))) failures.push(testCase.input);
    todo(1);
  }
  const total = cases.length;
  const passed = total - failures.length;
  return { passed, total, rate: total === 0 ? 0 : passed / total, failures };
}

// scorer แบบกรรมการ: ให้โมเดลตอบ PASS หรือ FAIL
function makeJudgeScorer(judge: BaseChatModel): Scorer {
  return async (output, testCase) => {
    const verdict = await judge.invoke(
      `คำถาม: ${testCase.input}\nคำตอบที่คาดหวัง: ${testCase.expected}\nคำตอบจริง: ${output}\nตอบ PASS หรือ FAIL เท่านั้น`,
    );
    return verdict.text.trim().toUpperCase().startsWith("PASS");
  };
}

// ส่วนที่ 1: ระบบจำลองที่ตอบถูก 2 ใน 3 (ผลเหมือนเดิมทุกครั้ง ใช้ตรวจ scorer และ runEval)
const cases: Case[] = [
  { input: "เมืองหลวงของไทย", expected: "กรุงเทพ" },
  { input: "2+2", expected: "4" },
  { input: "สีของท้องฟ้า", expected: "ฟ้า" },
];
const system = async (input: string) => (input === "2+2" ? "คำตอบคือ ห้า" : `ตอบ: ${input} คือ กรุงเทพ และ ฟ้า`);
const ruled = await runEval(system, cases, containsScorer);
const empty = await runEval(system, [], containsScorer);

// ส่วนที่ 2: กรรมการปลอมที่ตอบตามสคริปต์
const judge = fakeToolLLM(["PASS", " fail เพราะไม่ตรง", "", "PASS."]);
const scorer = makeJudgeScorer(judge);
const j1 = await scorer("ตอบ A", { input: "q1", expected: "A" });
const j2 = await scorer("ตอบ B", { input: "q2", expected: "A" });
const j3 = await scorer("a", { input: "q", expected: "a" }); // คำตัดสินว่าง: ถือว่าตก
const j4 = await scorer("a", { input: "q", expected: "a" }); // "PASS." มีจุดตามหลัง: ถือว่าผ่าน
const firstPrompt = judge.calls[0][0].text;

// ส่วนที่ 3: ของจริง: ให้ llm ตอบข้อสอบ แล้วตัดสินด้วยกฎและด้วยกรรมการ (llm ตัวเดียวกันรับบทกรรมการ)
const realRun = async (input: string) => (await llm.invoke(`${input} ตอบสั้น ๆ ภาษาไทย`)).text;
const realRuled = await runEval(realRun, cases, containsScorer);
const realJudged = await runEval(realRun, cases, makeJudgeScorer(llm));
console.log({ ruled, realRuled, realJudged });












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("scorer แบบกฎ: มีคำที่คาดหวัง = ผ่าน ไม่สนตัวพิมพ์", containsScorer("Hello World", { input: "", expected: "world" }) === true && containsScorer("Hello", { input: "", expected: "world" }) === false);
check("runEval: นับผ่าน/ไม่ผ่าน คิดอัตรา และบอกข้อที่ตก", ruled.total === 3 && ruled.passed === 2 && Math.abs(ruled.rate - 2 / 3) < 1e-9 && ruled.failures.join() === "2+2", "ดู failures: ข้อที่ scorer ตอบ false");
check("ชุดทดสอบว่าง: rate เป็น 0 ไม่ใช่ NaN", empty.rate === 0);
check("กรรมการ: PASS ผ่าน FAIL ตก", j1 === true && j2 === false, "ผ่านเมื่อข้อความขึ้นต้นด้วย PASS");
check("กรรมการ: คำตัดสินว่างตก ส่วน \"PASS.\" ผ่าน", j3 === false && j4 === true);
check("พรอมต์ของกรรมการมีทั้งคำถาม คำตอบที่คาดหวัง และคำตอบจริง", firstPrompt.includes("q1") && firstPrompt.includes("A") && firstPrompt.includes("ตอบ A"));
check("eval กับโมเดลจริงทำงานครบ 3 ข้อทั้งสองแบบ", realRuled.total === 3 && realJudged.total === 3, "ดูอัตราผ่านที่พิมพ์ไว้ (ผลของโมเดลจริงไม่แน่นอน)");

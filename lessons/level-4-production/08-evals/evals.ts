import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { todo } from "@src/todo";

export interface Case {
  input: string;
  expected: string;
}

export type Scorer = (output: string, testCase: Case) => boolean | Promise<boolean>;

// scorer แบบกฎ: ผ่านเมื่อคำตอบ "มี" expected อยู่ (ไม่สนตัวพิมพ์เล็ก-ใหญ่)
export const containsScorer: Scorer = (output, testCase) => {
  // 👉 ข้อ 1: คืน output.toLowerCase().includes(testCase.expected.toLowerCase())
  return todo(1);
};

export interface EvalResult {
  passed: number;
  total: number;
  rate: number;
  failures: string[]; // input ของข้อที่ไม่ผ่าน
}

export async function runEval(run: (input: string) => Promise<string>, cases: Case[], scorer: Scorer): Promise<EvalResult> {
  const failures: string[] = [];
  for (const testCase of cases) {
    // 👉 ข้อ 2: output = await run(testCase.input); ถ้า !(await scorer(output, testCase)) ให้ failures.push(testCase.input)
    todo(2);
  }
  const total = cases.length;
  const passed = total - failures.length;
  return { passed, total, rate: total === 0 ? 0 : passed / total, failures };
}

// scorer แบบกรรมการ: ให้โมเดลตอบ PASS หรือ FAIL
export function makeJudgeScorer(judge: BaseChatModel): Scorer {
  return async (output, testCase) => {
    // 👉 ข้อ 3: เรียก judge.invoke(`คำถาม: ${testCase.input}\nคำตอบที่คาดหวัง: ${testCase.expected}\nคำตอบจริง: ${output}\nตอบ PASS หรือ FAIL เท่านั้น`)
    //          ผ่านเมื่อข้อความที่ได้ (ตัดช่องว่าง, ตัวพิมพ์ใหญ่) ขึ้นต้นด้วย "PASS"
    return todo(3);
  };
}

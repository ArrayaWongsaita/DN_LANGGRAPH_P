import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

export interface Case {
  input: string;
  expected: string;
}

export type Scorer = (output: string, testCase: Case) => boolean | Promise<boolean>;

export const containsScorer: Scorer = (output, testCase) =>
  output.toLowerCase().includes(testCase.expected.toLowerCase());

export interface EvalResult {
  passed: number;
  total: number;
  rate: number;
  failures: string[];
}

export async function runEval(run: (input: string) => Promise<string>, cases: Case[], scorer: Scorer): Promise<EvalResult> {
  const failures: string[] = [];
  for (const testCase of cases) {
    const output = await run(testCase.input);
    if (!(await scorer(output, testCase))) failures.push(testCase.input);
  }
  const total = cases.length;
  const passed = total - failures.length;
  return { passed, total, rate: total === 0 ? 0 : passed / total, failures };
}

export function makeJudgeScorer(judge: BaseChatModel): Scorer {
  return async (output, testCase) => {
    const verdict = await judge.invoke(
      `คำถาม: ${testCase.input}\nคำตอบที่คาดหวัง: ${testCase.expected}\nคำตอบจริง: ${output}\nตอบ PASS หรือ FAIL เท่านั้น`,
    );
    return verdict.text.trim().toUpperCase().startsWith("PASS");
  };
}

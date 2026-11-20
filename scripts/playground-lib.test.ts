import { buildPlayground } from "./playground-lib";

const solution = `import { llm } from "../../02-llm-config/solution/llm"; // chat model
import { check } from "@src/check";

// รันด้วย: pnpm lesson 1-03
const question = "hi";
// ข้อ 1: ส่งให้ LLM
const reply = await llm.invoke(question);
console.log(reply.text);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้
// ─────────────────────────────────────────────────────────────
check("ok", true, "hint");
`;

const build = () =>
  buildPlayground({
    id: "1-03",
    lessonDir: "lessons/level-1-basics/03-first-llm-call",
    source: solution,
    ideas: ["เปลี่ยนคำถาม", "ลองถามเป็นภาษาอังกฤษ"],
  });

describe("buildPlayground", () => {
  test("ตัดส่วนตรวจและ import check ออก", () => {
    const out = build();
    expect(out).not.toContain("check(");
    expect(out).not.toContain("@src/check");
    expect(out).not.toContain("ส่วนตรวจคำตอบ");
  });

  test("import แบบ relative ถูกแปลงเป็น alias @lessons", () => {
    expect(build()).toContain('from "@lessons/level-1-basics/02-llm-config/solution/llm"');
  });

  test("คำสั่งรันเป็น pnpm play", () => {
    const out = build();
    expect(out).toContain("pnpm play 1-03");
    expect(out).not.toContain("pnpm lesson");
  });

  test("หัวไฟล์มีรายการให้ลอง", () => {
    const out = build();
    expect(out).toContain("1) เปลี่ยนคำถาม");
    expect(out).toContain("2) ลองถามเป็นภาษาอังกฤษ");
  });

  test("มีแต่ import ไม่มีโค้ดของเฉลย", () => {
    const out = build();
    expect(out).not.toContain("await llm.invoke(question)");
    expect(out).not.toContain("const question");
    expect(out).toContain("เขียนโค้ดของคุณตรงนี้");
  });
});

describe("buildPlayground: import handling", () => {
  const make = (source: string) => buildPlayground({ id: "2-01", lessonDir: "lessons/level-2-x/01-a", source, ideas: ["x"] });

  test("playground ของ Level 2 ใช้โมเดลที่ผู้เรียนตั้งในบท 1-02", () => {
    const out = make(`import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";\nawait llm.invoke("สวัสดี");\n`);
    expect(out).toContain('from "@lessons/level-1-basics/02-llm-config/llm"');
    expect(out).toContain("ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02");
  });

  test("import หลายบรรทัดถูกเก็บครบ", () => {
    const out = make(`import {\n  START,\n  END,\n} from "@langchain/langgraph";\nconst a = START;\n// ส่วนตรวจคำตอบ\n`);
    expect(out).toContain('  START,\n  END,\n} from "@langchain/langgraph";');
  });

  test("ตัด import ที่ใช้แค่ในส่วนตรวจ", () => {
    const out = make(`import { END } from "x";\nimport { fake } from "y";\nconst a = END;\n// ─────\n// ส่วนตรวจคำตอบ\n// ─────\nfake();\n`);
    expect(out).toContain('import { END } from "x"');
    expect(out).not.toContain('from "y"');
  });

  test("บอกสิ่งที่ต้องใช้เมื่อเฉลยใช้ Postgres", () => {
    expect(make(`import { a } from "x";\nconst u = process.env.DATABASE_URL; a;\n`)).toContain("ต้องใช้: Postgres");
  });

  test("import แบบ alias และ side-effect", () => {
    const out = make(`import { A as B } from "x";\nimport "dotenv/config";\nB();\n`);
    expect(out).toContain('import { A as B } from "x"');
    expect(out).toContain('import "dotenv/config"');
  });
});

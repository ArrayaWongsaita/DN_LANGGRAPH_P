// รันด้วย pnpm exec tsx lessons/level-2-practical/08-define-tool/solution/tools.ts
import { tool, ToolInputParsingException } from "@langchain/core/tools";
import { z } from "zod";
import { check } from "@src/check";

const addSchema = z.object({ a: z.number(), b: z.number() });
const add = tool(({ a, b }) => String(a + b), {
  name: "add",
  description: "บวกเลขสองจำนวน",
  schema: addSchema,
});

const sum = await add.invoke({ a: 2, b: 3 });
console.log(sum, typeof sum);

// จำลอง JSON จากภายนอกเพื่อให้ schema ได้ตรวจค่าตอนรัน
const rawArgs = JSON.parse('{"a":"2","b":3}');
let rejected = false;
try {
  await add.invoke(rawArgs);
} catch (error) {
  if (!(error instanceof ToolInputParsingException)) throw error;
  rejected = true;
  console.log("ToolInputParsingException");
}

// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
check("บวก 2 กับ 3 ได้สตริง 5", sum === "5");
check("schema ปฏิเสธ a เมื่อได้สตริง", rejected, "ใช้ z.number() สำหรับ a และ b");

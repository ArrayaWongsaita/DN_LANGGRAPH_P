import { tool } from "@langchain/core/tools";
import { todo } from "@src/todo";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-08  (ไม่ใช้ LLM)
// tool = ฟังก์ชันธรรมดา + ชื่อ + คำอธิบาย + schema ของ argument เพื่อให้ LLM รู้ว่าเรียกอะไรได้และต้องส่งอะไร

// 👉 ข้อ 1: schema ของ tool add ที่รับ { a: number, b: number }
// แนวทาง: z.object({ a: z.number(), b: z.number() })
const addSchema = todo(1);
const addTool = tool(
  ({ a, b }: { a: number; b: number }) => {
    // 👉 ข้อ 2: คืนผลบวกเป็นสตริง (tool คืนค่าเป็นข้อความ)
    // แนวทาง: return String(a + b);
    return todo(2);
  },
  { name: "add", description: "บวกเลขสองจำนวน คืนผลบวก", schema: addSchema },
);

const WEATHER: Record<string, string> = {
  เชียงใหม่: "อากาศเย็น 22 องศา",
  กรุงเทพ: "ร้อนอบอ้าว 35 องศา",
};

const weatherTool = tool(
  ({ city }: { city: string }) => {
    // 👉 ข้อ 3: คืนค่าจาก WEATHER[city] ถ้าไม่มีเมืองนั้นให้คืน "ไม่มีข้อมูลของ " ตามด้วยชื่อเมือง
    // แนวทาง: return WEATHER[city] ?? `ไม่มีข้อมูลของ ${city}`;
    return todo(3);
  },
  {
    name: "getWeather",
    description: "ดูอากาศปัจจุบันของเมืองที่ระบุ (ชื่อเมืองเป็นภาษาไทย)",
    schema: z.object({ city: z.string().describe("ชื่อเมือง") }),
  },
);

// ลองเรียก tool ตรง ๆ (ยังไม่ผ่าน LLM)
const sum = await addTool.invoke({ a: 2, b: 3 });
const chiangMai = await weatherTool.invoke({ city: "เชียงใหม่" });
const unknown = await weatherTool.invoke({ city: "ภูเก็ต" });
let rejected = false;
try {
  await addTool.invoke({ a: "สอง", b: 3 } as never);
} catch {
  rejected = true;
}
console.log("add(2, 3) =", sum);
console.log("getWeather(เชียงใหม่) =", chiangMai);
console.log("getWeather(ภูเก็ต) =", unknown);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("add มีชื่อและคำอธิบาย", addTool.name === "add" && addTool.description.length > 0);
check("add: 2 + 3 = '5' (ผลเป็นสตริง)", sum === "5", "คืน String(a + b)");
check("add: argument ผิดชนิดถูก schema ปฏิเสธ", rejected, "schema ต้องเป็น z.number() ทั้ง a และ b");
check("getWeather: เมืองที่มีในตาราง", chiangMai === "อากาศเย็น 22 องศา");
check("getWeather: เมืองที่ไม่มีในตาราง", unknown === "ไม่มีข้อมูลของ ภูเก็ต");

import { tool } from "@langchain/core/tools";
import { todo } from "@src/todo";
import { z } from "zod";

export function makeAddTool() {
  // 👉 ข้อ 1: schema ที่รับ { a: number, b: number }
  // แนวทาง: z.object({ a: z.number(), b: z.number() })
  const schema = todo(1);
  return tool(
    ({ a, b }: { a: number; b: number }) => {
      // 👉 ข้อ 2: คืนผลบวกเป็นสตริง
      return todo(2);
    },
    { name: "add", description: "บวกเลขสองจำนวน คืนผลบวก", schema },
  );
}

const WEATHER: Record<string, string> = {
  เชียงใหม่: "อากาศเย็น 22 องศา",
  กรุงเทพ: "ร้อนอบอ้าว 35 องศา",
};

export function makeWeatherTool() {
  return tool(
    ({ city }: { city: string }) => {
      // 👉 ข้อ 3: คืนค่าจาก WEATHER[city] ถ้าไม่มีเมืองนั้นให้คืน "ไม่มีข้อมูลของ " ตามด้วยชื่อเมือง
      return todo(3);
    },
    {
      name: "getWeather",
      description: "ดูอากาศปัจจุบันของเมืองที่ระบุ (ชื่อเมืองเป็นภาษาไทย)",
      schema: z.object({ city: z.string().describe("ชื่อเมือง") }),
    },
  );
}

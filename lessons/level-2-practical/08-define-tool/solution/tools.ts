import { tool } from "@langchain/core/tools";
import { z } from "zod";

export function makeAddTool() {
  const schema = z.object({ a: z.number(), b: z.number() });
  return tool(({ a, b }: { a: number; b: number }) => String(a + b), {
    name: "add",
    description: "บวกเลขสองจำนวน คืนผลบวก",
    schema,
  });
}

const WEATHER: Record<string, string> = {
  เชียงใหม่: "อากาศเย็น 22 องศา",
  กรุงเทพ: "ร้อนอบอ้าว 35 องศา",
};

export function makeWeatherTool() {
  return tool(({ city }: { city: string }) => WEATHER[city] ?? `ไม่มีข้อมูลของ ${city}`, {
    name: "getWeather",
    description: "ดูอากาศปัจจุบันของเมืองที่ระบุ (ชื่อเมืองเป็นภาษาไทย)",
    schema: z.object({ city: z.string().describe("ชื่อเมือง") }),
  });
}

import { tool } from "@langchain/core/tools";
import { z } from "zod";

// tool ตัวอย่างสำหรับบทเรียนใน Level 2 (บท 2-08 ให้ผู้เรียนเขียนเอง บทอื่นใช้จากไฟล์นี้)
export function makeAddTool() {
  return tool(({ a, b }: { a: number; b: number }) => String(a + b), {
    name: "add",
    description: "บวกเลขสองจำนวน คืนผลบวก",
    schema: z.object({ a: z.number(), b: z.number() }),
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

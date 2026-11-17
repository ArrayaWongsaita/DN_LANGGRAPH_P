import { defineConfig } from "vitest/config";

// ใช้โดย scripts/check-lessons.ts: รัน checker ของบทที่ระบุ (ไม่จำกัดโฟลเดอร์)
export default defineConfig({
  resolve: { alias: { "@src": new URL("./src", import.meta.url).pathname } },
  test: {
    globals: true,
    include: ["**/*.test.ts"],
    exclude: ["**/node_modules/**"],
  },
});

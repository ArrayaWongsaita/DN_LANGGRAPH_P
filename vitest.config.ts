import { defineConfig } from "vitest/config";

// Learner config: runs exercises (solution/ folders are excluded).
export default defineConfig({
  test: {
    globals: true,
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts", "lessons/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/solution/**"],
  },
});

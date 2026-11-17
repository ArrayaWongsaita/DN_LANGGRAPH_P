import { defineConfig } from "vitest/config";

// Maintainer config: runs only solutions and shared src tests.
export default defineConfig({
  test: {
    globals: true,
    include: ["src/**/*.test.ts", "lessons/**/solution/**/*.test.ts"],
    exclude: ["**/node_modules/**"],
  },
});

import { defineConfig } from "vitest/config";

// Learner/default config. `npm test` filters to src + scripts; `npm run test:lesson NN` runs one lesson.
export default defineConfig({
  resolve: { alias: { "@src": new URL("./src", import.meta.url).pathname } },
  test: {
    globals: true,
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts", "lessons/**/*.test.ts"],
    exclude: [
      "**/node_modules/**",
      "**/solution/**",
      "scripts/lesson-template/**",
      "scripts/fixtures/**",
      "legacy/**",
      ".tmp-check/**",
    ],
  },
});

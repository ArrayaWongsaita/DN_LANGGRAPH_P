import { lintLessons } from "./lint-lessons";

const problems = lintLessons("lessons");
if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("lessons OK");

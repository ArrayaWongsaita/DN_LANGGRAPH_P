import { checkLessons, type CheckMode } from "./check-lessons";

const mode = process.argv[process.argv.indexOf("--mode") + 1] as CheckMode;
if (mode !== "solutions" && mode !== "starters") {
  console.error("usage: check-lessons-cli --mode solutions|starters");
  process.exit(2);
}
const result = checkLessons("lessons", mode);
if (!result.ok) {
  console.error(result.problems.join("\n"));
  process.exit(1);
}
console.log(`${mode}: OK`);

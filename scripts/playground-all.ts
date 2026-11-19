import { ensurePlayground } from "./playground-files";
import { playgroundIdeas } from "./playground-ideas";

// Rebuild every playground from its solution (maintainers: `pnpm playground:build`). Overwrites edits.
for (const id of Object.keys(playgroundIdeas)) console.log(ensurePlayground(id, true).file);

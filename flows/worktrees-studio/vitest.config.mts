import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// scripts/sync-screens-tree.ts is a Bun-first module using import.meta.dir.
// esbuild `define` statically rewrites it so the pure audit helpers are
// importable under vitest (node). The import.meta.main CLI guard stays
// falsy under vitest, so no sync runs on import.
export default defineConfig({
  define: {
    "import.meta.dir": JSON.stringify(path.join(rootDir, "scripts")),
  },
});

import { defineConfig } from "vitest/config";
import { readFileSync } from "node:fs";
import path from "node:path";

// Load .env.test so `@/lib/db` (a singleton that reads DATABASE_URL at import)
// connects to the isolated local test database — never production.
const testEnv: Record<string, string> = {};
try {
  for (const line of readFileSync(path.resolve(process.cwd(), ".env.test"), "utf8").split("\n")) {
    if (line.trimStart().startsWith("#")) continue;
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    testEnv[m[1]] = v;
  }
} catch {
  throw new Error("Missing .env.test — run `npm run test:setup` to create the test database.");
}

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(process.cwd(), ".") },
  },
  test: {
    environment: "node",
    env: testEnv,
    include: ["tests/**/*.test.ts"],
    // The suite shares one test database, so keep files serial; a clean-slate
    // truncate runs before each test.
    fileParallelism: false,
    hookTimeout: 30000,
    testTimeout: 30000,
  },
});

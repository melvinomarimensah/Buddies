/**
 * Creates the local isolated test database and applies all migrations to it.
 * Reads connection details from .env.test. Safe to re-run.
 *
 *   npm run test:setup
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

let raw;
try {
  raw = readFileSync(".env.test", "utf8");
} catch {
  console.error(
    "Missing .env.test. Create it with local DATABASE_URL/DIRECT_URL pointing at a\n" +
      "throwaway Postgres database (e.g. postgresql://<you>@localhost:5432/buddies_test)."
  );
  process.exit(1);
}

const env = { ...process.env };
for (const line of raw.split("\n")) {
  if (line.trimStart().startsWith("#")) continue;
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (!m) continue;
  let v = m[2].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  env[m[1]] = v;
}

// Derive the database name from the URL and create it if missing.
const dbName = new URL(env.DATABASE_URL).pathname.replace(/^\//, "").split("?")[0];
try {
  execSync(`createdb ${dbName}`, { stdio: "ignore" });
  console.log(`Created database ${dbName}.`);
} catch {
  console.log(`Database ${dbName} already exists — reusing it.`);
}

// prisma.config loads the prod .env; override with the test env so migrations
// land on the test database.
execSync("npx prisma migrate deploy", { stdio: "inherit", env });
console.log("\nTest database is ready.");

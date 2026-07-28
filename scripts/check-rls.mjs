/**
 * Fails (exit 1) if any table in the public schema has Row Level Security
 * disabled. This is the safety net for the Supabase footgun where a newly
 * created table ships with RLS OFF and becomes world-readable through the
 * public anon REST/Realtime API.
 *
 * Run locally with `npm run check:rls`. Safe, read-only.
 */
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

// Load .env for local runs without overriding real env (CI/Vercel already set it).
try {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    if (line.trimStart().startsWith("#")) continue;
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
} catch {
  // No .env file (e.g. CI) — rely on the ambient environment.
}

const prisma = new PrismaClient();
try {
  const unprotected = await prisma.$queryRawUnsafe(`
    SELECT c.relname AS table
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname <> '_prisma_migrations'
      AND c.relrowsecurity = false
    ORDER BY c.relname;
  `);

  if (unprotected.length > 0) {
    console.error("\n❌ RLS is DISABLED on these public tables — they are exposed via the anon API:");
    for (const row of unprotected) console.error(`   • ${row.table}`);
    console.error(
      "\nFix: add a migration with `ALTER TABLE public.\"<Table>\" ENABLE ROW LEVEL SECURITY;`\n"
    );
    process.exit(1);
  }

  console.log("✅ RLS enabled on all public tables. Public anon API is locked down.");
} finally {
  await prisma.$disconnect();
}

import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  engine: "classic",
  // Migrations use the schema's `directUrl` (session pooler / port 5432),
  // which supports prepared statements. Overriding `datasource.url` here would
  // force migrations onto the transaction pooler and break with pgBouncer.
  datasource: {
    url: env("DIRECT_URL"),
  },
});

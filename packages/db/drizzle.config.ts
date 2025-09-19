// packages/db/drizzle.config.ts
import type { Config } from "drizzle-kit";
import "dotenv/config";

export default {
  schema: "./schema.ts",
  out: "./migrations",
  dialect: "postgresql",   // ✅ use this instead of driver
  dbCredentials: {
    url: process.env.DATABASE_URL!, // ✅ some versions expect "url", not "connectionString"
  },
} satisfies Config;

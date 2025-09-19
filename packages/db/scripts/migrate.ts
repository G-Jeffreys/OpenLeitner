// packages/db/scripts/migrate.ts
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

import * as schema from "../schema";
import "dotenv/config";

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  const db = drizzle(client, { schema });

  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./migrations" });

  await client.end();
  console.log("Migrations complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

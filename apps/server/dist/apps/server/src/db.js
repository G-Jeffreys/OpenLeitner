import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from './config.js';
// IMPORTANT: import your schema from packages/db
// e.g., import { users, decks, cards, cardState, reviews } from '@leitner/db/schema';
import * as schema from '@leitner/db/schema';
const pool = new Pool({ connectionString: config.dbUrl });
export const db = drizzle(pool, { schema });
// Helpful for graceful shutdown
export async function closeDb() {
    await pool.end();
}
//# sourceMappingURL=db.js.map
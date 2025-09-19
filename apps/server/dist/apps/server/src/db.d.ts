import { Pool } from 'pg';
import * as schema from '@leitner/db/schema';
export declare const db: import("drizzle-orm/node-postgres").NodePgDatabase<typeof schema> & {
    $client: Pool;
};
export declare function closeDb(): Promise<void>;
//# sourceMappingURL=db.d.ts.map
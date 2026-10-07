import { sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { DDL } from "./schema.ts";
import * as schema from "./schema.ts";

export { schema };
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

/**
 * Connect to Cloud SQL Postgres when `databaseUrl` is set (use the Cloud Run Cloud SQL connector socket URL),
 * otherwise an embedded PGlite instance so `bun dev` and the tests need no database server.
 */
export async function connectDb(databaseUrl: string): Promise<{ db: Db; close: () => Promise<void> }> {
  let db: Db;
  let close: () => Promise<void>;
  if (databaseUrl) {
    const [{ drizzle }, { default: pg }] = await Promise.all([import("drizzle-orm/node-postgres"), import("pg")]);
    const pool = new pg.Pool({ connectionString: databaseUrl, max: 5 });
    db = drizzle(pool, { schema }) as unknown as Db;
    close = () => pool.end();
  } else {
    const [{ drizzle }, { PGlite }] = await Promise.all([import("drizzle-orm/pglite"), import("@electric-sql/pglite")]);
    const client = new PGlite();
    db = drizzle(client, { schema }) as unknown as Db;
    close = () => client.close();
  }
  for (const stmt of DDL) await db.execute(sql.raw(stmt));
  return { db, close };
}

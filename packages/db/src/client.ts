import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

export type Database = LibSQLDatabase<typeof schema>;

let cachedClient: Client | undefined;
let cachedDb: Database | undefined;

export function getDb(url?: string, authToken?: string): Database {
  if (cachedDb) {
    return cachedDb;
  }
  if (!url) {
    throw new Error(
      "TURSO_DATABASE_URL is not configured. Set it in .env before using the database.",
    );
  }

  cachedClient = createClient({
    url,
    authToken,
  });
  cachedDb = drizzle(cachedClient, { schema });
  return cachedDb;
}

export { schema };

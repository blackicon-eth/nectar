import { eq, inArray, sql } from "drizzle-orm";
import { getConfig } from "@nectar/config";
import { getDb, schema } from "@nectar/db";

export type Profile = {
  walletAddress: string;
  displayName: string | null;
  avatarData: string | null;
};

let tableReady: Promise<void> | undefined;

function db() {
  const config = getConfig();
  return getDb(config.turso.url, config.turso.authToken);
}

export async function ensureProfileTable(): Promise<void> {
  if (!tableReady) {
    tableReady = db().run(sql`CREATE TABLE IF NOT EXISTS profiles (
      wallet_address TEXT PRIMARY KEY NOT NULL,
      display_name TEXT,
      avatar_data TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`).then(() => undefined);
  }
  await tableReady;
}

export async function getProfile(walletAddress: string): Promise<Profile | null> {
  await ensureProfileTable();
  const rows = await db()
    .select({
      walletAddress: schema.profiles.walletAddress,
      displayName: schema.profiles.displayName,
      avatarData: schema.profiles.avatarData,
    })
    .from(schema.profiles)
    .where(eq(schema.profiles.walletAddress, walletAddress.toLowerCase()))
    .limit(1);
  return rows[0] ?? null;
}

export async function saveProfile(
  walletAddress: string,
  values: { displayName: string | null; avatarData: string | null },
): Promise<Profile> {
  await ensureProfileTable();
  const normalizedAddress = walletAddress.toLowerCase();
  await db()
    .insert(schema.profiles)
    .values({
      walletAddress: normalizedAddress,
      displayName: values.displayName,
      avatarData: values.avatarData,
    })
    .onConflictDoUpdate({
      target: schema.profiles.walletAddress,
      set: {
        displayName: values.displayName,
        avatarData: values.avatarData,
        updatedAt: new Date(),
      },
    });
  return (await getProfile(normalizedAddress))!;
}

export async function getProfiles(walletAddresses: string[]): Promise<Map<string, Profile>> {
  const addresses = [...new Set(walletAddresses.map((address) => address.toLowerCase()).filter(Boolean))];
  if (addresses.length === 0) return new Map();
  await ensureProfileTable();
  const rows = await db()
    .select({
      walletAddress: schema.profiles.walletAddress,
      displayName: schema.profiles.displayName,
      avatarData: schema.profiles.avatarData,
    })
    .from(schema.profiles)
    .where(inArray(schema.profiles.walletAddress, addresses));
  return new Map(rows.map((profile) => [profile.walletAddress, profile]));
}

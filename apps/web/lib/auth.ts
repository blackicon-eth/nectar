import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { getDb, schema } from "@nectar/db";
import { getConfig } from "@nectar/config";

const NONCE_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const SESSION_COOKIE = "nectar_session";
let tablesReady: Promise<void> | undefined;

function db() {
  const config = getConfig();
  return getDb(config.turso.url, config.turso.authToken);
}

async function ensureTables(): Promise<void> {
  if (!tablesReady) {
    tablesReady = Promise.all([
      db().run(sql`CREATE TABLE IF NOT EXISTS auth_nonces (
        nonce TEXT PRIMARY KEY NOT NULL,
        wallet_address TEXT NOT NULL,
        chain_id INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        consumed_at INTEGER
      )`),
      db().run(sql`CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY NOT NULL,
        wallet_address TEXT NOT NULL,
        chain_id INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        revoked_at INTEGER
      )`),
    ]).then(() => undefined);
  }
  await tablesReady;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function sessionCookieName(): string {
  return SESSION_COOKIE;
}

export async function createAuthNonce(
  walletAddress: string,
  chainId: number,
): Promise<{ nonce: string; expiresAt: Date }> {
  await ensureTables();
  const expiresAt = new Date(Date.now() + NONCE_TTL_MS);
  const nonce = randomBytes(24).toString("hex");
  await db().insert(schema.authNonces).values({
    nonce,
    walletAddress: walletAddress.toLowerCase(),
    chainId,
    expiresAt,
  });
  return { nonce, expiresAt };
}

export async function consumeAuthNonce(
  nonce: string,
  walletAddress: string,
  chainId: number,
): Promise<boolean> {
  await ensureTables();
  const now = new Date();
  const rows = await db()
    .select()
    .from(schema.authNonces)
    .where(
      and(
        eq(schema.authNonces.nonce, nonce),
        eq(schema.authNonces.walletAddress, walletAddress.toLowerCase()),
        eq(schema.authNonces.chainId, chainId),
        isNull(schema.authNonces.consumedAt),
        gt(schema.authNonces.expiresAt, now),
      ),
    )
    .limit(1);
  if (!rows[0]) return false;
  await db()
    .update(schema.authNonces)
    .set({ consumedAt: now })
    .where(eq(schema.authNonces.nonce, nonce));
  return true;
}

export async function createSession(
  walletAddress: string,
  chainId: number,
): Promise<{ token: string; expiresAt: Date }> {
  await ensureTables();
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  await db().insert(schema.sessions).values({
    tokenHash: hashToken(token),
    walletAddress: walletAddress.toLowerCase(),
    chainId,
    createdAt: now,
    expiresAt,
  });
  return { token, expiresAt };
}

export async function getSession(token: string | undefined) {
  if (!token) return null;
  await ensureTables();
  const rows = await db()
    .select()
    .from(schema.sessions)
    .where(
      and(
        eq(schema.sessions.tokenHash, hashToken(token)),
        isNull(schema.sessions.revokedAt),
        gt(schema.sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function revokeSession(token: string | undefined): Promise<void> {
  if (!token) return;
  await ensureTables();
  await db()
    .update(schema.sessions)
    .set({ revokedAt: new Date() })
    .where(eq(schema.sessions.tokenHash, hashToken(token)));
}

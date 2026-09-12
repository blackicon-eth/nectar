import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const authNonces = sqliteTable("auth_nonces", {
  nonce: text("nonce").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  chainId: integer("chain_id").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  consumedAt: integer("consumed_at", { mode: "timestamp_ms" }),
});

export const sessions = sqliteTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  chainId: integer("chain_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
});

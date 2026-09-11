import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { timestamps } from "./common";

export const creators = sqliteTable("creators", {
  id: text("id").primaryKey(),
  privyUserId: text("privy_user_id").notNull().unique(),
  walletAddress: text("wallet_address").notNull().unique(),
  ensName: text("ens_name").unique(),
  ensNode: text("ens_node"),
  ...timestamps,
});

import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps } from "./common";

export const profiles = sqliteTable("profiles", {
  walletAddress: text("wallet_address").primaryKey(),
  displayName: text("display_name"),
  avatarData: text("avatar_data"),
  ...timestamps,
});

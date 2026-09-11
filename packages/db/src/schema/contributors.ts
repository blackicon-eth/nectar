import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { timestamps } from "./common";
import { creators } from "./creators";

export const contributors = sqliteTable("contributors", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => creators.id),
  privyUserId: text("privy_user_id").notNull(),
  walletAddress: text("wallet_address"),
  displayName: text("display_name"),
  status: text("status").notNull().default("active"),
  ...timestamps,
});

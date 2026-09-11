import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const cache = sqliteTable("cache", {
  key: text("key").primaryKey(),
  value: text("value"),
  blob: text("blob", { mode: "json" }),
  ttl: integer("ttl", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }),
});

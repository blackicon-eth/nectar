import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  payload: text("payload").notNull().default("{}"),
  status: text("status").notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  runAt: integer("run_at", { mode: "timestamp" }),
  lastError: text("last_error"),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

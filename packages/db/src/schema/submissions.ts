import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { timestamps } from "./common";
import { creators } from "./creators";
import { contributors } from "./contributors";

export const submissions = sqliteTable("submissions", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => creators.id),
  contributorId: text("contributor_id").references(() => contributors.id),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  content: text("content").notNull(),
  tags: text("tags").notNull().default("[]"),
  premium: integer("premium", { mode: "boolean" }).notNull().default(false),
  status: text("status").notNull().default("draft"),
  rejectionReason: text("rejection_reason"),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  ...timestamps,
});

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { timestamps } from "./common";
import { creators } from "./creators";
import { contributors } from "./contributors";

export const articles = sqliteTable("articles", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => creators.id),
  contributorId: text("contributor_id").references(() => contributors.id),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  premium: integer("premium", { mode: "boolean" }).notNull().default(false),
  swarmRef: text("swarm_ref").notNull(),
  arkivEntityId: text("arkiv_entity_id"),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  ...timestamps,
});

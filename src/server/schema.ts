import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  draft: boolean("draft").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const postText = pgTable("post_text", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  index: integer("index").notNull(),
  content: text("content").notNull(),
});

export const postImages = pgTable("post_images", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  index: integer("index").notNull(),
  slug: text("slug").notNull(),
});

import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

export const contentTypeEnum = pgEnum("contentType", ["text", "image", "video"])

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  draft: boolean("draft").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const postContent = pgTable("post_content", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  contentType: contentTypeEnum(),
  data: text("data").notNull(),
});

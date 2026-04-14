CREATE TYPE "public"."contentType" AS ENUM('text', 'image', 'video');--> statement-breakpoint
CREATE TABLE "post_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"contentType" "contentType",
	"data" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"draft" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "post_content" ADD CONSTRAINT "post_content_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
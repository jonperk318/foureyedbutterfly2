CREATE TABLE "post_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"index" integer NOT NULL,
	"slug" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_text" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"index" integer NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"draft" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "post_images" ADD CONSTRAINT "post_images_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_text" ADD CONSTRAINT "post_text_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
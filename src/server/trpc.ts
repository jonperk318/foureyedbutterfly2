import { initTRPC } from "@trpc/server";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { z } from "zod";
import { db } from "./db";
import { posts, postText, postImages } from "./schema";
import { eq, asc } from "drizzle-orm";

const createTRPContext = ({ req, res }: CreateExpressContextOptions) => ({});

type TRPCContext = Awaited<ReturnType<typeof createTRPContext>>;

const t = initTRPC.context<TRPCContext>().create();

export const appRouter = t.router({
  hello: t.procedure.query(() => "Hello world!"),

  posts: t.procedure
    .input(z.object({ limit: z.number().default(10) }).optional())
    .query(async (opts) => {
      const limit = opts.input?.limit ?? 10;
      return await db.select().from(posts).limit(limit);
    }),

  getPost: t.procedure
    .input(z.union([z.string(), z.number()]))
    .query(async (opts) => {
      const postId = typeof opts.input === "string"
        ? parseInt(opts.input, 10)
        : opts.input;

      // Get the post
      const postResult = await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (!postResult[0]) {
        return null;
      }

      const post = postResult[0];

      // Get all text blocks for this post
      const textBlocksResult = await db
        .select()
        .from(postText)
        .where(eq(postText.postId, postId))
        .orderBy(asc(postText.index));

      // Get all image blocks for this post
      const imageBlocksResult = await db
        .select()
        .from(postImages)
        .where(eq(postImages.postId, postId))
        .orderBy(asc(postImages.index));

      // Return structured response
      return {
        post: {
          id: post.id,
          title: post.title,
          draft: post.draft,
          createdAt: post.createdAt,
        },
        textBlocks: textBlocksResult.map((block) => ({
          id: block.id,
          index: block.index,
          content: block.content,
        })),
        imageBlocks: imageBlocksResult.map((block) => ({
          id: block.id,
          index: block.index,
          slug: block.slug,
        })),
      };
    }),

  createPost: t.procedure
    .input(z.object({
      title: z.string().min(1),
      draft: z.boolean().optional().default(true),
      textBlocks: z.array(z.object({
        index: z.number(),
        content: z.string(),
      })).optional().default([]),
      imageBlocks: z.array(z.object({
        index: z.number(),
        slug: z.string(),
      })).optional().default([]),
    }))
    .mutation(async (opts) => {
      // Start a transaction: insert post, then content
      const [newPost] = await db
        .insert(posts)
        .values({
          title: opts.input.title,
          draft: opts.input.draft,
        })
        .returning();

      if (!newPost) {
        throw new Error("Failed to create post");
      }

      // Insert text blocks if provided
      if (opts.input.textBlocks.length > 0) {
        await db.insert(postText).values(
          opts.input.textBlocks.map((block) => ({
            postId: newPost.id,
            index: block.index,
            content: block.content,
          }))
        );
      }

      // Insert image blocks if provided
      if (opts.input.imageBlocks.length > 0) {
        await db.insert(postImages).values(
          opts.input.imageBlocks.map((block) => ({
            postId: newPost.id,
            index: block.index,
            slug: block.slug,
          }))
        );
      }

      // Return the complete post with its content
      return {
        post: newPost,
        textBlocks: opts.input.textBlocks,
        imageBlocks: opts.input.imageBlocks,
      };
    }),

  updatePost: t.procedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      draft: z.boolean().optional(),
      textBlocks: z.array(z.object({
        index: z.number(),
        content: z.string(),
      })).optional(),
      imageBlocks: z.array(z.object({
        index: z.number(),
        slug: z.string(),
      })).optional(),
    }))
    .mutation(async (opts) => {
      const { id, textBlocks, imageBlocks, ...postUpdates } = opts.input;

      // Update post metadata
      const updatedPost = await db
        .update(posts)
        .set(postUpdates)
        .where(eq(posts.id, id))
        .returning();

      if (!updatedPost[0]) {
        throw new Error("Post not found");
      }

      // If textBlocks provided, replace them
      if (textBlocks !== undefined) {
        // Delete existing text blocks
        await db
          .delete(postText)
          .where(eq(postText.postId, id));

        // Insert new text blocks
        if (textBlocks.length > 0) {
          await db.insert(postText).values(
            textBlocks.map((block) => ({
              postId: id,
              index: block.index,
              content: block.content,
            }))
          );
        }
      }

      // If imageBlocks provided, replace them
      if (imageBlocks !== undefined) {
        // Delete existing image blocks
        await db
          .delete(postImages)
          .where(eq(postImages.postId, id));

        // Insert new image blocks
        if (imageBlocks.length > 0) {
          await db.insert(postImages).values(
            imageBlocks.map((block) => ({
              postId: id,
              index: block.index,
              slug: block.slug,
            }))
          );
        }
      }

      // Fetch and return updated post with content
      const postResult = await db
        .select()
        .from(posts)
        .where(eq(posts.id, id))
        .limit(1);

      if (!postResult[0]) {
        throw new Error("Failed to retrieve updated post");
      }

      const textBlocksResult = await db
        .select()
        .from(postText)
        .where(eq(postText.postId, id))
        .orderBy(asc(postText.index));

      const imageBlocksResult = await db
        .select()
        .from(postImages)
        .where(eq(postImages.postId, id))
        .orderBy(asc(postImages.index));

      return {
        post: postResult[0],
        textBlocks: textBlocksResult.map((block) => ({
          id: block.id,
          index: block.index,
          content: block.content,
        })),
        imageBlocks: imageBlocksResult.map((block) => ({
          id: block.id,
          index: block.index,
          slug: block.slug,
        })),
      };
    }),

  deletePost: t.procedure
    .input(z.number())
    .mutation(async (opts) => {
      const postId = opts.input;

      // Delete text and image blocks (optional, CASCADE will handle but explicit is safer)
      await db
        .delete(postImages)
        .where(eq(postImages.postId, postId));

      await db
        .delete(postText)
        .where(eq(postText.postId, postId));

      // Delete post
      const result = await db
        .delete(posts)
        .where(eq(posts.id, postId))
        .returning();

      return {
        success: !!result[0],
        deletedPost: result[0] || null,
      };
    }),
});

export const trpcMiddleWare = createExpressMiddleware({
  router: appRouter,
  createContext: createTRPContext,
});

export type AppRouter = typeof appRouter;

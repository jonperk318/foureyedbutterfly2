import { initTRPC, TRPCError } from "@trpc/server";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { z } from "zod";
import { eq, asc, like, and, min, max, lt, gt } from "drizzle-orm";
import { verifyToken } from "@clerk/backend";
import ImageKit from "@imagekit/nodejs";

import { db } from "./db";
import { posts, postText, postImages } from "./schema";

const createTRPContext = ({ req, res }: CreateExpressContextOptions) => {
  return { req, res };
};

const verifyAuth = async (req: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Missing authorization header",
    });
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid authorization header format",
    });
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    return payload;
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
    });
  }
};

const imagekit = new ImageKit({
  privateKey: process.env.IK_PRIVATE_KEY,
});

type TRPCContext = Awaited<ReturnType<typeof createTRPContext>>;

const t = initTRPC.context<TRPCContext>().create();

export const appRouter = t.router({
  getPostsByYear: t.procedure
    .input(
      z.object({
        year: z.string().length(4),
        limit: z.number().default(10000),
      }),
    )
    .query(async (opts) => {
      const postsFromYear = await db
        .select()
        .from(posts)
        .where(like(posts.createdAt, `${opts.input.year}%`))
        .limit(opts.input.limit);

      if (!postsFromYear || postsFromYear.length === 0) {
        return [];
      }

      const postsWithFirstImage = await Promise.all(
        postsFromYear.map(async (post) => {
          const firstImage = await db
            .select()
            .from(postImages)
            .where(eq(postImages.postId, post.id))
            .orderBy(asc(postImages.index))
            .limit(1);

          return {
            post: {
              id: post.id,
              title: post.title,
              draft: post.draft,
              createdAt: post.createdAt,
            },
            firstImage: firstImage[0]
              ? {
                  id: firstImage[0].id,
                  index: firstImage[0].index,
                  slug: firstImage[0].slug,
                }
              : null,
          };
        }),
      );

      return postsWithFirstImage;
    }),

  getPost: t.procedure
    .input(z.union([z.string(), z.number()]))
    .query(async (opts) => {
      const postId =
        typeof opts.input === "string" ? parseInt(opts.input, 10) : opts.input;

      const postResult = await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (!postResult[0]) {
        return null;
      }

      const post = postResult[0];

      const textBlocksResult = await db
        .select()
        .from(postText)
        .where(eq(postText.postId, postId))
        .orderBy(asc(postText.index));

      const imageBlocksResult = await db
        .select()
        .from(postImages)
        .where(eq(postImages.postId, postId))
        .orderBy(asc(postImages.index));

      const previousPostResult = await db
        .select({ id: max(posts.id), title: posts.title })
        .from(posts)
        .where(and(lt(posts.id, postId), eq(posts.draft, false)))
        .limit(1);

      const nextPostResult = await db
        .select({ id: min(posts.id), title: posts.title })
        .from(posts)
        .where(and(gt(posts.id, postId), eq(posts.draft, false)))
        .limit(1);

      const content = [...imageBlocksResult, ...textBlocksResult].sort(
        (a, b) => a.index - b.index,
      );

      return {
        post: {
          id: post.id,
          title: post.title,
          draft: post.draft,
          createdAt: post.createdAt,
        },
        content,
        previousPost: previousPostResult[0]
          ? {
              id: previousPostResult[0].id,
              title: previousPostResult[0].title,
            }
          : null,
        nextPost: nextPostResult[0]
          ? {
              id: nextPostResult[0].id,
              title: nextPostResult[0].title,
            }
          : null,
      };
    }),

  createPost: t.procedure
    .input(
      z.object({
        title: z.string().min(1),
        draft: z.boolean().optional().default(true),
        textBlocks: z
          .array(
            z.object({
              index: z.number(),
              content: z.string(),
            }),
          )
          .optional()
          .default([]),
        imageBlocks: z
          .array(
            z.object({
              index: z.number(),
              slug: z.string(),
            }),
          )
          .optional()
          .default([]),
      }),
    )
    .mutation(async (opts) => {
      await verifyAuth(opts.ctx.req);

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
          })),
        );
      }

      // Insert image blocks if provided
      if (opts.input.imageBlocks.length > 0) {
        await db.insert(postImages).values(
          opts.input.imageBlocks.map((block) => ({
            postId: newPost.id,
            index: block.index,
            slug: block.slug,
          })),
        );
      }

      return {
        post: newPost,
        textBlocks: opts.input.textBlocks,
        imageBlocks: opts.input.imageBlocks,
      };
    }),

  updatePost: t.procedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        draft: z.boolean().optional(),
        textBlocks: z
          .array(
            z.object({
              index: z.number(),
              content: z.string(),
            }),
          )
          .optional(),
        imageBlocks: z
          .array(
            z.object({
              index: z.number(),
              slug: z.string(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async (opts) => {
      await verifyAuth(opts.ctx.req);

      const { id, textBlocks, imageBlocks, ...postUpdates } = opts.input;

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
        await db.delete(postText).where(eq(postText.postId, id));

        // Insert new text blocks
        if (textBlocks.length > 0) {
          await db.insert(postText).values(
            textBlocks.map((block) => ({
              postId: id,
              index: block.index,
              content: block.content,
            })),
          );
        }
      }

      // If imageBlocks provided, replace them
      if (imageBlocks !== undefined) {
        // Delete existing image blocks
        await db.delete(postImages).where(eq(postImages.postId, id));

        // Insert new image blocks
        if (imageBlocks.length > 0) {
          await db.insert(postImages).values(
            imageBlocks.map((block) => ({
              postId: id,
              index: block.index,
              slug: block.slug,
            })),
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

  deletePost: t.procedure.input(z.number()).mutation(async (opts) => {
    await verifyAuth(opts.ctx.req);

    const postId = opts.input;

    // Delete text and image blocks (optional, CASCADE will handle but explicit is safer)
    await db.delete(postImages).where(eq(postImages.postId, postId));

    await db.delete(postText).where(eq(postText.postId, postId));

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

  uploadImageAuth: t.procedure.query(async () => {
    const { token, expire, signature } =
      imagekit.helper.getAuthenticationParameters();
    return {
      token,
      expire,
      signature,
      publicKey: process.env.VITE_IK_PUBLIC_KEY,
    };
  }),

  getAllMedia: t.procedure.query(async () => {
    const files = await imagekit.assets.list({ path: "/posts" });
    return files;
  }),

  deleteMedia: t.procedure.input(z.array(z.string())).mutation(async (opts) => {
    const allAssets = await imagekit.assets.list({ path: "/posts" });

    const fileIdsToDelete = allAssets
      .filter(asset => opts.input.includes(asset.name))
      .map(asset => asset.fileId);

    if (fileIdsToDelete.length === 0) {
      return { success: true, deleted: 0 };
    }

    const response = await imagekit.files.bulk.delete({ fileIds: fileIdsToDelete });

    return {
      success: true,
      deleted: fileIdsToDelete.length,
      response,
    };
  })
});

export const trpcMiddleWare = createExpressMiddleware({
  router: appRouter,
  createContext: createTRPContext,
});

export type AppRouter = typeof appRouter;

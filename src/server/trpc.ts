import { initTRPC, TRPCError } from "@trpc/server";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { z } from "zod";
import { eq, and, min, max, lt, gt, or, inArray } from "drizzle-orm";
import { verifyToken } from "@clerk/backend";
import ImageKit from "@imagekit/nodejs";

import { db } from "./db";
import { posts, postContent } from "./schema";

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
  getFirstImagesOfYears: t.procedure
    .input(z.array(z.string().length(4)))
    .output(z.array(z.object({ year: z.string(), image: z.string().nullable() })))
    .query(async (opts) => {
      const yearRanges = opts.input.map(year => ({
        year,
        start: new Date(`${year}-01-01T00:00:00Z`),
        end: new Date(`${year}-12-31T23:59:59Z`),
      }));

      // Fetch all posts for all years in one query
      const allPosts = await db
        .select({ id: posts.id, createdAt: posts.createdAt })
        .from(posts)
        .where(
          or(
            ...yearRanges.map(yr =>
              and(gt(posts.createdAt, yr.start), lt(posts.createdAt, yr.end))
            )
          )
        );

      // Map posts to their years and get first post per year
      const firstPostsByYear = new Map<string, number>();
      for (const post of allPosts) {
        const yearRange = yearRanges.find(yr =>
          post.createdAt > yr.start && post.createdAt < yr.end
        );
        if (yearRange && !firstPostsByYear.has(yearRange.year)) {
          firstPostsByYear.set(yearRange.year, post.id);
        }
      }

      // Fetch all images for these posts in one query
      const postIds = Array.from(firstPostsByYear.values());
      const firstImages = await db
        .select()
        .from(postContent)
        .where(
          and(
            inArray(postContent.postId, postIds),
            eq(postContent.contentType, "image")
          )
        );

      // Map images to their posts, keeping only first image per post
      const imagesByPostId = new Map<number, string>();
      for (const image of firstImages) {
        if (!imagesByPostId.has(image.postId)) {
          imagesByPostId.set(image.postId, image.data);
        }
      }

      // Build result array
      return opts.input.map(year => {
        const postId = firstPostsByYear.get(year);
        const image = postId ? (imagesByPostId.get(postId) ?? null) : null;
        return { year, image };
      });
    }),

  getPostsByYear: t.procedure
    .input(
      z.object({
        year: z.string().length(4),
        limit: z.number().default(10000),
      }),
    )
    .query(async (opts) => {
      const yearStart = new Date(`${opts.input.year}-01-01T00:00:00Z`);
      const yearEnd = new Date(`${opts.input.year}-12-31T23:59:59Z`);

      const postsFromYear = await db
        .select()
        .from(posts)
        .where(and(
          gt(posts.createdAt, yearStart),
          lt(posts.createdAt, yearEnd)
        ))
        .limit(opts.input.limit);

      if (!postsFromYear || postsFromYear.length === 0) {
        return [];
      }

      const postsWithFirstImage = await Promise.all(
        postsFromYear.map(async (post) => {
          const firstImage = await db
            .select()
            .from(postContent)
            .where(and(eq(postContent.postId, post.id), eq(postContent.contentType, "image")))
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
                  contentType: firstImage[0].contentType,
                  data: firstImage[0].data,
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

      const contentResult = await db
        .select()
        .from(postContent)
        .where(eq(postContent.postId, postId));

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

      return {
        post: {
          id: post.id,
          title: post.title,
          draft: post.draft,
          createdAt: post.createdAt,
        },
        content: contentResult,
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
        content: z
          .array(
            z.object({
              contentType: z.enum(["text", "image", "video"]),
              data: z.string(),
            }),
          )
          .optional()
          .default([]),
        createdAt: z.date().optional(),
        //createdAt: z.iso.datetime().optional(),
      }),
    )
    .mutation(async (opts) => {
      await verifyAuth(opts.ctx.req);

      const [newPost] = await db
        .insert(posts)
        .values({
          title: opts.input.title,
          draft: opts.input.draft,
          ...(opts.input.createdAt && {createdAt: opts.input.createdAt}),
        })
        .returning();

      if (!newPost) {
        throw new Error("Failed to create post");
      }

      // Insert content blocks if provided
      if (opts.input.content.length > 0) {
        await db.insert(postContent).values(
          opts.input.content.map((block) => ({
            postId: newPost.id,
            contentType: block.contentType,
            data: block.data,
          })),
        );
      }

      // Fetch created content
      const createdContent = await db
        .select()
        .from(postContent)
        .where(eq(postContent.postId, newPost.id));

      return {
        post: newPost,
        content: createdContent,
      };
    }),

  updatePost: t.procedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        draft: z.boolean().optional(),
        content: z
          .array(
            z.object({
              contentType: z.enum(["text", "image", "video"]),
              data: z.string(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async (opts) => {
      await verifyAuth(opts.ctx.req);

      const { id, content, ...postUpdates } = opts.input;

      const updatedPost = await db
        .update(posts)
        .set(postUpdates)
        .where(eq(posts.id, id))
        .returning();

      if (!updatedPost[0]) {
        throw new Error("Post not found");
      }

      // If content provided, replace all content blocks
      if (content !== undefined) {
        // Delete existing content blocks
        await db.delete(postContent).where(eq(postContent.postId, id));

        // Insert new content blocks
        if (content.length > 0) {
          await db.insert(postContent).values(
            content.map((block) => ({
              postId: id,
              contentType: block.contentType,
              data: block.data,
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

      const contentResult = await db
        .select()
        .from(postContent)
        .where(eq(postContent.postId, id));

      return {
        post: postResult[0],
        content: contentResult,
      };
    }),

  deletePost: t.procedure.input(z.number()).mutation(async (opts) => {
    await verifyAuth(opts.ctx.req);

    const postId = opts.input;

    // Delete content blocks (optional, CASCADE will handle but explicit is safer)
    await db.delete(postContent).where(eq(postContent.postId, postId));

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

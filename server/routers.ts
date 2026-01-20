import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";

// 管理員權限檢查
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: '需要管理員權限' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // 課程相關
  courses: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      }))
      .query(async ({ input }) => {
        return await db.getAllCourses(input.limit, input.offset);
      }),
    
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const course = await db.getCourseById(input.id);
        if (!course) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '課程不存在' });
        }
        return course;
      }),
    
    byCategory: publicProcedure
      .input(z.object({
        category: z.string(),
        limit: z.number().optional().default(50),
      }))
      .query(async ({ input }) => {
        return await db.getCoursesByCategory(input.category, input.limit);
      }),
    
    search: publicProcedure
      .input(z.object({
        keyword: z.string(),
        limit: z.number().optional().default(50),
      }))
      .query(async ({ input }) => {
        return await db.searchCourses(input.keyword, input.limit);
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string().optional(),
        title: z.string(),
        description: z.string().optional(),
        instructor: z.string().optional(),
        institution: z.string().optional(),
        category: z.string().optional(),
        imageUrl: z.string().optional(),
        platformId: z.number().optional(),
        price: z.number().optional(),
        url: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const courseId = await db.createCourse({
          title: input.name || input.title,
          description: input.description,
          instructor: input.instructor,
          institution: input.institution,
          category: input.category,
          imageUrl: input.imageUrl,
        });
        return { courseId };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCourse(input.id);
        return { success: true };
      }),
  }),

  // 評價相關
  reviews: router({
    byCourse: publicProcedure
      .input(z.object({ courseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getReviewsByCourse(input.courseId, "approved");
      }),
    
    byUser: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getReviewsByUser(ctx.user.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        courseId: z.number(),
        rating: z.number().min(1).max(5),
        title: z.string().optional(),
        content: z.string(),
        isAnonymous: z.boolean().optional().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        const reviewId = await db.createReview({
          ...input,
          userId: ctx.user.id,
          status: "pending",
        });
        
        // 獲得積分 - 發布評價獲得 30 積分
        await db.createPointTransaction({
          userId: ctx.user.id,
          amount: 30,
          type: "earn_review",
          relatedId: reviewId || 0,
          description: "分享課程評價",
        });
        
        return { reviewId };
      }),
    
    pending: adminProcedure
      .query(async () => {
        return await db.getPendingReviews();
      }),
    
    approve: adminProcedure
      .input(z.object({ reviewId: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateReviewStatus(input.reviewId, "approved");
        return { success: true };
      }),
    
    reject: adminProcedure
      .input(z.object({ reviewId: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateReviewStatus(input.reviewId, "rejected");
        return { success: true };
      }),
  }),

  // 積分相關
  points: router({
    balance: protectedProcedure
      .query(async ({ ctx }) => {
        const user = await db.getUserById(ctx.user.id);
        return { points: user?.points || 0 };
      }),
    
    transactions: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(50),
      }))
      .query(async ({ input, ctx }) => {
        return await db.getPointTransactionsByUser(ctx.user.id, input.limit);
      }),
  }),

  // VIP相關
  vip: router({
    status: protectedProcedure
      .query(async ({ ctx }) => {
        const user = await db.getUserById(ctx.user.id);
        return {
          isVip: user?.isVip || false,
          vipExpiresAt: user?.vipExpiresAt,
        };
      }),
    
    subscriptions: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getVipSubscriptionsByUser(ctx.user.id);
      }),
  }),

  // 文章相關
  articles: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().optional().default(20),
      }))
      .query(async ({ input }) => {
        return await db.getPublishedArticles(input.limit);
      }),
    
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const article = await db.getArticleById(input.id);
        if (!article || article.status !== "published") {
          throw new TRPCError({ code: 'NOT_FOUND', message: '文章不存在' });
        }
        
        await db.incrementArticleViewCount(input.id);
        return article;
      }),
    
    create: adminProcedure
      .input(z.object({
        title: z.string(),
        content: z.string(),
        excerpt: z.string().optional(),
        coverImage: z.string().optional(),
        tags: z.string().optional(),
        status: z.enum(["draft", "published"]).optional().default("draft"),
      }))
      .mutation(async ({ input, ctx }) => {
        const articleId = await db.createArticle({
          ...input,
          authorId: ctx.user.id,
          publishedAt: input.status === "published" ? new Date() : null,
        });
        return { articleId };
      }),
  }),

  // Blog 相關
  blog: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().optional().default(20),
      }))
      .query(async ({ input }) => {
        return await db.getPublishedBlogPosts(input.limit);
      }),
    
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const post = await db.getBlogPostById(input.id);
        if (!post || post.status !== "published") {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Blog 文章不存在' });
        }
        
        await db.incrementBlogPostViewCount(input.id);
        return post;
      }),
    
    byCategory: publicProcedure
      .input(z.object({
        category: z.string(),
        limit: z.number().optional().default(20),
      }))
      .query(async ({ input }) => {
        return await db.getBlogPostsByCategory(input.category, input.limit);
      }),
    
    search: publicProcedure
      .input(z.object({
        keyword: z.string(),
        limit: z.number().optional().default(20),
      }))
      .query(async ({ input }) => {
        return await db.searchBlogPosts(input.keyword, input.limit);
      }),
    
    create: adminProcedure
      .input(z.object({
        title: z.string(),
        content: z.string(),
        excerpt: z.string().optional(),
        coverImage: z.string().optional(),
        category: z.string().optional(),
        tags: z.string().optional(),
        status: z.enum(["draft", "published"]).optional().default("draft"),
      }))
      .mutation(async ({ input, ctx }) => {
        const postId = await db.createBlogPost({
          ...input,
          authorId: ctx.user.id,
          publishedAt: input.status === "published" ? new Date() : null,
        });
        return { postId };
      }),
  }),

  // 訂單相關
  orders: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getOrdersByUser(ctx.user.id);
      }),
    
    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.id);
        if (!order || order.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: '沒有權限訪問此訂單' });
        }
        return order;
      }),
  }),

  // 會員管理相關
  members: router({
    list: adminProcedure
      .input(z.object({
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      }))
      .query(async ({ input }) => {
        return await db.getAllUsers(input.limit, input.offset);
      }),
    
    adjustPoints: adminProcedure
      .input(z.object({
        userId: z.number(),
        amount: z.number(),
        description: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.adjustUserPoints(input.userId, input.amount, "admin_adjust", input.description);
        return { success: true };
      }),
    
    updateVipStatus: adminProcedure
      .input(z.object({
        userId: z.number(),
        isVip: z.boolean(),
        vipExpiresAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateUserVipStatus(input.userId, input.isVip, input.vipExpiresAt || null);
        return { success: true };
      }),
  }),

  // 課程平台管理相關
  platforms: router({
    list: publicProcedure
      .query(async () => {
        return await db.getAllCoursePlatforms();
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        displayName: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createCoursePlatform(input);
        return { success: true };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        displayName: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCoursePlatform(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCoursePlatform(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

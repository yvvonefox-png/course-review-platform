import { eq, desc, and, sql, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  courses, Course, InsertCourse,
  reviews, Review, InsertReview,
  pointTransactions, PointTransaction, InsertPointTransaction,
  vipSubscriptions, VipSubscription, InsertVipSubscription,
  articles, Article, InsertArticle,
  blogPosts, BlogPost, InsertBlogPost,
  orders, Order, InsertOrder,
  coursePlatforms, CoursePlatform, InsertCoursePlatform
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ 用户相关 ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserPoints(userId: number, points: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ points }).where(eq(users.id, userId));
}

export async function updateUserVipStatus(userId: number, isVip: boolean, vipExpiresAt: Date | null) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ isVip, vipExpiresAt }).where(eq(users.id, userId));
}

// ============ 课程相关 ============

export async function createCourse(course: InsertCourse) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(courses).values(course) as any;
  return Number(result.insertId);
}

export async function getCourseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllCourses(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(courses).orderBy(desc(courses.createdAt)).limit(limit).offset(offset);
}

export async function getCoursesByCategory(category: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(courses).where(eq(courses.category, category)).orderBy(desc(courses.rating)).limit(limit);
}

export async function searchCourses(keyword: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(courses)
    .where(
      or(
        like(courses.title, `%${keyword}%`),
        like(courses.instructor, `%${keyword}%`),
        like(courses.institution, `%${keyword}%`)
      )
    )
    .orderBy(desc(courses.rating))
    .limit(limit);
}

export async function updateCourseRating(courseId: number) {
  const db = await getDb();
  if (!db) return;
  
  const approvedReviews = await db.select().from(reviews)
    .where(and(eq(reviews.courseId, courseId), eq(reviews.status, "approved")));
  
  if (approvedReviews.length === 0) {
    await db.update(courses).set({ rating: "0.00", reviewCount: 0 }).where(eq(courses.id, courseId));
    return;
  }
  
  const avgRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
  await db.update(courses).set({ 
    rating: avgRating.toFixed(2),
    reviewCount: approvedReviews.length 
  }).where(eq(courses.id, courseId));
}

// ============ 评价相关 ============

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(reviews).values(review) as any;
  return Number(result.insertId);
}

export async function getReviewById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getReviewsByCourse(courseId: number, status: "pending" | "approved" | "rejected" = "approved") {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(reviews)
    .where(and(eq(reviews.courseId, courseId), eq(reviews.status, status)))
    .orderBy(desc(reviews.createdAt));
}

export async function getReviewsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(reviews)
    .where(eq(reviews.userId, userId))
    .orderBy(desc(reviews.createdAt));
}

export async function getPendingReviews() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(reviews)
    .where(eq(reviews.status, "pending"))
    .orderBy(desc(reviews.createdAt));
}

export async function updateReviewStatus(reviewId: number, status: "approved" | "rejected") {
  const db = await getDb();
  if (!db) return;
  await db.update(reviews).set({ status }).where(eq(reviews.id, reviewId));
}

export async function incrementReviewViewCount(reviewId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(reviews).set({ viewCount: sql`${reviews.viewCount} + 1` }).where(eq(reviews.id, reviewId));
}

// ============ 积分相关 ============

export async function createPointTransaction(transaction: InsertPointTransaction) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(pointTransactions).values(transaction) as any;
  
  // 更新用户积分
  const user = await getUserById(transaction.userId);
  if (user) {
    await updateUserPoints(transaction.userId, user.points + transaction.amount);
  }
  
  return Number(result.insertId);
}

export async function getPointTransactionsByUser(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(pointTransactions)
    .where(eq(pointTransactions.userId, userId))
    .orderBy(desc(pointTransactions.createdAt))
    .limit(limit);
}

// ============ VIP订阅相关 ============

export async function createVipSubscription(subscription: InsertVipSubscription) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(vipSubscriptions).values(subscription) as any;
  return Number(result.insertId);
}

export async function getVipSubscriptionsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(vipSubscriptions)
    .where(eq(vipSubscriptions.userId, userId))
    .orderBy(desc(vipSubscriptions.createdAt));
}

export async function updateVipSubscriptionStatus(id: number, status: "active" | "cancelled" | "expired") {
  const db = await getDb();
  if (!db) return;
  await db.update(vipSubscriptions).set({ status }).where(eq(vipSubscriptions.id, id));
}

// ============ 文章相关 ============

export async function createArticle(article: InsertArticle) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(articles).values(article) as any;
  return Number(result.insertId);
}

export async function getArticleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPublishedArticles(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

export async function incrementArticleViewCount(articleId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(articles).set({ viewCount: sql`${articles.viewCount} + 1` }).where(eq(articles.id, articleId));
}

// ============ Blog 文章相关 ============

export async function createBlogPost(post: InsertBlogPost) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(blogPosts).values(post) as any;
  return Number(result.insertId);
}

export async function getBlogPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPublishedBlogPosts(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(blogPosts)
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);
}

export async function getBlogPostsByCategory(category: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(blogPosts)
    .where(and(eq(blogPosts.status, "published"), eq(blogPosts.category, category)))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);
}

export async function searchBlogPosts(keyword: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(blogPosts)
    .where(and(
      eq(blogPosts.status, "published"),
      or(
        like(blogPosts.title, `%${keyword}%`),
        like(blogPosts.content, `%${keyword}%`)
      )
    ))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);
}

export async function incrementBlogPostViewCount(postId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(blogPosts).set({ viewCount: sql`${blogPosts.viewCount} + 1` }).where(eq(blogPosts.id, postId));
}

// ============ 订单相关 ============

export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(orders).values(order) as any;
  return Number(result.insertId);
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrdersByUser(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateOrderStatus(id: number, status: "pending" | "completed" | "failed" | "refunded") {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ status }).where(eq(orders.id, id));
}

export async function updateOrderWithStripeIds(id: number, stripePaymentIntentId: string, stripeInvoiceId?: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ stripePaymentIntentId, stripeInvoiceId }).where(eq(orders.id, id));
}


// ============ 會員管理相關 ============

export async function getAllUsers(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).limit(limit).offset(offset);
}

export async function adjustUserPoints(userId: number, amount: number, type: string, description: string) {
  const db = await getDb();
  if (!db) return;
  
  // 更新用戶积分
  const user = await getUserById(userId);
  if (user) {
    const newPoints = Math.max(0, user.points + amount);
    await db.update(users).set({ points: newPoints }).where(eq(users.id, userId));
  }
  
  // 記錄积分交易
  await db.insert(pointTransactions).values({
    userId,
    amount,
    type: type as any,
    description,
  });
}

// ============ 課程平台相關 ============

export async function getAllCoursePlatforms() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(coursePlatforms).orderBy(coursePlatforms.name);
}

export async function getCoursePlatformById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(coursePlatforms).where(eq(coursePlatforms.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createCoursePlatform(data: { name: string; displayName: string; description?: string }) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(coursePlatforms).values(data);
  return result;
}

export async function updateCoursePlatform(id: number, data: Partial<{ displayName: string; description: string; isActive: boolean }>) {
  const db = await getDb();
  if (!db) return;
  await db.update(coursePlatforms).set(data).where(eq(coursePlatforms.id, id));
}

export async function deleteCoursePlatform(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(coursePlatforms).where(eq(coursePlatforms.id, id));
}

// 初始化預設課程平台
export async function initializeDefaultPlatforms() {
  const db = await getDb();
  if (!db) return;
  
  const existing = await db.select().from(coursePlatforms);
  if (existing.length > 0) return;
  
  const defaultPlatforms = [
    { name: "udemy", displayName: "Udemy", description: "全球最大的線上課程平台" },
    { name: "skool", displayName: "Skool", description: "社群型學習平台" },
    { name: "hexschool", displayName: "六角學院", description: "台灣網頁設計與程式教學平台" },
    { name: "other", displayName: "其他", description: "其他課程平台" },
  ];
  
  for (const platform of defaultPlatforms) {
    await db.insert(coursePlatforms).values(platform);
  }
}


export async function deleteCourse(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(courses).where(eq(courses.id, id));
}

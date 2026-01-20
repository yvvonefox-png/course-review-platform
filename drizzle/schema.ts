import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * 用户表 - 扩展自基础认证表
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  points: int("points").default(0).notNull(), // 积分余额
  isVip: boolean("isVip").default(false).notNull(), // VIP 状态
  vipExpiresAt: timestamp("vipExpiresAt"), // VIP 过期时间
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 课程表
 */
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(), // 课程名称
  description: text("description"), // 课程描述
  instructor: varchar("instructor", { length: 255 }), // 讲师名称
  institution: varchar("institution", { length: 255 }), // 机构名称
  category: varchar("category", { length: 100 }), // 课程分类
  platformId: int("platformId"), // 課程平台ID
  imageUrl: text("imageUrl"), // 课程图片
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"), // 平均评分
  reviewCount: int("reviewCount").default(0).notNull(), // 评价数量
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

/**
 * 评价表
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(), // 关联课程
  userId: int("userId").notNull(), // 发布用户
  rating: int("rating").notNull(), // 评分 1-5
  title: varchar("title", { length: 255 }), // 评价标题
  content: text("content").notNull(), // 评价内容
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(), // 审核状态
  isAnonymous: boolean("isAnonymous").default(true).notNull(), // 是否匿名
  viewCount: int("viewCount").default(0).notNull(), // 查看次数
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * 积分记录表
 */
export const pointTransactions = mysqlTable("pointTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // 用户ID
  amount: int("amount").notNull(), // 积分变动量(正数为获得,负数为消费)
  type: mysqlEnum("type", ["earn_review", "spend_view", "vip_bonus", "admin_adjust"]).notNull(), // 交易类型
  relatedId: int("relatedId"), // 关联ID(如评价ID)
  description: text("description"), // 描述
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = typeof pointTransactions.$inferInsert;

/**
 * VIP订阅记录表
 */
export const vipSubscriptions = mysqlTable("vipSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // 用户ID
  stripeSessionId: varchar("stripeSessionId", { length: 255 }), // Stripe 会话ID
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }), // Stripe 订阅ID
  status: mysqlEnum("status", ["active", "cancelled", "expired"]).notNull(), // 订阅状态
  startDate: timestamp("startDate").notNull(), // 开始时间
  endDate: timestamp("endDate").notNull(), // 结束时间
  amount: decimal("amount", { precision: 10, scale: 2 }), // 支付金额
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VipSubscription = typeof vipSubscriptions.$inferSelect;
export type InsertVipSubscription = typeof vipSubscriptions.$inferInsert;

/**
 * 文章表(专栏文章)
 */
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(), // 文章标题
  content: text("content").notNull(), // 文章内容
  excerpt: text("excerpt"), // 摘要
  coverImage: text("coverImage"), // 封面图
  tags: text("tags"), // 标签(JSON 字符串)
  authorId: int("authorId"), // 作者ID
  viewCount: int("viewCount").default(0).notNull(), // 查看次数
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(), // 发布状态
  publishedAt: timestamp("publishedAt"), // 发布时间
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

/**
 * Blog 文章表
 */
export const blogPosts = mysqlTable("blogPosts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  coverImage: text("coverImage"),
  category: varchar("category", { length: 100 }),
  tags: text("tags"),
  authorId: int("authorId"),
  viewCount: int("viewCount").default(0).notNull(),
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * 訂單表
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 255 }),
  orderNumber: varchar("orderNumber", { length: 100 }).notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  productType: varchar("productType", { length: 50 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * 課程平台配置表
 */
export const coursePlatforms = mysqlTable("coursePlatforms", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayName: varchar("displayName", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoursePlatform = typeof coursePlatforms.$inferSelect;
export type InsertCoursePlatform = typeof coursePlatforms.$inferInsert;

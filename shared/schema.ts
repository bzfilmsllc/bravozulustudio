import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum('user_role', ['public', 'pending', 'verified']);

// Military branch enum
export const militaryBranchEnum = pgEnum('military_branch', [
  'army', 'navy', 'air_force', 'marines', 'coast_guard', 'space_force', 'civilian', 'not_applicable'
]);

// Relationship to military community enum
export const relationshipTypeEnum = pgEnum('relationship_type', [
  'veteran', 'active_duty', 'family_member', 'friend', 'supporter'
]);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('public').notNull(),
  relationshipType: relationshipTypeEnum("relationship_type"),
  militaryBranch: militaryBranchEnum("military_branch"),
  yearsOfService: varchar("years_of_service"),
  contactEmail: varchar("contact_email"),
  isVerified: boolean("is_verified").default(false).notNull(),
  bio: text("bio"),
  specialties: text("specialties"),
  
  // Billing and subscription fields
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status", { 
    enum: ['none', 'active', 'past_due', 'canceled', 'unpaid'] 
  }).default('none').notNull(),
  subscriptionPlan: varchar("subscription_plan", {
    enum: ['free', 'weekly', 'monthly', 'yearly']
  }).default('free').notNull(),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  credits: integer("credits").default(25).notNull(), // Welcome package: 25 credits to start
  totalCreditsUsed: integer("total_credits_used").default(0).notNull(),
  militaryDiscountApplied: boolean("military_discount_applied").default(false).notNull(),
  
  // Onboarding and tutorial tracking
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false).notNull(),
  hasReceivedWelcomePackage: boolean("has_received_welcome_package").default(false).notNull(),
  tutorialStep: integer("tutorial_step").default(0).notNull(),
  tutorialCompletedAt: timestamp("tutorial_completed_at"),
  lastTutorialInteraction: timestamp("last_tutorial_interaction"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Friend requests table
export const friendRequests = pgTable("friend_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  toUserId: varchar("to_user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar("status", { enum: ['pending', 'accepted', 'rejected'] }).default('pending').notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Friendships table
export const friendships = pgTable("friendships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  user2Id: varchar("user2_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Scripts table
export const scripts = pgTable("scripts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content"),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  isPublic: boolean("is_public").default(false).notNull(),
  genre: varchar("genre"),
  logline: text("logline"),
  festivalScore: varchar("festival_score"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type", { enum: ['short_film', 'feature', 'documentary', 'series'] }).notNull(),
  status: varchar("status", { enum: ['pre_production', 'production', 'post_production', 'completed'] }).default('pre_production').notNull(),
  creatorId: varchar("creator_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  scriptId: varchar("script_id").references(() => scripts.id),
  seekingRoles: text("seeking_roles"),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Festival submissions table
export const festivalSubmissions = pgTable("festival_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  scriptId: varchar("script_id").references(() => scripts.id, { onDelete: 'cascade' }),
  submitterId: varchar("submitter_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  festivalName: varchar("festival_name").notNull(),
  festivalLocation: varchar("festival_location"),
  festivalWebsite: varchar("festival_website"),
  submissionCategory: varchar("submission_category"),
  submissionDeadline: timestamp("submission_deadline"),
  submissionFee: varchar("submission_fee"),
  status: varchar("status", { enum: ['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'] }).default('draft').notNull(),
  submittedAt: timestamp("submitted_at"),
  responseReceived: timestamp("response_received"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project collaborators table
export const projectCollaborators = pgTable("project_collaborators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar("role").notNull(),
  permissions: varchar("permissions", { enum: ['read', 'write', 'admin'] }).default('read').notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Forum categories table
export const forumCategories = pgTable("forum_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  iconClass: varchar("icon_class"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Forum posts table
export const forumPosts = pgTable("forum_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: varchar("category_id").notNull().references(() => forumCategories.id, { onDelete: 'cascade' }),
  isSticky: boolean("is_sticky").default(false).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  viewCount: varchar("view_count").default('0'),
  replyCount: varchar("reply_count").default('0'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Forum replies table
export const forumReplies = pgTable("forum_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: varchar("post_id").notNull().references(() => forumPosts.id, { onDelete: 'cascade' }),
  parentReplyId: varchar("parent_reply_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: varchar("receiver_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity tracking table
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar("type", { 
    enum: ['script_created', 'project_created', 'member_joined', 'forum_post', 'friend_added', 'festival_submission'] 
  }).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  link: varchar("link"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reports table
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  reportedUserId: varchar("reported_user_id").references(() => users.id, { onDelete: 'cascade' }),
  reportedPostId: varchar("reported_post_id").references(() => forumPosts.id, { onDelete: 'cascade' }),
  reportedReplyId: varchar("reported_reply_id").references(() => forumReplies.id, { onDelete: 'cascade' }),
  reason: varchar("reason").notNull(),
  description: text("description"),
  status: varchar("status", { enum: ['pending', 'reviewed', 'resolved', 'dismissed'] }).default('pending').notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sentFriendRequests: many(friendRequests, { relationName: "sentRequests" }),
  receivedFriendRequests: many(friendRequests, { relationName: "receivedRequests" }),
  friendships1: many(friendships, { relationName: "user1Friendships" }),
  friendships2: many(friendships, { relationName: "user2Friendships" }),
  scripts: many(scripts),
  projects: many(projects),
  collaborations: many(projectCollaborators),
  forumPosts: many(forumPosts),
  forumReplies: many(forumReplies),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  activities: many(activities),
  reports: many(reports, { relationName: "reporterReports" }),
  reportedBy: many(reports, { relationName: "reportedUserReports" }),
  notifications: many(notifications),
  createdGiftCodes: many(giftCodes, { relationName: "createdGiftCodes" }),
  referralCodes: many(referralCodes),
  referralsAsReferrer: many(referrals, { relationName: "referrerRelation" }),
  referralsAsReferred: many(referrals, { relationName: "referredRelation" }),
}));

export const friendRequestsRelations = relations(friendRequests, ({ one }) => ({
  fromUser: one(users, {
    fields: [friendRequests.fromUserId],
    references: [users.id],
    relationName: "sentRequests",
  }),
  toUser: one(users, {
    fields: [friendRequests.toUserId],
    references: [users.id],
    relationName: "receivedRequests",
  }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  user1: one(users, {
    fields: [friendships.user1Id],
    references: [users.id],
    relationName: "user1Friendships",
  }),
  user2: one(users, {
    fields: [friendships.user2Id],
    references: [users.id],
    relationName: "user2Friendships",
  }),
}));

export const scriptsRelations = relations(scripts, ({ one, many }) => ({
  author: one(users, {
    fields: [scripts.authorId],
    references: [users.id],
  }),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  creator: one(users, {
    fields: [projects.creatorId],
    references: [users.id],
  }),
  script: one(scripts, {
    fields: [projects.scriptId],
    references: [scripts.id],
  }),
  collaborators: many(projectCollaborators),
}));

export const projectCollaboratorsRelations = relations(projectCollaborators, ({ one }) => ({
  project: one(projects, {
    fields: [projectCollaborators.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectCollaborators.userId],
    references: [users.id],
  }),
}));

export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [forumPosts.authorId],
    references: [users.id],
  }),
  category: one(forumCategories, {
    fields: [forumPosts.categoryId],
    references: [forumCategories.id],
  }),
  replies: many(forumReplies),
}));

export const forumRepliesRelations = relations(forumReplies, ({ one, many }) => ({
  author: one(users, {
    fields: [forumReplies.authorId],
    references: [users.id],
  }),
  post: one(forumPosts, {
    fields: [forumReplies.postId],
    references: [forumPosts.id],
  }),
  parentReply: one(forumReplies, {
    fields: [forumReplies.parentReplyId],
    references: [forumReplies.id],
    relationName: "parentChild",
  }),
  childReplies: many(forumReplies, { relationName: "parentChild" }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
}));

export const designAssets = pgTable("design_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  projectId: varchar("project_id").references(() => projects.id),
  title: varchar("title").notNull(),
  description: text("description"),
  assetType: varchar("asset_type").notNull(), // logo, poster, banner, thumbnail, social_media
  category: varchar("category"), // production_company, film_title, character, etc.
  imageUrl: varchar("image_url").notNull(),
  prompt: text("prompt"), // Original AI prompt used
  dimensions: varchar("dimensions"), // e.g., "1024x1024"
  tags: text("tags").array(),
  isPublic: boolean("is_public").default(false),
  downloadCount: integer("download_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const festivalSubmissionsRelations = relations(festivalSubmissions, ({ one }) => ({
  project: one(projects, {
    fields: [festivalSubmissions.projectId],
    references: [projects.id],
  }),
  script: one(scripts, {
    fields: [festivalSubmissions.scriptId],
    references: [scripts.id],
  }),
  submitter: one(users, {
    fields: [festivalSubmissions.submitterId],
    references: [users.id],
    relationName: "festivalSubmissions",
  }),
}));

export const designAssetsRelations = relations(designAssets, ({ one }) => ({
  creator: one(users, {
    fields: [designAssets.creatorId],
    references: [users.id],
    relationName: "designAssets",
  }),
  project: one(projects, {
    fields: [designAssets.projectId],
    references: [projects.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertFriendRequestSchema = createInsertSchema(friendRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScriptSchema = createInsertSchema(scripts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  replyCount: true,
});

export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFestivalSubmissionSchema = createInsertSchema(festivalSubmissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDesignAssetSchema = createInsertSchema(designAssets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  downloadCount: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type FriendRequest = typeof friendRequests.$inferSelect;
export type InsertFriendRequest = z.infer<typeof insertFriendRequestSchema>;
export type Friendship = typeof friendships.$inferSelect;
export type Script = typeof scripts.$inferSelect;
export type InsertScript = z.infer<typeof insertScriptSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type ProjectCollaborator = typeof projectCollaborators.$inferSelect;
export type ForumCategory = typeof forumCategories.$inferSelect;
export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type FestivalSubmission = typeof festivalSubmissions.$inferSelect;
export type InsertFestivalSubmission = z.infer<typeof insertFestivalSubmissionSchema>;
export type DesignAsset = typeof designAssets.$inferSelect;
export type InsertDesignAsset = z.infer<typeof insertDesignAssetSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Credit transactions table
export const creditTransactions = pgTable("credit_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer("amount").notNull(), // Positive for credits added, negative for credits used
  type: varchar("type", {
    enum: ['purchase', 'usage', 'bonus', 'refund', 'subscription_grant', 'referral_bonus']
  }).notNull(),
  description: text("description").notNull(),
  relatedEntityType: varchar("related_entity_type"), // 'script', 'project', 'ai_generation', etc.
  relatedEntityId: varchar("related_entity_id"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // Price in cents
  currency: varchar("currency").default('usd').notNull(),
  interval: varchar("interval", { enum: ['week', 'month', 'year'] }).notNull(),
  creditsIncluded: integer("credits_included").notNull(),
  stripePriceId: varchar("stripe_price_id").unique(),
  militaryDiscountPercent: integer("military_discount_percent").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for credit system
export const insertCreditTransactionSchema = createInsertSchema(creditTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  createdAt: true,
  updatedAt: true,
});

// Notification type enum
export const notificationTypeEnum = pgEnum('notification_type', [
  'ai_task_complete', 'message_received', 'friend_request', 'project_invite', 
  'script_shared', 'forum_reply', 'system_alert', 'credit_awarded'
]);

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  actionUrl: varchar("action_url"), // Optional URL to navigate to when clicked
  relatedEntityType: varchar("related_entity_type"), // 'script', 'message', 'project', etc.
  relatedEntityId: varchar("related_entity_id"),
  metadata: jsonb("metadata"), // Additional data for the notification
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// Insert schema for notifications
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

// Export credit system types
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

// Notification relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Export notification types
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Referral codes table
export const referralCodes = pgTable("referral_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  code: varchar("code").unique().notNull(), // Unique referral code (e.g., "BRAVO123")
  isActive: boolean("is_active").default(true).notNull(),
  maxUses: integer("max_uses").default(100).notNull(), // Maximum number of times it can be used
  currentUses: integer("current_uses").default(0).notNull(),
  referrerReward: integer("referrer_reward").default(50).notNull(), // Credits given to referrer
  referredReward: integer("referred_reward").default(25).notNull(), // Credits given to new user
  minimumSpend: integer("minimum_spend").default(0).notNull(), // Minimum amount new user must spend to trigger reward (in cents)
  expiresAt: timestamp("expires_at"), // Optional expiration date
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Referral tracking table
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralCodeId: varchar("referral_code_id").notNull().references(() => referralCodes.id, { onDelete: 'cascade' }),
  referrerId: varchar("referrer_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  referredUserId: varchar("referred_user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  referredUserEmail: varchar("referred_user_email").notNull(),
  status: varchar("status", { 
    enum: ['pending', 'qualified', 'credited', 'expired'] 
  }).default('pending').notNull(),
  referrerCreditsAwarded: integer("referrer_credits_awarded").default(0).notNull(),
  referredCreditsAwarded: integer("referred_credits_awarded").default(0).notNull(),
  qualificationMet: boolean("qualification_met").default(false).notNull(), // Has user met minimum spend?
  qualificationAmount: integer("qualification_amount").default(0).notNull(), // Amount spent by referred user
  qualificationDate: timestamp("qualification_date"),
  creditedAt: timestamp("credited_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gift codes table for credit redemption system
export const giftCodes = pgTable("gift_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).notNull().unique(), // The redemption code (e.g., "BZ-WELCOME-2024")
  credits: integer("credits").notNull(), // Amount of credits this code gives
  description: text("description"), // What this code is for (e.g., "Welcome Bonus", "Contest Winner")
  maxUses: integer("max_uses").default(1).notNull(), // How many times this code can be used
  usedCount: integer("used_count").default(0).notNull(), // How many times it's been used
  isActive: boolean("is_active").default(true).notNull(), // Whether the code can still be redeemed
  expiresAt: timestamp("expires_at"), // Optional expiration date
  createdById: varchar("created_by_id").notNull().references(() => users.id), // Admin who created this code
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gift code redemptions table to track who used what codes
export const giftCodeRedemptions = pgTable("gift_code_redemptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  giftCodeId: varchar("gift_code_id").notNull().references(() => giftCodes.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  creditsReceived: integer("credits_received").notNull(), // Track exactly how many credits they got
  redeemedAt: timestamp("redeemed_at").defaultNow(),
});

// Relations for gift codes
export const giftCodesRelations = relations(giftCodes, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [giftCodes.createdById],
    references: [users.id],
    relationName: "createdGiftCodes",
  }),
  redemptions: many(giftCodeRedemptions),
}));

export const giftCodeRedemptionsRelations = relations(giftCodeRedemptions, ({ one }) => ({
  giftCode: one(giftCodes, {
    fields: [giftCodeRedemptions.giftCodeId],
    references: [giftCodes.id],
  }),
  user: one(users, {
    fields: [giftCodeRedemptions.userId],
    references: [users.id],
  }),
}));

// Insert schemas for gift codes
export const insertGiftCodeSchema = createInsertSchema(giftCodes).omit({
  id: true,
  usedCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGiftCodeRedemptionSchema = createInsertSchema(giftCodeRedemptions).omit({
  id: true,
  redeemedAt: true,
});

// Export gift code types
export type GiftCode = typeof giftCodes.$inferSelect;
export type InsertGiftCode = z.infer<typeof insertGiftCodeSchema>;
export type GiftCodeRedemption = typeof giftCodeRedemptions.$inferSelect;
export type InsertGiftCodeRedemption = z.infer<typeof insertGiftCodeRedemptionSchema>;

// DIRECTOR'S TOOLKIT TABLES

// Shot Lists
export const shotLists = pgTable("shot_lists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  description: text("description"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual Shots
export const shots = pgTable("shots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shotListId: varchar("shot_list_id").notNull().references(() => shotLists.id, { onDelete: 'cascade' }),
  shotNumber: varchar("shot_number").notNull(),
  sceneNumber: varchar("scene_number"),
  shotType: varchar("shot_type", { enum: ['wide', 'medium', 'close_up', 'extreme_close_up', 'over_shoulder', 'two_shot', 'insert', 'cutaway', 'establishing'] }),
  cameraMovement: varchar("camera_movement", { enum: ['static', 'pan', 'tilt', 'zoom', 'dolly', 'crane', 'handheld', 'steadicam'] }),
  description: text("description"),
  duration: integer("duration"), // in seconds
  location: varchar("location"),
  talent: text("talent"), // JSON array of cast members
  equipment: text("equipment"), // JSON array of required equipment
  notes: text("notes"),
  status: varchar("status", { enum: ['not_shot', 'in_progress', 'completed', 'needs_reshoot'] }).default('not_shot').notNull(),
  orderIndex: integer("order_index").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Production Schedule
export const scheduleItems = pgTable("schedule_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  type: varchar("type", { enum: ['shoot', 'rehearsal', 'meeting', 'prep', 'post', 'other'] }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: varchar("location"),
  description: text("description"),
  crewRequired: text("crew_required"), // JSON array
  equipmentRequired: text("equipment_required"), // JSON array
  notes: text("notes"),
  status: varchar("status", { enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'] }).default('scheduled').notNull(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Crew Management
export const crewMembers = pgTable("crew_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  role: varchar("role").notNull(),
  department: varchar("department", { enum: ['direction', 'camera', 'sound', 'lighting', 'art', 'wardrobe', 'makeup', 'production', 'post', 'other'] }),
  email: varchar("email"),
  phone: varchar("phone"),
  emergencyContact: varchar("emergency_contact"),
  rate: varchar("rate"),
  availability: text("availability"), // JSON
  notes: text("notes"),
  status: varchar("status", { enum: ['confirmed', 'pending', 'declined', 'standby'] }).default('pending').notNull(),
  addedBy: varchar("added_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Budget Items
export const budgetItems = pgTable("budget_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  category: varchar("category", { enum: ['pre_production', 'production', 'post_production', 'distribution', 'marketing', 'other'] }).notNull(),
  subcategory: varchar("subcategory"),
  description: varchar("description").notNull(),
  estimatedCost: integer("estimated_cost").default(0).notNull(), // in cents
  actualCost: integer("actual_cost").default(0).notNull(), // in cents
  status: varchar("status", { enum: ['planned', 'approved', 'purchased', 'paid'] }).default('planned').notNull(),
  vendor: varchar("vendor"),
  notes: text("notes"),
  receiptUrl: varchar("receipt_url"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Equipment Inventory
export const equipment = pgTable("equipment", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  category: varchar("category", { enum: ['camera', 'lens', 'audio', 'lighting', 'grip', 'electrical', 'other'] }).notNull(),
  brand: varchar("brand"),
  model: varchar("model"),
  serialNumber: varchar("serial_number"),
  status: varchar("status", { enum: ['available', 'checked_out', 'maintenance', 'lost', 'damaged'] }).default('available').notNull(),
  location: varchar("location"),
  condition: varchar("condition", { enum: ['excellent', 'good', 'fair', 'poor'] }).default('good').notNull(),
  rentalCost: integer("rental_cost").default(0).notNull(), // per day in cents
  notes: text("notes"),
  ownedBy: varchar("owned_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Locations
export const locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  address: text("address"),
  description: text("description"),
  type: varchar("type", { enum: ['interior', 'exterior', 'studio', 'practical', 'green_screen', 'other'] }),
  contactName: varchar("contact_name"),
  contactPhone: varchar("contact_phone"),
  contactEmail: varchar("contact_email"),
  permitRequired: boolean("permit_required").default(false).notNull(),
  permitCost: integer("permit_cost").default(0).notNull(),
  accessibility: text("accessibility"),
  powerAvailable: boolean("power_available").default(true).notNull(),
  parkingInfo: text("parking_info"),
  restrictions: text("restrictions"),
  photos: text("photos"), // JSON array of photo URLs
  status: varchar("status", { enum: ['scouted', 'approved', 'confirmed', 'used', 'unavailable'] }).default('scouted').notNull(),
  scoutedBy: varchar("scouted_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for Director's Toolkit
export const insertShotListSchema = createInsertSchema(shotLists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShotSchema = createInsertSchema(shots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScheduleItemSchema = createInsertSchema(scheduleItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCrewMemberSchema = createInsertSchema(crewMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBudgetItemSchema = createInsertSchema(budgetItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export Director's Toolkit types
export type ShotList = typeof shotLists.$inferSelect;
export type InsertShotList = z.infer<typeof insertShotListSchema>;
export type Shot = typeof shots.$inferSelect;
export type InsertShot = z.infer<typeof insertShotSchema>;
export type ScheduleItem = typeof scheduleItems.$inferSelect;
export type InsertScheduleItem = z.infer<typeof insertScheduleItemSchema>;
export type CrewMember = typeof crewMembers.$inferSelect;
export type InsertCrewMember = z.infer<typeof insertCrewMemberSchema>;
export type BudgetItem = typeof budgetItems.$inferSelect;
export type InsertBudgetItem = z.infer<typeof insertBudgetItemSchema>;
export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

// EDITOR'S TOOLKIT TABLES (Premium AI Features)

// AI Video Edit Projects
export const videoEditProjects = pgTable("video_edit_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  description: text("description"),
  sourceVideoUrl: varchar("source_video_url"),
  editedVideoUrl: varchar("edited_video_url"),
  status: varchar("status", { enum: ['draft', 'processing', 'completed', 'failed'] }).default('draft').notNull(),
  aiInstructions: text("ai_instructions"), // User's editing instructions for AI
  processingLog: text("processing_log"), // JSON log of AI processing steps
  creditsCost: integer("credits_cost").default(0).notNull(), // Total credits consumed
  duration: integer("duration"), // Video duration in seconds
  resolution: varchar("resolution"), // e.g., "1920x1080"
  format: varchar("format"), // e.g., "mp4", "mov"
  metadata: jsonb("metadata"), // Additional video metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// AI Edit Operations (tracks individual AI operations)
export const aiEditOperations = pgTable("ai_edit_operations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => videoEditProjects.id, { onDelete: 'cascade' }),
  operationType: varchar("operation_type", { 
    enum: ['color_correction', 'audio_enhancement', 'scene_detection', 'transition_generation', 'sound_effects', 'music_sync', 'noise_reduction', 'stabilization', 'slow_motion', 'speed_ramping', 'text_overlay', 'visual_effects'] 
  }).notNull(),
  parameters: jsonb("parameters"), // JSON parameters for the operation
  status: varchar("status", { enum: ['queued', 'processing', 'completed', 'failed'] }).default('queued').notNull(),
  creditsUsed: integer("credits_used").default(0).notNull(),
  processingTime: integer("processing_time"), // Time in seconds
  resultUrl: varchar("result_url"), // URL to the processed clip/result
  errorMessage: text("error_message"),
  aiModel: varchar("ai_model"), // Which AI model was used
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // AI confidence score
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// AI Audio Processing
export const audioProcessingJobs = pgTable("audio_processing_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => videoEditProjects.id, { onDelete: 'cascade' }),
  audioType: varchar("audio_type", { enum: ['voice', 'music', 'sfx', 'ambient'] }).notNull(),
  operation: varchar("operation", { enum: ['noise_reduction', 'enhancement', 'normalization', 'eq_adjustment', 'compression', 'reverb', 'dialogue_isolation'] }).notNull(),
  sourceAudioUrl: varchar("source_audio_url").notNull(),
  processedAudioUrl: varchar("processed_audio_url"),
  settings: jsonb("settings"), // Audio processing settings
  status: varchar("status", { enum: ['pending', 'processing', 'completed', 'failed'] }).default('pending').notNull(),
  creditsUsed: integer("credits_used").default(0).notNull(),
  qualityScore: decimal("quality_score", { precision: 3, scale: 2 }), // Audio quality improvement score
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// AI Visual Effects
export const visualEffectsJobs = pgTable("visual_effects_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => videoEditProjects.id, { onDelete: 'cascade' }),
  effectType: varchar("effect_type", { 
    enum: ['color_grading', 'background_removal', 'object_tracking', 'motion_blur', 'lens_flare', 'particle_effects', 'lighting_enhancement', 'skin_smoothing', 'sky_replacement'] 
  }).notNull(),
  parameters: jsonb("parameters"), // Effect-specific parameters
  sourceClipUrl: varchar("source_clip_url").notNull(),
  processedClipUrl: varchar("processed_clip_url"),
  maskData: jsonb("mask_data"), // For effects requiring masks
  status: varchar("status", { enum: ['queued', 'processing', 'completed', 'failed'] }).default('queued').notNull(),
  creditsUsed: integer("credits_used").default(0).notNull(),
  renderTime: integer("render_time"), // Rendering time in seconds
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Insert schemas for Editor's Toolkit
export const insertVideoEditProjectSchema = createInsertSchema(videoEditProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export const insertAiEditOperationSchema = createInsertSchema(aiEditOperations).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertAudioProcessingJobSchema = createInsertSchema(audioProcessingJobs).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertVisualEffectsJobSchema = createInsertSchema(visualEffectsJobs).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// File Management System
export const uploadedFiles = pgTable("uploaded_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name").notNull(),
  fileType: varchar("file_type", { 
    enum: ['script', 'video', 'audio', 'image', 'document', 'other'] 
  }).notNull(),
  mimeType: varchar("mime_type").notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  filePath: varchar("file_path").notNull(), // object storage path
  category: varchar("category", {
    enum: ['draft', 'final', 'reference', 'asset', 'submission', 'archive']
  }).default('draft').notNull(),
  tags: varchar("tags").array(), // searchable tags
  description: text("description"),
  isPublic: boolean("is_public").default(false).notNull(),
  downloadCount: integer("download_count").default(0).notNull(),
  version: integer("version").default(1).notNull(), // for version control
  parentFileId: varchar("parent_file_id").references(() => uploadedFiles.id), // for file versions
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Festival Submission Packets
export const festivalPackets = pgTable("festival_packets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  festivalName: varchar("festival_name").notNull(),
  submissionDeadline: timestamp("submission_deadline"),
  status: varchar("status", {
    enum: ['draft', 'ready', 'submitted', 'accepted', 'rejected']
  }).default('draft').notNull(),
  requirements: jsonb("requirements"), // festival-specific requirements
  packagedFilePath: varchar("packaged_file_path"), // final zip/package path
  submissionNotes: text("submission_notes"),
  trackingNumber: varchar("tracking_number"), // submission tracking
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  submittedAt: timestamp("submitted_at"),
});

// Festival Packet Files (junction table)
export const festivalPacketFiles = pgTable("festival_packet_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  packetId: varchar("packet_id").notNull().references(() => festivalPackets.id, { onDelete: 'cascade' }),
  fileId: varchar("file_id").notNull().references(() => uploadedFiles.id, { onDelete: 'cascade' }),
  fileRole: varchar("file_role", {
    enum: ['main_film', 'trailer', 'poster', 'press_kit', 'director_statement', 'screenplay', 'stills', 'other']
  }).notNull(),
  isRequired: boolean("is_required").default(false).notNull(),
  order: integer("order").default(0).notNull(), // display order
  createdAt: timestamp("created_at").defaultNow(),
});

// Export Templates for different purposes
export const exportTemplates = pgTable("export_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  templateType: varchar("template_type", {
    enum: ['festival_submission', 'press_kit', 'production_package', 'distribution_package', 'custom']
  }).notNull(),
  requiredFiles: jsonb("required_files"), // file roles required
  optionalFiles: jsonb("optional_files"), // optional file roles
  fileStructure: jsonb("file_structure"), // how files should be organized
  namingConvention: varchar("naming_convention"), // file naming rules
  isPublic: boolean("is_public").default(true).notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Monthly Veteran Credits Tracking
export const monthlyVeteranCredits = pgTable("monthly_veteran_credits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  month: varchar("month").notNull(), // Format: YYYY-MM
  year: integer("year").notNull(),
  veteransProcessed: integer("veterans_processed").default(0).notNull(),
  creditsAwarded: integer("credits_awarded").default(0).notNull(),
  processedAt: timestamp("processed_at").defaultNow(),
  processedBy: varchar("processed_by").references(() => users.id),
  notes: text("notes"),
});

// Insert schemas for File Management
export const insertUploadedFileSchema = createInsertSchema(uploadedFiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  downloadCount: true,
  version: true,
});

export const insertFestivalPacketSchema = createInsertSchema(festivalPackets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  submittedAt: true,
});

export const insertFestivalPacketFileSchema = createInsertSchema(festivalPacketFiles).omit({
  id: true,
  createdAt: true,
});

export const insertExportTemplateSchema = createInsertSchema(exportTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMonthlyVeteranCreditsSchema = createInsertSchema(monthlyVeteranCredits).omit({
  id: true,
  processedAt: true,
});

// Export Editor's Toolkit types
export type VideoEditProject = typeof videoEditProjects.$inferSelect;
export type InsertVideoEditProject = z.infer<typeof insertVideoEditProjectSchema>;
export type AiEditOperation = typeof aiEditOperations.$inferSelect;
export type InsertAiEditOperation = z.infer<typeof insertAiEditOperationSchema>;
export type AudioProcessingJob = typeof audioProcessingJobs.$inferSelect;
export type InsertAudioProcessingJob = z.infer<typeof insertAudioProcessingJobSchema>;
export type VisualEffectsJob = typeof visualEffectsJobs.$inferSelect;
export type InsertVisualEffectsJob = z.infer<typeof insertVisualEffectsJobSchema>;

// Export File Management types
export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type InsertUploadedFile = z.infer<typeof insertUploadedFileSchema>;
export type FestivalPacket = typeof festivalPackets.$inferSelect;
export type InsertFestivalPacket = z.infer<typeof insertFestivalPacketSchema>;
export type FestivalPacketFile = typeof festivalPacketFiles.$inferSelect;
export type InsertFestivalPacketFile = z.infer<typeof insertFestivalPacketFileSchema>;
export type ExportTemplate = typeof exportTemplates.$inferSelect;
export type InsertExportTemplate = z.infer<typeof insertExportTemplateSchema>;
export type MonthlyVeteranCredits = typeof monthlyVeteranCredits.$inferSelect;
export type InsertMonthlyVeteranCredits = z.infer<typeof insertMonthlyVeteranCreditsSchema>;

// Referral system relations
export const referralCodesRelations = relations(referralCodes, ({ one, many }) => ({
  user: one(users, {
    fields: [referralCodes.userId],
    references: [users.id],
  }),
  referrals: many(referrals),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referralCode: one(referralCodes, {
    fields: [referrals.referralCodeId],
    references: [referralCodes.id],
  }),
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrerRelation",
  }),
  referredUser: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
    relationName: "referredRelation",
  }),
}));

// Referral system insert schemas
export const insertReferralCodeSchema = createInsertSchema(referralCodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentUses: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  qualificationMet: true,
  qualificationDate: true,
  creditedAt: true,
});

// Export referral system types
export type ReferralCode = typeof referralCodes.$inferSelect;
export type InsertReferralCode = z.infer<typeof insertReferralCodeSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

// ACHIEVEMENT & BADGE SYSTEM

// Achievement definitions - predefined achievements users can unlock
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // e.g., "First Purchase", "Script Master"
  description: text("description").notNull(),
  badgeIcon: varchar("badge_icon").notNull(), // Lucide icon name
  badgeColor: varchar("badge_color").notNull(), // Tailwind color class
  category: varchar("category", { 
    enum: ['spending', 'content', 'social', 'special', 'veteran', 'supporter'] 
  }).notNull(),
  requirement: jsonb("requirement").notNull(), // JSON with criteria: { type: 'credits_spent', amount: 100 }
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievements - tracking which achievements users have unlocked
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id, { onDelete: 'cascade' }),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  progress: jsonb("progress"), // Optional progress tracking for multi-step achievements
}, (table) => ({
  // Ensure each user can only unlock each achievement once
  uniqueUserAchievement: unique().on(table.userId, table.achievementId),
}));

// Spending tiers - different tiers based on total credits spent
export const spendingTiers = pgTable("spending_tiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // e.g., "Supporter", "Producer", "Director"
  description: text("description").notNull(),
  minSpend: integer("min_spend").notNull(), // Minimum credits spent to reach this tier
  maxSpend: integer("max_spend"), // Maximum credits (null for highest tier)
  badgeIcon: varchar("badge_icon").notNull(),
  badgeColor: varchar("badge_color").notNull(),
  benefits: text("benefits"), // Description of tier benefits
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User spending tracker - tracks total credits spent by each user
export const userSpending = pgTable("user_spending", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  totalCreditsSpent: integer("total_credits_spent").default(0).notNull(),
  currentTierId: varchar("current_tier_id").references(() => spendingTiers.id),
  lastTierUpdate: timestamp("last_tier_update").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Achievement relations
export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const spendingTiersRelations = relations(spendingTiers, ({ many }) => ({
  userSpending: many(userSpending),
}));

export const userSpendingRelations = relations(userSpending, ({ one }) => ({
  user: one(users, {
    fields: [userSpending.userId],
    references: [users.id],
  }),
  currentTier: one(spendingTiers, {
    fields: [userSpending.currentTierId],
    references: [spendingTiers.id],
  }),
}));

// Achievement system insert schemas
export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});

export const insertSpendingTierSchema = createInsertSchema(spendingTiers).omit({
  id: true,
  createdAt: true,
});

export const insertUserSpendingSchema = createInsertSchema(userSpending).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export achievement system types
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type SpendingTier = typeof spendingTiers.$inferSelect;
export type InsertSpendingTier = z.infer<typeof insertSpendingTierSchema>;
export type UserSpending = typeof userSpending.$inferSelect;
export type InsertUserSpending = z.infer<typeof insertUserSpendingSchema>;

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
  pgEnum,
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
    enum: ['purchase', 'usage', 'bonus', 'refund', 'subscription_grant']
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

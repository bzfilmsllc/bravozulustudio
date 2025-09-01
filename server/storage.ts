import {
  users,
  friendRequests,
  friendships,
  scripts,
  projects,
  projectCollaborators,
  forumCategories,
  forumPosts,
  forumReplies,
  messages,
  reports,
  festivalSubmissions,
  designAssets,
  activities,
  creditTransactions,
  subscriptionPlans,
  notifications,
  type User,
  type UpsertUser,
  type InsertUser,
  type FriendRequest,
  type InsertFriendRequest,
  type Friendship,
  type Script,
  type InsertScript,
  type Project,
  type InsertProject,
  type ProjectCollaborator,
  type ForumCategory,
  type ForumPost,
  type InsertForumPost,
  type ForumReply,
  type InsertForumReply,
  type Message,
  type InsertMessage,
  type Report,
  type InsertReport,
  type FestivalSubmission,
  type InsertFestivalSubmission,
  type DesignAsset,
  type InsertDesignAsset,
  type Activity,
  type InsertActivity,
  type CreditTransaction,
  type InsertCreditTransaction,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: 'public' | 'pending' | 'verified'): Promise<User | undefined>;
  updateUserVerification(id: string, verificationData: {
    contactEmail?: string;
    relationshipType?: string;
    militaryBranch?: string;
    yearsOfService?: string;
    bio?: string;
    specialties?: string;
  }): Promise<User | undefined>;
  getVerifiedMembers(limit?: number): Promise<User[]>;
  
  // Friend operations
  sendFriendRequest(fromUserId: string, toUserId: string): Promise<FriendRequest>;
  getFriendRequests(userId: string, type: 'sent' | 'received'): Promise<(FriendRequest & { fromUser?: User; toUser?: User })[]>;
  updateFriendRequest(requestId: string, status: 'accepted' | 'rejected'): Promise<FriendRequest | undefined>;
  getFriends(userId: string): Promise<User[]>;
  
  // Script operations
  createScript(script: InsertScript): Promise<Script>;
  getUserScripts(userId: string): Promise<Script[]>;
  getScript(id: string): Promise<Script | undefined>;
  updateScript(id: string, updates: Partial<InsertScript>): Promise<Script | undefined>;
  deleteScript(id: string): Promise<void>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getUserProjects(userId: string): Promise<Project[]>;
  getPublicProjects(limit?: number): Promise<(Project & { creator: User })[]>;
  getProject(id: string): Promise<(Project & { creator: User; collaborators: (ProjectCollaborator & { user: User })[] }) | undefined>;
  joinProject(projectId: string, userId: string, role: string): Promise<ProjectCollaborator>;
  
  // Forum operations
  getForumCategories(): Promise<ForumCategory[]>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  getForumPosts(categoryId?: string, limit?: number): Promise<(ForumPost & { author: User; category: ForumCategory })[]>;
  getForumPost(id: string): Promise<(ForumPost & { author: User; replies: (ForumReply & { author: User })[] }) | undefined>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  
  // Messaging operations
  sendMessage(message: InsertMessage): Promise<Message>;
  getConversation(user1Id: string, user2Id: string): Promise<(Message & { sender: User; receiver: User })[]>;
  getUserConversations(userId: string): Promise<(Message & { sender: User; receiver: User })[]>;
  markMessageAsRead(messageId: string): Promise<void>;
  
  // Reporting operations
  createReport(report: InsertReport): Promise<Report>;
  getReports(status?: string): Promise<(Report & { reporter: User })[]>;
  updateReportStatus(reportId: string, status: 'reviewed' | 'resolved' | 'dismissed'): Promise<Report | undefined>;
  
  // Festival submission operations
  createFestivalSubmission(submission: InsertFestivalSubmission): Promise<FestivalSubmission>;
  getUserFestivalSubmissions(userId: string): Promise<(FestivalSubmission & { project?: Project; script?: Script })[]>;
  getFestivalSubmission(id: string): Promise<(FestivalSubmission & { project?: Project; script?: Script; submitter: User }) | undefined>;
  updateFestivalSubmission(id: string, updates: Partial<InsertFestivalSubmission>): Promise<FestivalSubmission | undefined>;
  deleteFestivalSubmission(id: string): Promise<void>;
  
  // Design asset operations
  createDesignAsset(asset: InsertDesignAsset): Promise<DesignAsset>;
  getUserDesignAssets(userId: string): Promise<(DesignAsset & { project?: Project })[]>;
  getPublicDesignAssets(limit?: number): Promise<(DesignAsset & { creator: User })[]>;
  getDesignAsset(id: string): Promise<(DesignAsset & { creator: User; project?: Project }) | undefined>;
  updateDesignAsset(id: string, updates: Partial<InsertDesignAsset>): Promise<DesignAsset | undefined>;
  deleteDesignAsset(id: string): Promise<void>;
  incrementDownloadCount(id: string): Promise<void>;
  
  // Credit system operations
  getUserCredits(userId: string): Promise<number>;
  addCredits(userId: string, amount: number, type: string, description: string, relatedEntityType?: string, relatedEntityId?: string, stripePaymentIntentId?: string): Promise<CreditTransaction>;
  useCredits(userId: string, amount: number, description: string, relatedEntityType?: string, relatedEntityId?: string): Promise<boolean>;
  getCreditTransactions(userId: string, limit?: number): Promise<CreditTransaction[]>;
  updateUserStripeInfo(userId: string, stripeCustomerId?: string, stripeSubscriptionId?: string): Promise<User | undefined>;
  updateUserSubscription(userId: string, plan: string, status: string, expiresAt?: Date): Promise<User | undefined>;
  
  // Subscription plan operations
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, limit?: number): Promise<Notification[]>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  deleteNotification(notificationId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: 'public' | 'pending' | 'verified'): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserVerification(id: string, verificationData: {
    contactEmail?: string;
    relationshipType?: string;
    militaryBranch?: string;
    yearsOfService?: string;
    bio?: string;
    specialties?: string;
  }): Promise<User | undefined> {
    const updateData: any = { updatedAt: new Date() };
    
    if (verificationData.contactEmail) updateData.contactEmail = verificationData.contactEmail;
    if (verificationData.relationshipType) updateData.relationshipType = verificationData.relationshipType;
    if (verificationData.militaryBranch) updateData.militaryBranch = verificationData.militaryBranch;
    if (verificationData.yearsOfService) updateData.yearsOfService = verificationData.yearsOfService;
    if (verificationData.bio) updateData.bio = verificationData.bio;
    if (verificationData.specialties) updateData.specialties = verificationData.specialties;
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getVerifiedMembers(limit = 50): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, 'verified'))
      .orderBy(desc(users.createdAt))
      .limit(limit);
  }

  // Friend operations
  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<FriendRequest> {
    const [request] = await db
      .insert(friendRequests)
      .values({ fromUserId, toUserId })
      .returning();
    return request;
  }

  async getFriendRequests(userId: string, type: 'sent' | 'received'): Promise<(FriendRequest & { fromUser?: User; toUser?: User })[]> {
    const condition = type === 'sent' 
      ? eq(friendRequests.fromUserId, userId)
      : eq(friendRequests.toUserId, userId);

    return await db
      .select({
        id: friendRequests.id,
        fromUserId: friendRequests.fromUserId,
        toUserId: friendRequests.toUserId,
        status: friendRequests.status,
        createdAt: friendRequests.createdAt,
        updatedAt: friendRequests.updatedAt,
        fromUser: users,
      })
      .from(friendRequests)
      .leftJoin(users, eq(friendRequests.fromUserId, users.id))
      .where(condition)
      .orderBy(desc(friendRequests.createdAt));
  }

  async updateFriendRequest(requestId: string, status: 'accepted' | 'rejected'): Promise<FriendRequest | undefined> {
    const [request] = await db
      .update(friendRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(friendRequests.id, requestId))
      .returning();

    // If accepted, create friendship
    if (request && status === 'accepted') {
      await db.insert(friendships).values({
        user1Id: request.fromUserId,
        user2Id: request.toUserId,
      });
    }

    return request;
  }

  async getFriends(userId: string): Promise<User[]> {
    const friendIds = await db
      .select({
        friendId: sql<string>`CASE 
          WHEN ${friendships.user1Id} = ${userId} THEN ${friendships.user2Id}
          ELSE ${friendships.user1Id}
        END`.as('friendId')
      })
      .from(friendships)
      .where(or(eq(friendships.user1Id, userId), eq(friendships.user2Id, userId)));

    if (friendIds.length === 0) return [];

    return await db
      .select()
      .from(users)
      .where(sql`${users.id} IN (${friendIds.map(f => `'${f.friendId}'`).join(',')})`);
  }

  // Script operations
  async createScript(script: InsertScript): Promise<Script> {
    const [newScript] = await db.insert(scripts).values(script).returning();
    return newScript;
  }

  async getUserScripts(userId: string): Promise<Script[]> {
    return await db
      .select()
      .from(scripts)
      .where(eq(scripts.authorId, userId))
      .orderBy(desc(scripts.updatedAt));
  }

  async getScript(id: string): Promise<Script | undefined> {
    const [script] = await db.select().from(scripts).where(eq(scripts.id, id));
    return script;
  }

  async updateScript(id: string, updates: Partial<InsertScript>): Promise<Script | undefined> {
    const [script] = await db
      .update(scripts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(scripts.id, id))
      .returning();
    return script;
  }

  async deleteScript(id: string): Promise<void> {
    await db.delete(scripts).where(eq(scripts.id, id));
  }

  // Project operations
  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.creatorId, userId))
      .orderBy(desc(projects.updatedAt));
  }

  async getPublicProjects(limit = 20): Promise<(Project & { creator: User })[]> {
    return await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        type: projects.type,
        status: projects.status,
        creatorId: projects.creatorId,
        scriptId: projects.scriptId,
        seekingRoles: projects.seekingRoles,
        isPublic: projects.isPublic,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        creator: users,
      })
      .from(projects)
      .leftJoin(users, eq(projects.creatorId, users.id))
      .where(eq(projects.isPublic, true))
      .orderBy(desc(projects.createdAt))
      .limit(limit);
  }

  async getProject(id: string): Promise<(Project & { creator: User; collaborators: (ProjectCollaborator & { user: User })[] }) | undefined> {
    const [project] = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        type: projects.type,
        status: projects.status,
        creatorId: projects.creatorId,
        scriptId: projects.scriptId,
        seekingRoles: projects.seekingRoles,
        isPublic: projects.isPublic,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        creator: users,
      })
      .from(projects)
      .leftJoin(users, eq(projects.creatorId, users.id))
      .where(eq(projects.id, id));

    if (!project) return undefined;

    const collaborators = await db
      .select({
        id: projectCollaborators.id,
        projectId: projectCollaborators.projectId,
        userId: projectCollaborators.userId,
        role: projectCollaborators.role,
        permissions: projectCollaborators.permissions,
        joinedAt: projectCollaborators.joinedAt,
        user: users,
      })
      .from(projectCollaborators)
      .leftJoin(users, eq(projectCollaborators.userId, users.id))
      .where(eq(projectCollaborators.projectId, id));

    return { ...project, collaborators };
  }

  async joinProject(projectId: string, userId: string, role: string): Promise<ProjectCollaborator> {
    const [collaborator] = await db
      .insert(projectCollaborators)
      .values({ projectId, userId, role })
      .returning();
    return collaborator;
  }

  // Forum operations
  async getForumCategories(): Promise<ForumCategory[]> {
    return await db
      .select()
      .from(forumCategories)
      .where(eq(forumCategories.isActive, true))
      .orderBy(asc(forumCategories.name));
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const [newPost] = await db.insert(forumPosts).values(post).returning();
    return newPost;
  }

  async getForumPosts(categoryId?: string, limit = 20): Promise<(ForumPost & { author: User; category: ForumCategory })[]> {
    let query = db
      .select({
        id: forumPosts.id,
        title: forumPosts.title,
        content: forumPosts.content,
        authorId: forumPosts.authorId,
        categoryId: forumPosts.categoryId,
        isSticky: forumPosts.isSticky,
        isLocked: forumPosts.isLocked,
        viewCount: forumPosts.viewCount,
        replyCount: forumPosts.replyCount,
        createdAt: forumPosts.createdAt,
        updatedAt: forumPosts.updatedAt,
        author: users,
        category: forumCategories,
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.authorId, users.id))
      .leftJoin(forumCategories, eq(forumPosts.categoryId, forumCategories.id));

    if (categoryId) {
      query = query.where(eq(forumPosts.categoryId, categoryId));
    }

    return await query
      .orderBy(desc(forumPosts.isSticky), desc(forumPosts.createdAt))
      .limit(limit);
  }

  async getForumPost(id: string): Promise<(ForumPost & { author: User; replies: (ForumReply & { author: User })[] }) | undefined> {
    const [post] = await db
      .select({
        id: forumPosts.id,
        title: forumPosts.title,
        content: forumPosts.content,
        authorId: forumPosts.authorId,
        categoryId: forumPosts.categoryId,
        isSticky: forumPosts.isSticky,
        isLocked: forumPosts.isLocked,
        viewCount: forumPosts.viewCount,
        replyCount: forumPosts.replyCount,
        createdAt: forumPosts.createdAt,
        updatedAt: forumPosts.updatedAt,
        author: users,
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.authorId, users.id))
      .where(eq(forumPosts.id, id));

    if (!post) return undefined;

    const replies = await db
      .select({
        id: forumReplies.id,
        content: forumReplies.content,
        authorId: forumReplies.authorId,
        postId: forumReplies.postId,
        parentReplyId: forumReplies.parentReplyId,
        createdAt: forumReplies.createdAt,
        updatedAt: forumReplies.updatedAt,
        author: users,
      })
      .from(forumReplies)
      .leftJoin(users, eq(forumReplies.authorId, users.id))
      .where(eq(forumReplies.postId, id))
      .orderBy(asc(forumReplies.createdAt));

    return { ...post, replies };
  }

  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    const [newReply] = await db.insert(forumReplies).values(reply).returning();
    
    // Update reply count
    await db
      .update(forumPosts)
      .set({ 
        replyCount: sql`CAST(${forumPosts.replyCount} AS INTEGER) + 1`,
        updatedAt: new Date()
      })
      .where(eq(forumPosts.id, reply.postId));

    return newReply;
  }

  // Messaging operations
  async sendMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getConversation(user1Id: string, user2Id: string): Promise<(Message & { sender: User; receiver: User })[]> {
    return await db
      .select({
        id: messages.id,
        content: messages.content,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        sender: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
        receiver: users,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(
        or(
          and(eq(messages.senderId, user1Id), eq(messages.receiverId, user2Id)),
          and(eq(messages.senderId, user2Id), eq(messages.receiverId, user1Id))
        )
      )
      .orderBy(asc(messages.createdAt));
  }

  async getUserConversations(userId: string): Promise<(Message & { sender: User; receiver: User })[]> {
    // Get the latest message for each conversation
    const latestMessages = await db
      .select({
        id: messages.id,
        content: messages.content,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        sender: users,
        receiver: users,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt))
      .limit(100);

    // Group by conversation partner and return the latest message for each
    const conversations = new Map();
    for (const message of latestMessages) {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, message);
      }
    }

    return Array.from(conversations.values());
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));
  }

  // Reporting operations
  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async getReports(status?: string): Promise<(Report & { reporter: User })[]> {
    let query = db
      .select({
        id: reports.id,
        reporterId: reports.reporterId,
        reportedUserId: reports.reportedUserId,
        reportedPostId: reports.reportedPostId,
        reportedReplyId: reports.reportedReplyId,
        reason: reports.reason,
        description: reports.description,
        status: reports.status,
        createdAt: reports.createdAt,
        updatedAt: reports.updatedAt,
        reporter: users,
      })
      .from(reports)
      .leftJoin(users, eq(reports.reporterId, users.id));

    if (status) {
      query = query.where(eq(reports.status, status));
    }

    return await query.orderBy(desc(reports.createdAt));
  }

  async updateReportStatus(reportId: string, status: 'reviewed' | 'resolved' | 'dismissed'): Promise<Report | undefined> {
    const [report] = await db
      .update(reports)
      .set({ status, updatedAt: new Date() })
      .where(eq(reports.id, reportId))
      .returning();
    return report;
  }

  // Festival submission operations
  async createFestivalSubmission(submission: InsertFestivalSubmission): Promise<FestivalSubmission> {
    const [festivalSubmission] = await db
      .insert(festivalSubmissions)
      .values(submission)
      .returning();
    return festivalSubmission;
  }

  async getUserFestivalSubmissions(userId: string): Promise<(FestivalSubmission & { project?: Project; script?: Script })[]> {
    const submissions = await db
      .select({
        id: festivalSubmissions.id,
        projectId: festivalSubmissions.projectId,
        scriptId: festivalSubmissions.scriptId,
        submitterId: festivalSubmissions.submitterId,
        festivalName: festivalSubmissions.festivalName,
        festivalLocation: festivalSubmissions.festivalLocation,
        festivalWebsite: festivalSubmissions.festivalWebsite,
        submissionCategory: festivalSubmissions.submissionCategory,
        submissionDeadline: festivalSubmissions.submissionDeadline,
        submissionFee: festivalSubmissions.submissionFee,
        status: festivalSubmissions.status,
        submittedAt: festivalSubmissions.submittedAt,
        responseReceived: festivalSubmissions.responseReceived,
        notes: festivalSubmissions.notes,
        createdAt: festivalSubmissions.createdAt,
        updatedAt: festivalSubmissions.updatedAt,
        project: projects,
        script: scripts,
      })
      .from(festivalSubmissions)
      .leftJoin(projects, eq(festivalSubmissions.projectId, projects.id))
      .leftJoin(scripts, eq(festivalSubmissions.scriptId, scripts.id))
      .where(eq(festivalSubmissions.submitterId, userId))
      .orderBy(desc(festivalSubmissions.createdAt));

    return submissions.map(submission => ({
      ...submission,
      project: submission.project || undefined,
      script: submission.script || undefined,
    }));
  }

  async getFestivalSubmission(id: string): Promise<(FestivalSubmission & { project?: Project; script?: Script; submitter: User }) | undefined> {
    const [submission] = await db
      .select({
        id: festivalSubmissions.id,
        projectId: festivalSubmissions.projectId,
        scriptId: festivalSubmissions.scriptId,
        submitterId: festivalSubmissions.submitterId,
        festivalName: festivalSubmissions.festivalName,
        festivalLocation: festivalSubmissions.festivalLocation,
        festivalWebsite: festivalSubmissions.festivalWebsite,
        submissionCategory: festivalSubmissions.submissionCategory,
        submissionDeadline: festivalSubmissions.submissionDeadline,
        submissionFee: festivalSubmissions.submissionFee,
        status: festivalSubmissions.status,
        submittedAt: festivalSubmissions.submittedAt,
        responseReceived: festivalSubmissions.responseReceived,
        notes: festivalSubmissions.notes,
        createdAt: festivalSubmissions.createdAt,
        updatedAt: festivalSubmissions.updatedAt,
        project: projects,
        script: scripts,
        submitter: users,
      })
      .from(festivalSubmissions)
      .leftJoin(projects, eq(festivalSubmissions.projectId, projects.id))
      .leftJoin(scripts, eq(festivalSubmissions.scriptId, scripts.id))
      .innerJoin(users, eq(festivalSubmissions.submitterId, users.id))
      .where(eq(festivalSubmissions.id, id));

    if (!submission) return undefined;

    return {
      ...submission,
      project: submission.project || undefined,
      script: submission.script || undefined,
    };
  }

  async updateFestivalSubmission(id: string, updates: Partial<InsertFestivalSubmission>): Promise<FestivalSubmission | undefined> {
    const [submission] = await db
      .update(festivalSubmissions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(festivalSubmissions.id, id))
      .returning();
    return submission;
  }

  async deleteFestivalSubmission(id: string): Promise<void> {
    await db.delete(festivalSubmissions).where(eq(festivalSubmissions.id, id));
  }

  // Design asset operations
  async createDesignAsset(asset: InsertDesignAsset): Promise<DesignAsset> {
    const [designAsset] = await db
      .insert(designAssets)
      .values(asset)
      .returning();
    return designAsset;
  }

  async getUserDesignAssets(userId: string): Promise<(DesignAsset & { project?: Project })[]> {
    const assets = await db
      .select({
        id: designAssets.id,
        creatorId: designAssets.creatorId,
        projectId: designAssets.projectId,
        title: designAssets.title,
        description: designAssets.description,
        assetType: designAssets.assetType,
        category: designAssets.category,
        imageUrl: designAssets.imageUrl,
        prompt: designAssets.prompt,
        dimensions: designAssets.dimensions,
        tags: designAssets.tags,
        isPublic: designAssets.isPublic,
        downloadCount: designAssets.downloadCount,
        createdAt: designAssets.createdAt,
        updatedAt: designAssets.updatedAt,
        project: projects,
      })
      .from(designAssets)
      .leftJoin(projects, eq(designAssets.projectId, projects.id))
      .where(eq(designAssets.creatorId, userId))
      .orderBy(desc(designAssets.createdAt));

    return assets.map(asset => ({
      ...asset,
      project: asset.project || undefined,
    }));
  }

  async getPublicDesignAssets(limit: number = 50): Promise<(DesignAsset & { creator: User })[]> {
    const assets = await db
      .select({
        id: designAssets.id,
        creatorId: designAssets.creatorId,
        projectId: designAssets.projectId,
        title: designAssets.title,
        description: designAssets.description,
        assetType: designAssets.assetType,
        category: designAssets.category,
        imageUrl: designAssets.imageUrl,
        prompt: designAssets.prompt,
        dimensions: designAssets.dimensions,
        tags: designAssets.tags,
        isPublic: designAssets.isPublic,
        downloadCount: designAssets.downloadCount,
        createdAt: designAssets.createdAt,
        updatedAt: designAssets.updatedAt,
        creator: users,
      })
      .from(designAssets)
      .innerJoin(users, eq(designAssets.creatorId, users.id))
      .where(eq(designAssets.isPublic, true))
      .orderBy(desc(designAssets.createdAt))
      .limit(limit);

    return assets;
  }

  async getDesignAsset(id: string): Promise<(DesignAsset & { creator: User; project?: Project }) | undefined> {
    const [asset] = await db
      .select({
        id: designAssets.id,
        creatorId: designAssets.creatorId,
        projectId: designAssets.projectId,
        title: designAssets.title,
        description: designAssets.description,
        assetType: designAssets.assetType,
        category: designAssets.category,
        imageUrl: designAssets.imageUrl,
        prompt: designAssets.prompt,
        dimensions: designAssets.dimensions,
        tags: designAssets.tags,
        isPublic: designAssets.isPublic,
        downloadCount: designAssets.downloadCount,
        createdAt: designAssets.createdAt,
        updatedAt: designAssets.updatedAt,
        creator: users,
        project: projects,
      })
      .from(designAssets)
      .innerJoin(users, eq(designAssets.creatorId, users.id))
      .leftJoin(projects, eq(designAssets.projectId, projects.id))
      .where(eq(designAssets.id, id));

    if (!asset) return undefined;

    return {
      ...asset,
      project: asset.project || undefined,
    };
  }

  async updateDesignAsset(id: string, updates: Partial<InsertDesignAsset>): Promise<DesignAsset | undefined> {
    const [asset] = await db
      .update(designAssets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(designAssets.id, id))
      .returning();
    return asset;
  }

  async deleteDesignAsset(id: string): Promise<void> {
    await db.delete(designAssets).where(eq(designAssets.id, id));
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await db
      .update(designAssets)
      .set({ 
        downloadCount: sql`${designAssets.downloadCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(designAssets.id, id));
  }

  // Activity operations
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  async getRecentActivities(limit = 20): Promise<(Activity & { user: User })[]> {
    return await db
      .select({
        id: activities.id,
        userId: activities.userId,
        type: activities.type,
        title: activities.title,
        description: activities.description,
        link: activities.link,
        metadata: activities.metadata,
        createdAt: activities.createdAt,
        user: users,
      })
      .from(activities)
      .innerJoin(users, eq(activities.userId, users.id))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async getUserActivities(userId: string, limit = 20): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  // Enhanced member operations
  async getMembers(limit = 50): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit);
  }

  async searchMembers(query: string, limit = 20): Promise<User[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return await db
      .select()
      .from(users)
      .where(
        or(
          sql`LOWER(${users.firstName}) LIKE ${searchTerm}`,
          sql`LOWER(${users.lastName}) LIKE ${searchTerm}`,
          sql`LOWER(${users.email}) LIKE ${searchTerm}`,
          sql`LOWER(${users.bio}) LIKE ${searchTerm}`
        )
      )
      .orderBy(desc(users.createdAt))
      .limit(limit);
  }

  async getFriendshipStatus(userId: string, otherUserId: string): Promise<{ status: 'none' | 'pending' | 'friends' }> {
    // Check if they are friends
    const [friendship] = await db
      .select()
      .from(friendships)
      .where(
        or(
          and(eq(friendships.user1Id, userId), eq(friendships.user2Id, otherUserId)),
          and(eq(friendships.user1Id, otherUserId), eq(friendships.user2Id, userId))
        )
      );

    if (friendship) {
      return { status: 'friends' };
    }

    // Check if there's a pending request
    const [pendingRequest] = await db
      .select()
      .from(friendRequests)
      .where(
        and(
          or(
            and(eq(friendRequests.fromUserId, userId), eq(friendRequests.toUserId, otherUserId)),
            and(eq(friendRequests.fromUserId, otherUserId), eq(friendRequests.toUserId, userId))
          ),
          eq(friendRequests.status, 'pending')
        )
      );

    if (pendingRequest) {
      return { status: 'pending' };
    }

    return { status: 'none' };
  }

  // Credit system operations
  async getUserCredits(userId: string): Promise<number> {
    const [user] = await db.select({ credits: users.credits }).from(users).where(eq(users.id, userId));
    return user?.credits || 0;
  }

  async addCredits(userId: string, amount: number, type: string, description: string, relatedEntityType?: string, relatedEntityId?: string, stripePaymentIntentId?: string): Promise<CreditTransaction> {
    const [transaction] = await db.transaction(async (tx) => {
      // Update user credits
      await tx
        .update(users)
        .set({ 
          credits: sql`${users.credits} + ${amount}`,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      // Create transaction record
      return await tx
        .insert(creditTransactions)
        .values({
          userId,
          amount,
          type,
          description,
          relatedEntityType,
          relatedEntityId,
          stripePaymentIntentId,
        })
        .returning();
    });

    return transaction;
  }

  async useCredits(userId: string, amount: number, description: string, relatedEntityType?: string, relatedEntityId?: string): Promise<boolean> {
    const [result] = await db.transaction(async (tx) => {
      // Check if user has enough credits
      const [user] = await tx.select({ credits: users.credits }).from(users).where(eq(users.id, userId));
      
      if (!user || user.credits < amount) {
        return [false];
      }

      // Deduct credits
      await tx
        .update(users)
        .set({ 
          credits: sql`${users.credits} - ${amount}`,
          totalCreditsUsed: sql`${users.totalCreditsUsed} + ${amount}`,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      // Create transaction record
      await tx
        .insert(creditTransactions)
        .values({
          userId,
          amount: -amount, // Negative for usage
          type: 'usage',
          description,
          relatedEntityType,
          relatedEntityId,
        });

      return [true];
    });

    return result;
  }

  async getCreditTransactions(userId: string, limit = 50): Promise<CreditTransaction[]> {
    return await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(limit);
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId?: string, stripeSubscriptionId?: string): Promise<User | undefined> {
    const updateData: any = { updatedAt: new Date() };
    if (stripeCustomerId) updateData.stripeCustomerId = stripeCustomerId;
    if (stripeSubscriptionId) updateData.stripeSubscriptionId = stripeSubscriptionId;

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    return user;
  }

  async updateUserSubscription(userId: string, plan: string, status: string, expiresAt?: Date): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        subscriptionPlan: plan,
        subscriptionStatus: status,
        subscriptionExpiresAt: expiresAt,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    return user;
  }

  // Subscription plan operations
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(asc(subscriptionPlans.price));
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [newPlan] = await db
      .insert(subscriptionPlans)
      .values(plan)
      .returning();

    return newPlan;
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.id, notificationId));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result[0]?.count || 0;
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await db
      .delete(notifications)
      .where(eq(notifications.id, notificationId));
  }
}

export const storage = new DatabaseStorage();

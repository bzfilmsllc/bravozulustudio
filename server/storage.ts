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
  giftCodes,
  giftCodeRedemptions,
  referralCodes,
  referrals,
  // Director's Toolkit tables
  shotLists,
  shots,
  scheduleItems,
  crewMembers,
  budgetItems,
  equipment,
  locations,
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
  type GiftCode,
  type InsertGiftCode,
  type GiftCodeRedemption,
  type InsertGiftCodeRedemption,
  type ReferralCode,
  type InsertReferralCode,
  type Referral,
  type InsertReferral,
  // Director's Toolkit types
  type ShotList,
  type InsertShotList,
  type Shot,
  type InsertShot,
  type ScheduleItem,
  type InsertScheduleItem,
  type CrewMember,
  type InsertCrewMember,
  type BudgetItem,
  type InsertBudgetItem,
  type Equipment,
  type InsertEquipment,
  type Location,
  type InsertLocation,
  // Editor's Toolkit tables
  videoEditProjects,
  // File Management tables
  uploadedFiles,
  festivalPackets,
  festivalPacketFiles,
  exportTemplates,
  monthlyVeteranCredits,
  aiEditOperations,
  audioProcessingJobs,
  visualEffectsJobs,
  // Editor's Toolkit types
  type VideoEditProject,
  type InsertVideoEditProject,
  type AiEditOperation,
  type InsertAiEditOperation,
  type AudioProcessingJob,
  type InsertAudioProcessingJob,
  type VisualEffectsJob,
  type InsertVisualEffectsJob,
  // File Management types
  type UploadedFile,
  type InsertUploadedFile,
  type FestivalPacket,
  type InsertFestivalPacket,
  type FestivalPacketFile,
  type InsertFestivalPacketFile,
  type ExportTemplate,
  type InsertExportTemplate,
  type MonthlyVeteranCredits,
  type InsertMonthlyVeteranCredits,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, count, sql, isNotNull } from "drizzle-orm";

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
  updateUserCredits(userId: string, newAmount: number): Promise<User | undefined>;
  
  // Tutorial and onboarding operations
  updateTutorialProgress(userId: string, updates: {
    tutorialStep?: number;
    hasCompletedOnboarding?: boolean;
    hasReceivedWelcomePackage?: boolean;
    tutorialCompletedAt?: Date;
    lastTutorialInteraction?: Date;
  }): Promise<User | undefined>;
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

  // EDITOR'S TOOLKIT METHODS (Premium AI Features)
  
  // Video Edit Projects
  getVideoEditProjects(userId: string): Promise<VideoEditProject[]>;
  createVideoEditProject(project: InsertVideoEditProject): Promise<VideoEditProject>;
  getVideoEditProject(id: string, userId: string): Promise<VideoEditProject | undefined>;
  updateVideoEditProject(id: string, userId: string, updates: Partial<InsertVideoEditProject>): Promise<VideoEditProject | undefined>;
  deleteVideoEditProject(id: string, userId: string): Promise<void>;

  // AI Edit Operations
  getAiEditOperations(projectId: string, userId: string): Promise<AiEditOperation[]>;
  createAiEditOperation(operation: InsertAiEditOperation): Promise<AiEditOperation>;
  getAiEditOperation(id: string, userId: string): Promise<AiEditOperation | undefined>;
  updateAiEditOperation(id: string, userId: string, updates: Partial<InsertAiEditOperation>): Promise<AiEditOperation | undefined>;

  // Audio Processing Jobs
  getAudioProcessingJobs(projectId: string, userId: string): Promise<AudioProcessingJob[]>;
  createAudioProcessingJob(job: InsertAudioProcessingJob): Promise<AudioProcessingJob>;
  getAudioProcessingJob(id: string, userId: string): Promise<AudioProcessingJob | undefined>;
  updateAudioProcessingJob(id: string, userId: string, updates: Partial<InsertAudioProcessingJob>): Promise<AudioProcessingJob | undefined>;

  // Visual Effects Jobs
  getVisualEffectsJobs(projectId: string, userId: string): Promise<VisualEffectsJob[]>;
  createVisualEffectsJob(job: InsertVisualEffectsJob): Promise<VisualEffectsJob>;
  getVisualEffectsJob(id: string, userId: string): Promise<VisualEffectsJob | undefined>;
  updateVisualEffectsJob(id: string, userId: string, updates: Partial<InsertVisualEffectsJob>): Promise<VisualEffectsJob | undefined>;

  // Admin Functions
  getAllUsers(): Promise<User[]>;
  getSystemStats(): Promise<any>;
  awardCredits(userId: string, amount: number, reason: string, adminUserId: string): Promise<void>;
  verifyMilitaryService(userId: string, verification: any): Promise<void>;
  updateMilitaryService(userId: string, serviceData: any): Promise<User | undefined>;
  processMonthlyVeteranCredits(adminUserId: string): Promise<any>;
  getCreditTransactions(): Promise<any[]>;
  getVerificationRequests(): Promise<any[]>;
  
  // Gift code operations
  createGiftCode(giftCode: InsertGiftCode): Promise<GiftCode>;
  getGiftCode(code: string): Promise<GiftCode | undefined>;
  getGiftCodes(createdById?: string): Promise<(GiftCode & { createdBy: User; redemptions: GiftCodeRedemption[] })[]>;
  redeemGiftCode(code: string, userId: string): Promise<{ success: boolean; message: string; creditsReceived?: number }>;
  updateGiftCode(id: string, updates: Partial<InsertGiftCode>): Promise<GiftCode | undefined>;
  deactivateGiftCode(id: string): Promise<GiftCode | undefined>;
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

  async updateUserCredits(userId: string, newAmount: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        credits: newAmount,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    return user;
  }

  async updateTutorialProgress(userId: string, updates: {
    tutorialStep?: number;
    hasCompletedOnboarding?: boolean;
    hasReceivedWelcomePackage?: boolean;
    tutorialCompletedAt?: Date;
    lastTutorialInteraction?: Date;
  }): Promise<User | undefined> {
    const updateData: any = { updatedAt: new Date() };
    
    if (updates.tutorialStep !== undefined) updateData.tutorialStep = updates.tutorialStep;
    if (updates.hasCompletedOnboarding !== undefined) updateData.hasCompletedOnboarding = updates.hasCompletedOnboarding;
    if (updates.hasReceivedWelcomePackage !== undefined) updateData.hasReceivedWelcomePackage = updates.hasReceivedWelcomePackage;
    if (updates.tutorialCompletedAt) updateData.tutorialCompletedAt = updates.tutorialCompletedAt;
    if (updates.lastTutorialInteraction) updateData.lastTutorialInteraction = updates.lastTutorialInteraction;

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    return user;
  }

  // DIRECTOR'S TOOLKIT METHODS

  // Shot List Management
  async createShotList(shotList: InsertShotList): Promise<ShotList> {
    const [newShotList] = await db.insert(shotLists).values(shotList).returning();
    return newShotList;
  }

  async getProjectShotLists(projectId: string): Promise<ShotList[]> {
    return await db.select().from(shotLists).where(eq(shotLists.projectId, projectId)).orderBy(desc(shotLists.createdAt));
  }

  async getShotList(id: string): Promise<ShotList | undefined> {
    const [shotList] = await db.select().from(shotLists).where(eq(shotLists.id, id));
    return shotList;
  }

  async updateShotList(id: string, data: Partial<InsertShotList>): Promise<void> {
    await db
      .update(shotLists)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(shotLists.id, id));
  }

  async deleteShotList(id: string): Promise<void> {
    await db.delete(shotLists).where(eq(shotLists.id, id));
  }

  // Shot Management
  async createShot(shot: InsertShot): Promise<Shot> {
    const [newShot] = await db.insert(shots).values(shot).returning();
    return newShot;
  }

  async getShotListShots(shotListId: string): Promise<Shot[]> {
    return await db.select().from(shots).where(eq(shots.shotListId, shotListId)).orderBy(asc(shots.orderIndex));
  }

  async updateShot(id: string, data: Partial<InsertShot>): Promise<void> {
    await db
      .update(shots)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(shots.id, id));
  }

  async deleteShot(id: string): Promise<void> {
    await db.delete(shots).where(eq(shots.id, id));
  }

  // Schedule Management
  async createScheduleItem(item: InsertScheduleItem): Promise<ScheduleItem> {
    const [newItem] = await db.insert(scheduleItems).values(item).returning();
    return newItem;
  }

  async getProjectSchedule(projectId: string): Promise<ScheduleItem[]> {
    return await db.select().from(scheduleItems).where(eq(scheduleItems.projectId, projectId)).orderBy(asc(scheduleItems.startDate));
  }

  async updateScheduleItem(id: string, data: Partial<InsertScheduleItem>): Promise<void> {
    await db
      .update(scheduleItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(scheduleItems.id, id));
  }

  async deleteScheduleItem(id: string): Promise<void> {
    await db.delete(scheduleItems).where(eq(scheduleItems.id, id));
  }

  // Crew Management
  async addCrewMember(member: InsertCrewMember): Promise<CrewMember> {
    const [newMember] = await db.insert(crewMembers).values(member).returning();
    return newMember;
  }

  async getProjectCrew(projectId: string): Promise<CrewMember[]> {
    return await db.select().from(crewMembers).where(eq(crewMembers.projectId, projectId)).orderBy(asc(crewMembers.department));
  }

  async updateCrewMember(id: string, data: Partial<InsertCrewMember>): Promise<void> {
    await db
      .update(crewMembers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(crewMembers.id, id));
  }

  async removeCrewMember(id: string): Promise<void> {
    await db.delete(crewMembers).where(eq(crewMembers.id, id));
  }

  // Budget Management
  async createBudgetItem(item: InsertBudgetItem): Promise<BudgetItem> {
    const [newItem] = await db.insert(budgetItems).values(item).returning();
    return newItem;
  }

  async getProjectBudget(projectId: string): Promise<BudgetItem[]> {
    return await db.select().from(budgetItems).where(eq(budgetItems.projectId, projectId)).orderBy(asc(budgetItems.category));
  }

  async updateBudgetItem(id: string, data: Partial<InsertBudgetItem>): Promise<void> {
    await db
      .update(budgetItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(budgetItems.id, id));
  }

  async deleteBudgetItem(id: string): Promise<void> {
    await db.delete(budgetItems).where(eq(budgetItems.id, id));
  }

  // Equipment Management
  async addEquipment(equipment: InsertEquipment): Promise<Equipment> {
    const [newEquipment] = await db.insert(equipment).values(equipment).returning();
    return newEquipment;
  }

  async getProjectEquipment(projectId: string): Promise<Equipment[]> {
    return await db.select().from(equipment).where(eq(equipment.projectId, projectId)).orderBy(asc(equipment.category));
  }

  async getUserEquipment(userId: string): Promise<Equipment[]> {
    return await db.select().from(equipment).where(eq(equipment.ownedBy, userId)).orderBy(asc(equipment.category));
  }

  async updateEquipment(id: string, data: Partial<InsertEquipment>): Promise<void> {
    await db
      .update(equipment)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(equipment.id, id));
  }

  async deleteEquipment(id: string): Promise<void> {
    await db.delete(equipment).where(eq(equipment.id, id));
  }

  // Location Management
  async addLocation(location: InsertLocation): Promise<Location> {
    const [newLocation] = await db.insert(locations).values(location).returning();
    return newLocation;
  }

  async getProjectLocations(projectId: string): Promise<Location[]> {
    return await db.select().from(locations).where(eq(locations.projectId, projectId)).orderBy(asc(locations.name));
  }

  async getUserLocations(userId: string): Promise<Location[]> {
    return await db.select().from(locations).where(eq(locations.scoutedBy, userId)).orderBy(asc(locations.name));
  }

  async updateLocation(id: string, data: Partial<InsertLocation>): Promise<void> {
    await db
      .update(locations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(locations.id, id));
  }

  async deleteLocation(id: string): Promise<void> {
    await db.delete(locations).where(eq(locations.id, id));
  }
  // EDITOR'S TOOLKIT IMPLEMENTATIONS (Premium AI Features)

  // Video Edit Projects
  async getVideoEditProjects(userId: string): Promise<VideoEditProject[]> {
    return await db.select().from(videoEditProjects).where(eq(videoEditProjects.userId, userId)).orderBy(desc(videoEditProjects.createdAt));
  }

  async createVideoEditProject(project: InsertVideoEditProject): Promise<VideoEditProject> {
    const [newProject] = await db.insert(videoEditProjects).values(project).returning();
    return newProject;
  }

  async getVideoEditProject(id: string, userId: string): Promise<VideoEditProject | undefined> {
    const [project] = await db.select().from(videoEditProjects).where(and(eq(videoEditProjects.id, id), eq(videoEditProjects.userId, userId)));
    return project;
  }

  async updateVideoEditProject(id: string, userId: string, updates: Partial<InsertVideoEditProject>): Promise<VideoEditProject | undefined> {
    const [project] = await db
      .update(videoEditProjects)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(videoEditProjects.id, id), eq(videoEditProjects.userId, userId)))
      .returning();
    return project;
  }

  async deleteVideoEditProject(id: string, userId: string): Promise<void> {
    await db.delete(videoEditProjects).where(and(eq(videoEditProjects.id, id), eq(videoEditProjects.userId, userId)));
  }

  // AI Edit Operations
  async getAiEditOperations(projectId: string, userId: string): Promise<AiEditOperation[]> {
    // First verify the project belongs to the user
    const project = await this.getVideoEditProject(projectId, userId);
    if (!project) return [];
    
    return await db.select().from(aiEditOperations).where(eq(aiEditOperations.projectId, projectId)).orderBy(desc(aiEditOperations.createdAt));
  }

  async createAiEditOperation(operation: InsertAiEditOperation): Promise<AiEditOperation> {
    const [newOperation] = await db.insert(aiEditOperations).values(operation).returning();
    return newOperation;
  }

  async getAiEditOperation(id: string, userId: string): Promise<AiEditOperation | undefined> {
    const [operation] = await db
      .select()
      .from(aiEditOperations)
      .innerJoin(videoEditProjects, eq(aiEditOperations.projectId, videoEditProjects.id))
      .where(and(eq(aiEditOperations.id, id), eq(videoEditProjects.userId, userId)));
    return operation.ai_edit_operations;
  }

  async updateAiEditOperation(id: string, userId: string, updates: Partial<InsertAiEditOperation>): Promise<AiEditOperation | undefined> {
    // First verify the operation belongs to the user through project ownership
    const operation = await this.getAiEditOperation(id, userId);
    if (!operation) return undefined;

    const [updatedOperation] = await db
      .update(aiEditOperations)
      .set(updates)
      .where(eq(aiEditOperations.id, id))
      .returning();
    return updatedOperation;
  }

  // Audio Processing Jobs
  async getAudioProcessingJobs(projectId: string, userId: string): Promise<AudioProcessingJob[]> {
    // First verify the project belongs to the user
    const project = await this.getVideoEditProject(projectId, userId);
    if (!project) return [];
    
    return await db.select().from(audioProcessingJobs).where(eq(audioProcessingJobs.projectId, projectId)).orderBy(desc(audioProcessingJobs.createdAt));
  }

  async createAudioProcessingJob(job: InsertAudioProcessingJob): Promise<AudioProcessingJob> {
    const [newJob] = await db.insert(audioProcessingJobs).values(job).returning();
    return newJob;
  }

  async getAudioProcessingJob(id: string, userId: string): Promise<AudioProcessingJob | undefined> {
    const [job] = await db
      .select()
      .from(audioProcessingJobs)
      .innerJoin(videoEditProjects, eq(audioProcessingJobs.projectId, videoEditProjects.id))
      .where(and(eq(audioProcessingJobs.id, id), eq(videoEditProjects.userId, userId)));
    return job.audio_processing_jobs;
  }

  async updateAudioProcessingJob(id: string, userId: string, updates: Partial<InsertAudioProcessingJob>): Promise<AudioProcessingJob | undefined> {
    // First verify the job belongs to the user through project ownership
    const job = await this.getAudioProcessingJob(id, userId);
    if (!job) return undefined;

    const [updatedJob] = await db
      .update(audioProcessingJobs)
      .set(updates)
      .where(eq(audioProcessingJobs.id, id))
      .returning();
    return updatedJob;
  }

  // Visual Effects Jobs
  async getVisualEffectsJobs(projectId: string, userId: string): Promise<VisualEffectsJob[]> {
    // First verify the project belongs to the user
    const project = await this.getVideoEditProject(projectId, userId);
    if (!project) return [];
    
    return await db.select().from(visualEffectsJobs).where(eq(visualEffectsJobs.projectId, projectId)).orderBy(desc(visualEffectsJobs.createdAt));
  }

  async createVisualEffectsJob(job: InsertVisualEffectsJob): Promise<VisualEffectsJob> {
    const [newJob] = await db.insert(visualEffectsJobs).values(job).returning();
    return newJob;
  }

  async getVisualEffectsJob(id: string, userId: string): Promise<VisualEffectsJob | undefined> {
    const [job] = await db
      .select()
      .from(visualEffectsJobs)
      .innerJoin(videoEditProjects, eq(visualEffectsJobs.projectId, videoEditProjects.id))
      .where(and(eq(visualEffectsJobs.id, id), eq(videoEditProjects.userId, userId)));
    return job.visual_effects_jobs;
  }

  async updateVisualEffectsJob(id: string, userId: string, updates: Partial<InsertVisualEffectsJob>): Promise<VisualEffectsJob | undefined> {
    // First verify the job belongs to the user through project ownership
    const job = await this.getVisualEffectsJob(id, userId);
    if (!job) return undefined;

    const [updatedJob] = await db
      .update(visualEffectsJobs)
      .set(updates)
      .where(eq(visualEffectsJobs.id, id))
      .returning();
    return updatedJob;
  }

  // FILE MANAGEMENT IMPLEMENTATIONS

  // File operations
  async getUserFiles(userId: string): Promise<UploadedFile[]> {
    return await db.select().from(uploadedFiles).where(eq(uploadedFiles.userId, userId)).orderBy(desc(uploadedFiles.createdAt));
  }

  async createFile(file: InsertUploadedFile): Promise<UploadedFile> {
    const [newFile] = await db.insert(uploadedFiles).values(file).returning();
    return newFile;
  }

  async getFile(id: string, userId: string): Promise<UploadedFile | undefined> {
    const [file] = await db.select().from(uploadedFiles).where(and(eq(uploadedFiles.id, id), eq(uploadedFiles.userId, userId)));
    return file;
  }

  async updateFile(id: string, userId: string, updates: Partial<InsertUploadedFile>): Promise<UploadedFile | undefined> {
    const [file] = await db
      .update(uploadedFiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(uploadedFiles.id, id), eq(uploadedFiles.userId, userId)))
      .returning();
    return file;
  }

  async deleteFile(id: string, userId: string): Promise<void> {
    await db.delete(uploadedFiles).where(and(eq(uploadedFiles.id, id), eq(uploadedFiles.userId, userId)));
  }

  async incrementFileDownload(id: string): Promise<void> {
    await db
      .update(uploadedFiles)
      .set({ downloadCount: sql`${uploadedFiles.downloadCount} + 1` })
      .where(eq(uploadedFiles.id, id));
  }

  // Festival Packet operations
  async getFestivalPackets(userId: string): Promise<FestivalPacket[]> {
    return await db.select().from(festivalPackets).where(eq(festivalPackets.userId, userId)).orderBy(desc(festivalPackets.createdAt));
  }

  async createFestivalPacket(packet: InsertFestivalPacket): Promise<FestivalPacket> {
    const [newPacket] = await db.insert(festivalPackets).values(packet).returning();
    return newPacket;
  }

  async getFestivalPacket(id: string, userId: string): Promise<FestivalPacket | undefined> {
    const [packet] = await db.select().from(festivalPackets).where(and(eq(festivalPackets.id, id), eq(festivalPackets.userId, userId)));
    return packet;
  }

  async updateFestivalPacket(id: string, userId: string, updates: Partial<InsertFestivalPacket>): Promise<FestivalPacket | undefined> {
    const [packet] = await db
      .update(festivalPackets)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(festivalPackets.id, id), eq(festivalPackets.userId, userId)))
      .returning();
    return packet;
  }

  async deleteFestivalPacket(id: string, userId: string): Promise<void> {
    await db.delete(festivalPackets).where(and(eq(festivalPackets.id, id), eq(festivalPackets.userId, userId)));
  }

  // Festival Packet Files operations
  async addFileToPacket(packetId: string, fileId: string, fileRole: string, isRequired = false): Promise<FestivalPacketFile> {
    const [packetFile] = await db.insert(festivalPacketFiles).values({
      packetId,
      fileId,
      fileRole,
      isRequired,
    }).returning();
    return packetFile;
  }

  async removeFileFromPacket(packetId: string, fileId: string): Promise<void> {
    await db.delete(festivalPacketFiles).where(
      and(eq(festivalPacketFiles.packetId, packetId), eq(festivalPacketFiles.fileId, fileId))
    );
  }

  async getPacketFiles(packetId: string): Promise<FestivalPacketFile[]> {
    return await db.select().from(festivalPacketFiles).where(eq(festivalPacketFiles.packetId, packetId)).orderBy(asc(festivalPacketFiles.order));
  }

  // Export Template operations
  async getExportTemplates(): Promise<ExportTemplate[]> {
    return await db.select().from(exportTemplates).where(eq(exportTemplates.isPublic, true)).orderBy(asc(exportTemplates.name));
  }

  async createExportTemplate(template: InsertExportTemplate): Promise<ExportTemplate> {
    const [newTemplate] = await db.insert(exportTemplates).values(template).returning();
    return newTemplate;
  }

  async getExportTemplate(id: string): Promise<ExportTemplate | undefined> {
    const [template] = await db.select().from(exportTemplates).where(eq(exportTemplates.id, id));
    return template;
  }

  async updateExportTemplate(id: string, updates: Partial<InsertExportTemplate>): Promise<ExportTemplate | undefined> {
    const [template] = await db
      .update(exportTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(exportTemplates.id, id))
      .returning();
    return template;
  }

  async deleteExportTemplate(id: string): Promise<void> {
    await db.delete(exportTemplates).where(eq(exportTemplates.id, id));
  }

  // Admin Functions Implementation
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getSystemStats(): Promise<any> {
    const totalUsers = await db.select({ count: count() }).from(users);
    const verifiedVeterans = await db.select({ count: count() }).from(users)
      .where(eq(users.isVerified, true));
    const totalScripts = await db.select({ count: count() }).from(scripts);
    const totalProjects = await db.select({ count: count() }).from(projects);
    const creditsAwarded = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` }).from(creditTransactions);
    
    return {
      totalUsers: totalUsers[0]?.count || 0,
      verifiedVeterans: verifiedVeterans[0]?.count || 0,
      totalScripts: totalScripts[0]?.count || 0,
      totalProjects: totalProjects[0]?.count || 0,
      creditsAwarded: creditsAwarded[0]?.total || 0,
    };
  }

  async awardCredits(userId: string, amount: number, reason: string, adminUserId: string): Promise<void> {
    // First add credits to user balance
    await this.addCredits(userId, amount, reason, 'admin_award', reason);
    
    // Create credit transaction record
    await db.insert(creditTransactions).values({
      userId,
      amount,
      type: 'admin_award',
      description: reason,
      awardedBy: adminUserId,
    });
  }

  async verifyMilitaryService(userId: string, verification: any): Promise<void> {
    await db.update(users)
      .set({ 
        relationshipType: verification.serviceType, // Maps to relationship_type enum
        militaryBranch: verification.branch, // Maps to military_branch enum
        yearsOfService: verification.yearsServed, // Maps to years_of_service varchar
        isVerified: verification.verified, // Boolean verification flag
        role: verification.verified ? 'verified' : 'pending',
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updateMilitaryService(userId: string, serviceData: any): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ 
        relationshipType: serviceData.serviceType, // Maps to relationship_type enum
        militaryBranch: serviceData.branch, // Maps to military_branch enum
        yearsOfService: serviceData.yearsServed, // Maps to years_of_service varchar
        isVerified: true, // Mark as verified
        role: 'verified', // Update role
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  async processMonthlyVeteranCredits(adminUserId: string): Promise<any> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const currentYear = new Date().getFullYear();

    // Check if already processed this month
    const [existingRecord] = await db.select().from(monthlyVeteranCredits)
      .where(and(
        eq(monthlyVeteranCredits.month, currentMonth),
        eq(monthlyVeteranCredits.year, currentYear)
      ));

    if (existingRecord) {
      throw new Error('Monthly veteran credits have already been processed for this month');
    }

    // Get all verified veterans and military members
    const veterans = await db.select().from(users)
      .where(and(
        eq(users.isVerified, true),
        eq(users.role, 'verified'),
        or(
          eq(users.relationshipType, 'veteran'),
          eq(users.relationshipType, 'active_duty')
        )
      ));

    let veteransProcessed = 0;
    let creditsAwarded = 0;

    // Award 150 credits to each veteran
    for (const veteran of veterans) {
      await this.addCredits(
        veteran.id, 
        150, 
        'Monthly Veteran Appreciation Credits', 
        'monthly_veteran_gift', 
        'automatic_monthly_award'
      );
      
      await db.insert(creditTransactions).values({
        userId: veteran.id,
        amount: 150,
        type: 'monthly_veteran_gift',
        description: 'Monthly Veteran Appreciation Credits',
        awardedBy: adminUserId,
      });

      veteransProcessed++;
      creditsAwarded += 150;
    }

    // Record the monthly processing
    await db.insert(monthlyVeteranCredits).values({
      month: currentMonth,
      year: currentYear,
      veteransProcessed,
      creditsAwarded,
      processedBy: adminUserId,
      notes: `Automatically processed ${veteransProcessed} veterans for ${creditsAwarded} total credits`,
    });

    return {
      veteransAwarded: veteransProcessed,
      totalCredits: creditsAwarded,
      month: currentMonth,
    };
  }

  async getCreditTransactions(): Promise<any[]> {
    return await db.select({
      id: creditTransactions.id,
      amount: creditTransactions.amount,
      type: creditTransactions.type,
      description: creditTransactions.description,
      createdAt: creditTransactions.createdAt,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      },
    })
    .from(creditTransactions)
    .leftJoin(users, eq(creditTransactions.userId, users.id))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(100);
  }

  async getVerificationRequests(): Promise<any[]> {
    // This would return users who have submitted verification but aren't verified yet
    return await db.select({
      id: users.id,
      userId: users.id,
      serviceType: users.relationshipType,
      branch: users.militaryBranch,
      yearsServed: users.yearsOfService,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      },
    })
    .from(users)
    .where(and(
      eq(users.role, 'pending'),
      eq(users.isVerified, false)
    ))
    .orderBy(desc(users.updatedAt));
  }

  async updateUserProfile(userId: string, profileData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    location?: string;
    bio?: string;
    specialties?: string;
  }): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        ...profileData,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateUserProfilePicture(userId: string, profileImageUrl: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        profileImageUrl,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // GIFT CODE OPERATIONS
  
  async createGiftCode(giftCode: InsertGiftCode): Promise<GiftCode> {
    const [newGiftCode] = await db.insert(giftCodes).values(giftCode).returning();
    return newGiftCode;
  }

  async getGiftCode(code: string): Promise<GiftCode | undefined> {
    const [giftCode] = await db.select().from(giftCodes).where(eq(giftCodes.code, code));
    return giftCode;
  }

  async getGiftCodes(createdById?: string): Promise<(GiftCode & { createdBy: User; redemptions: GiftCodeRedemption[] })[]> {
    const query = db
      .select({
        giftCode: giftCodes,
        createdBy: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        }
      })
      .from(giftCodes)
      .leftJoin(users, eq(giftCodes.createdById, users.id))
      .orderBy(desc(giftCodes.createdAt));

    if (createdById) {
      query.where(eq(giftCodes.createdById, createdById));
    }

    const results = await query;
    
    // Get redemptions for each gift code
    const giftCodesWithRedemptions = await Promise.all(
      results.map(async (result) => {
        const redemptions = await db
          .select()
          .from(giftCodeRedemptions)
          .where(eq(giftCodeRedemptions.giftCodeId, result.giftCode.id));
        
        return {
          ...result.giftCode,
          createdBy: result.createdBy as User,
          redemptions,
        };
      })
    );

    return giftCodesWithRedemptions;
  }

  async redeemGiftCode(code: string, userId: string): Promise<{ success: boolean; message: string; creditsReceived?: number }> {
    try {
      // First, check if the gift code exists and is valid
      const giftCode = await this.getGiftCode(code);
      
      if (!giftCode) {
        return { success: false, message: "Gift code not found." };
      }

      if (!giftCode.isActive) {
        return { success: false, message: "This gift code is no longer active." };
      }

      if (giftCode.expiresAt && new Date() > giftCode.expiresAt) {
        return { success: false, message: "This gift code has expired." };
      }

      if (giftCode.usedCount >= giftCode.maxUses) {
        return { success: false, message: "This gift code has reached its usage limit." };
      }

      // Check if this user has already redeemed this code
      const [existingRedemption] = await db
        .select()
        .from(giftCodeRedemptions)
        .where(and(
          eq(giftCodeRedemptions.giftCodeId, giftCode.id),
          eq(giftCodeRedemptions.userId, userId)
        ));

      if (existingRedemption) {
        return { success: false, message: "You have already redeemed this gift code." };
      }

      // All checks passed, redeem the code
      await db.transaction(async (tx) => {
        // Record the redemption
        await tx.insert(giftCodeRedemptions).values({
          giftCodeId: giftCode.id,
          userId: userId,
          creditsReceived: giftCode.credits,
        });

        // Update the gift code usage count
        await tx
          .update(giftCodes)
          .set({ 
            usedCount: giftCode.usedCount + 1,
            updatedAt: new Date()
          })
          .where(eq(giftCodes.id, giftCode.id));

        // Add credits to the user
        await tx
          .update(users)
          .set({ 
            credits: sql`${users.credits} + ${giftCode.credits}`,
            updatedAt: new Date()
          })
          .where(eq(users.id, userId));

        // Record the credit transaction
        await tx.insert(creditTransactions).values({
          userId: userId,
          amount: giftCode.credits,
          type: 'bonus',
          description: `Gift code redeemed: ${code} - ${giftCode.description || 'Gift code bonus'}`,
        });
      });

      return { 
        success: true, 
        message: `Successfully redeemed ${giftCode.credits} credits!`, 
        creditsReceived: giftCode.credits 
      };

    } catch (error) {
      console.error('Error redeeming gift code:', error);
      return { success: false, message: "An error occurred while redeeming the gift code." };
    }
  }

  async updateGiftCode(id: string, updates: Partial<InsertGiftCode>): Promise<GiftCode | undefined> {
    const [updatedGiftCode] = await db
      .update(giftCodes)
      .set({ 
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(giftCodes.id, id))
      .returning();
    
    return updatedGiftCode;
  }

  async deactivateGiftCode(id: string): Promise<GiftCode | undefined> {
    const [deactivatedGiftCode] = await db
      .update(giftCodes)
      .set({ 
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(giftCodes.id, id))
      .returning();
    
    return deactivatedGiftCode;
  }

  // REFERRAL SYSTEM METHODS

  // Generate a unique referral code for a user
  async createReferralCode(userId: string, customCode?: string): Promise<ReferralCode> {
    let code = customCode;
    
    // Generate a unique code if none provided
    if (!code) {
      const user = await this.getUser(userId);
      const firstName = user?.firstName || 'BRAVO';
      const randomSuffix = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      code = `${firstName.toUpperCase()}${randomSuffix}`;
    }
    
    // Check if code already exists
    const existing = await this.getReferralCodeByCode(code);
    if (existing) {
      throw new Error('Referral code already exists');
    }

    const [newReferralCode] = await db
      .insert(referralCodes)
      .values({
        userId,
        code,
        referrerReward: 50, // 50 credits for referrer
        referredReward: 25, // 25 credits for new user
        minimumSpend: 999, // $9.99 minimum spend to trigger rewards
      })
      .returning();

    return newReferralCode;
  }

  // Get user's referral codes
  async getUserReferralCodes(userId: string): Promise<ReferralCode[]> {
    return await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userId, userId))
      .orderBy(desc(referralCodes.createdAt));
  }

  // Get referral code by code string
  async getReferralCodeByCode(code: string): Promise<ReferralCode | undefined> {
    const [referralCode] = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.code, code.toUpperCase()));
    
    return referralCode;
  }

  // Process a referral when someone signs up with a code
  async processReferral(referralCode: string, newUserId: string, newUserEmail: string): Promise<Referral> {
    const code = await this.getReferralCodeByCode(referralCode);
    if (!code) {
      throw new Error('Invalid referral code');
    }

    if (!code.isActive) {
      throw new Error('Referral code is no longer active');
    }

    if (code.currentUses >= code.maxUses) {
      throw new Error('Referral code has reached maximum usage');
    }

    if (code.expiresAt && new Date() > code.expiresAt) {
      throw new Error('Referral code has expired');
    }

    // Create referral tracking record
    const [newReferral] = await db
      .insert(referrals)
      .values({
        referralCodeId: code.id,
        referrerId: code.userId,
        referredUserId: newUserId,
        referredUserEmail: newUserEmail,
        status: 'pending',
      })
      .returning();

    // Update referral code usage count
    await db
      .update(referralCodes)
      .set({ 
        currentUses: code.currentUses + 1,
        updatedAt: new Date()
      })
      .where(eq(referralCodes.id, code.id));

    // If no minimum spend required, immediately qualify the referral
    if (code.minimumSpend === 0) {
      await this.qualifyReferral(newReferral.id);
    }

    return newReferral;
  }

  // Check if a user can qualify referrals (when they make a purchase)
  async checkReferralQualification(userId: string, purchaseAmount: number): Promise<void> {
    // Find pending referrals for this user
    const pendingReferrals = await db
      .select({
        referral: referrals,
        code: referralCodes
      })
      .from(referrals)
      .innerJoin(referralCodes, eq(referrals.referralCodeId, referralCodes.id))
      .where(
        and(
          eq(referrals.referredUserId, userId),
          eq(referrals.status, 'pending'),
          eq(referrals.qualificationMet, false)
        )
      );

    for (const { referral, code } of pendingReferrals) {
      // Update qualification amount
      const newAmount = referral.qualificationAmount + purchaseAmount;
      
      await db
        .update(referrals)
        .set({ 
          qualificationAmount: newAmount,
          updatedAt: new Date()
        })
        .where(eq(referrals.id, referral.id));

      // Check if user has met minimum spend requirement
      if (newAmount >= code.minimumSpend) {
        await this.qualifyReferral(referral.id);
      }
    }
  }

  // Qualify a referral and award credits
  async qualifyReferral(referralId: string): Promise<void> {
    const [referralData] = await db
      .select({
        referral: referrals,
        code: referralCodes
      })
      .from(referrals)
      .innerJoin(referralCodes, eq(referrals.referralCodeId, referralCodes.id))
      .where(eq(referrals.id, referralId));

    if (!referralData || referralData.referral.status !== 'pending') {
      return;
    }

    const { referral, code } = referralData;

    // Mark referral as qualified
    await db
      .update(referrals)
      .set({
        status: 'qualified',
        qualificationMet: true,
        qualificationDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(referrals.id, referralId));

    // Award credits to referrer
    await this.addCredits(
      referral.referrerId, 
      code.referrerReward, 
      'referral_bonus',
      `Referral bonus for inviting ${referral.referredUserEmail}`,
      'referral',
      referralId
    );

    // Award credits to referred user
    await this.addCredits(
      referral.referredUserId, 
      code.referredReward, 
      'referral_bonus',
      `Welcome bonus for joining via referral code ${code.code}`,
      'referral',
      referralId
    );

    // Mark referral as credited
    await db
      .update(referrals)
      .set({
        status: 'credited',
        referrerCreditsAwarded: code.referrerReward,
        referredCreditsAwarded: code.referredReward,
        creditedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(referrals.id, referralId));

    // Create notifications
    await this.createNotification({
      userId: referral.referrerId,
      type: 'credit_awarded',
      title: 'Referral Bonus Awarded!',
      message: `You earned ${code.referrerReward} credits for referring ${referral.referredUserEmail}`,
      actionUrl: '/dashboard/referrals'
    });

    await this.createNotification({
      userId: referral.referredUserId,
      type: 'credit_awarded',
      title: 'Welcome Bonus!',
      message: `You received ${code.referredReward} bonus credits for joining Bravo Zulu Films`,
      actionUrl: '/dashboard'
    });
  }

  // Get user's referral stats
  async getUserReferralStats(userId: string): Promise<{
    totalReferrals: number;
    qualifiedReferrals: number;
    totalCreditsEarned: number;
    pendingReferrals: number;
  }> {
    const stats = await db
      .select({
        totalReferrals: count(),
        qualifiedReferrals: sql<number>`sum(case when ${referrals.status} in ('qualified', 'credited') then 1 else 0 end)`,
        totalCreditsEarned: sql<number>`sum(${referrals.referrerCreditsAwarded})`,
        pendingReferrals: sql<number>`sum(case when ${referrals.status} = 'pending' then 1 else 0 end)`,
      })
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .groupBy(referrals.referrerId);

    return stats[0] || {
      totalReferrals: 0,
      qualifiedReferrals: 0,
      totalCreditsEarned: 0,
      pendingReferrals: 0
    };
  }

  // Get user's referral history
  async getUserReferrals(userId: string, limit = 50): Promise<Referral[]> {
    return await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt))
      .limit(limit);
  }

  // Deactivate a referral code
  async deactivateReferralCode(id: string): Promise<ReferralCode | undefined> {
    const [deactivatedCode] = await db
      .update(referralCodes)
      .set({ 
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(referralCodes.id, id))
      .returning();
    
    return deactivatedCode;
  }
}

export const storage = new DatabaseStorage();

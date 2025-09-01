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
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: 'public' | 'pending' | 'verified'): Promise<User | undefined>;
  updateUserVerification(id: string, isVerified: boolean, militaryBranch?: string, yearsOfService?: string): Promise<User | undefined>;
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

  async updateUserVerification(id: string, isVerified: boolean, militaryBranch?: string, yearsOfService?: string): Promise<User | undefined> {
    const updateData: any = { isVerified, updatedAt: new Date() };
    if (militaryBranch) updateData.militaryBranch = militaryBranch;
    if (yearsOfService) updateData.yearsOfService = yearsOfService;
    
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
      .where(eq(users.isVerified, true))
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
}

export const storage = new DatabaseStorage();

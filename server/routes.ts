import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { insertScriptSchema, insertProjectSchema, insertForumPostSchema, insertForumReplySchema, insertMessageSchema, insertReportSchema, insertFestivalSubmissionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.put('/api/users/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;
      
      if (!['public', 'pending', 'verified'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await storage.updateUserRole(userId, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.put('/api/users/verification', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { contactEmail, relationshipType, militaryBranch, yearsOfService, bio, specialties } = req.body;

      // In a real app, this would trigger a verification process
      // For now, we'll just update the user with pending status
      await storage.updateUserRole(userId, 'pending');
      const user = await storage.updateUserVerification(userId, {
        contactEmail,
        relationshipType,
        militaryBranch,
        yearsOfService,
        bio,
        specialties
      });
      
      res.json(user);
    } catch (error) {
      console.error("Error updating verification:", error);
      res.status(500).json({ message: "Failed to update verification" });
    }
  });

  app.get('/api/users/members', isAuthenticated, async (req: any, res) => {
    try {
      const members = await storage.getVerifiedMembers(50);
      res.json(members);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  // Friend routes
  app.post('/api/friends/request', isAuthenticated, async (req: any, res) => {
    try {
      const fromUserId = req.user.claims.sub;
      const { toUserId } = req.body;

      if (fromUserId === toUserId) {
        return res.status(400).json({ message: "Cannot send friend request to yourself" });
      }

      const request = await storage.sendFriendRequest(fromUserId, toUserId);
      res.json(request);
    } catch (error) {
      console.error("Error sending friend request:", error);
      res.status(500).json({ message: "Failed to send friend request" });
    }
  });

  app.get('/api/friends/requests/:type', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type } = req.params;

      if (!['sent', 'received'].includes(type)) {
        return res.status(400).json({ message: "Invalid request type" });
      }

      const requests = await storage.getFriendRequests(userId, type);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      res.status(500).json({ message: "Failed to fetch friend requests" });
    }
  });

  app.put('/api/friends/requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const request = await storage.updateFriendRequest(id, status);
      res.json(request);
    } catch (error) {
      console.error("Error updating friend request:", error);
      res.status(500).json({ message: "Failed to update friend request" });
    }
  });

  app.get('/api/friends', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const friends = await storage.getFriends(userId);
      res.json(friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  // Script routes (protected)
  app.post('/api/scripts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'verified') {
        return res.status(403).json({ message: "Verified membership required" });
      }

      const scriptData = insertScriptSchema.parse({ ...req.body, authorId: userId });
      const script = await storage.createScript(scriptData);
      res.json(script);
    } catch (error) {
      console.error("Error creating script:", error);
      res.status(500).json({ message: "Failed to create script" });
    }
  });

  app.get('/api/scripts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'verified') {
        return res.status(403).json({ message: "Verified membership required" });
      }

      const scripts = await storage.getUserScripts(userId);
      res.json(scripts);
    } catch (error) {
      console.error("Error fetching scripts:", error);
      res.status(500).json({ message: "Failed to fetch scripts" });
    }
  });

  app.get('/api/scripts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'verified') {
        return res.status(403).json({ message: "Verified membership required" });
      }

      const script = await storage.getScript(req.params.id);
      
      if (!script) {
        return res.status(404).json({ message: "Script not found" });
      }

      // Only allow access to own scripts or public scripts
      if (script.authorId !== userId && !script.isPublic) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(script);
    } catch (error) {
      console.error("Error fetching script:", error);
      res.status(500).json({ message: "Failed to fetch script" });
    }
  });

  app.put('/api/scripts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'verified') {
        return res.status(403).json({ message: "Verified membership required" });
      }

      const script = await storage.getScript(req.params.id);
      
      if (!script || script.authorId !== userId) {
        return res.status(404).json({ message: "Script not found" });
      }

      const updates = insertScriptSchema.partial().parse(req.body);
      const updatedScript = await storage.updateScript(req.params.id, updates);
      res.json(updatedScript);
    } catch (error) {
      console.error("Error updating script:", error);
      res.status(500).json({ message: "Failed to update script" });
    }
  });

  app.delete('/api/scripts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'verified') {
        return res.status(403).json({ message: "Verified membership required" });
      }

      const script = await storage.getScript(req.params.id);
      
      if (!script || script.authorId !== userId) {
        return res.status(404).json({ message: "Script not found" });
      }

      await storage.deleteScript(req.params.id);
      res.json({ message: "Script deleted successfully" });
    } catch (error) {
      console.error("Error deleting script:", error);
      res.status(500).json({ message: "Failed to delete script" });
    }
  });

  // Project routes
  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'verified') {
        return res.status(403).json({ message: "Verified membership required" });
      }

      const projectData = insertProjectSchema.parse({ ...req.body, creatorId: userId });
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'verified') {
        return res.status(403).json({ message: "Verified membership required" });
      }

      const projects = await storage.getPublicProjects(20);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'verified') {
        return res.status(403).json({ message: "Verified membership required" });
      }

      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching user projects:", error);
      res.status(500).json({ message: "Failed to fetch user projects" });
    }
  });

  app.post('/api/projects/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'verified') {
        return res.status(403).json({ message: "Verified membership required" });
      }

      const { role } = req.body;
      const collaborator = await storage.joinProject(req.params.id, userId, role);
      res.json(collaborator);
    } catch (error) {
      console.error("Error joining project:", error);
      res.status(500).json({ message: "Failed to join project" });
    }
  });

  // Forum routes
  app.get('/api/forum/categories', isAuthenticated, async (req: any, res) => {
    try {
      const categories = await storage.getForumCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching forum categories:", error);
      res.status(500).json({ message: "Failed to fetch forum categories" });
    }
  });

  app.post('/api/forum/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'verified') {
        return res.status(403).json({ message: "Verified membership required" });
      }

      const postData = insertForumPostSchema.parse({ ...req.body, authorId: userId });
      const post = await storage.createForumPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating forum post:", error);
      res.status(500).json({ message: "Failed to create forum post" });
    }
  });

  app.get('/api/forum/posts', isAuthenticated, async (req: any, res) => {
    try {
      const { categoryId } = req.query;
      const posts = await storage.getForumPosts(categoryId as string);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching forum posts:", error);
      res.status(500).json({ message: "Failed to fetch forum posts" });
    }
  });

  app.get('/api/forum/posts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const post = await storage.getForumPost(req.params.id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.json(post);
    } catch (error) {
      console.error("Error fetching forum post:", error);
      res.status(500).json({ message: "Failed to fetch forum post" });
    }
  });

  app.post('/api/forum/replies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'verified') {
        return res.status(403).json({ message: "Verified membership required" });
      }

      const replyData = insertForumReplySchema.parse({ ...req.body, authorId: userId });
      const reply = await storage.createForumReply(replyData);
      res.json(reply);
    } catch (error) {
      console.error("Error creating forum reply:", error);
      res.status(500).json({ message: "Failed to create forum reply" });
    }
  });

  // Messaging routes
  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const user = await storage.getUser(senderId);
      
      if (!user || user.role !== 'verified') {
        return res.status(403).json({ message: "Verified membership required" });
      }

      const messageData = insertMessageSchema.parse({ ...req.body, senderId });
      const message = await storage.sendMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get('/api/messages/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'verified') {
        return res.status(403).json({ message: "Verified membership required" });
      }

      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/messages/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const user = await storage.getUser(currentUserId);
      
      if (!user || user.role !== 'verified') {
        return res.status(403).json({ message: "Verified membership required" });
      }

      const { userId } = req.params;
      const conversation = await storage.getConversation(currentUserId, userId);
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // Reporting routes
  app.post('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const reporterId = req.user.claims.sub;
      const reportData = insertReportSchema.parse({ ...req.body, reporterId });
      const report = await storage.createReport(reportData);
      res.json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // Festival submission routes
  app.post('/api/festival-submissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submissionData = insertFestivalSubmissionSchema.parse({
        ...req.body,
        submitterId: userId,
      });

      const submission = await storage.createFestivalSubmission(submissionData);
      res.json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      }
      console.error("Error creating festival submission:", error);
      res.status(500).json({ message: "Failed to create festival submission" });
    }
  });

  app.get('/api/festival-submissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submissions = await storage.getUserFestivalSubmissions(userId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching festival submissions:", error);
      res.status(500).json({ message: "Failed to fetch festival submissions" });
    }
  });

  app.get('/api/festival-submissions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const submission = await storage.getFestivalSubmission(id);
      
      if (!submission) {
        return res.status(404).json({ message: "Festival submission not found" });
      }

      // Check if user owns this submission
      const userId = req.user.claims.sub;
      if (submission.submitterId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(submission);
    } catch (error) {
      console.error("Error fetching festival submission:", error);
      res.status(500).json({ message: "Failed to fetch festival submission" });
    }
  });

  app.put('/api/festival-submissions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

      // Check if user owns this submission
      const existingSubmission = await storage.getFestivalSubmission(id);
      if (!existingSubmission || existingSubmission.submitterId !== userId) {
        return res.status(404).json({ message: "Festival submission not found" });
      }

      const updateData = insertFestivalSubmissionSchema.partial().parse(req.body);
      const submission = await storage.updateFestivalSubmission(id, updateData);
      res.json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      }
      console.error("Error updating festival submission:", error);
      res.status(500).json({ message: "Failed to update festival submission" });
    }
  });

  app.delete('/api/festival-submissions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

      // Check if user owns this submission
      const existingSubmission = await storage.getFestivalSubmission(id);
      if (!existingSubmission || existingSubmission.submitterId !== userId) {
        return res.status(404).json({ message: "Festival submission not found" });
      }

      await storage.deleteFestivalSubmission(id);
      res.json({ message: "Festival submission deleted successfully" });
    } catch (error) {
      console.error("Error deleting festival submission:", error);
      res.status(500).json({ message: "Failed to delete festival submission" });
    }
  });

  // Rate limiting middleware for spam prevention
  const rateLimit = new Map();
  
  app.use('/api', (req: any, res, next) => {
    const userId = req.user?.claims?.sub;
    if (!userId) return next();

    const key = `${userId}:${req.path}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 30; // 30 requests per minute

    if (!rateLimit.has(key)) {
      rateLimit.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const limitData = rateLimit.get(key);
    
    if (now > limitData.resetTime) {
      limitData.count = 1;
      limitData.resetTime = now + windowMs;
      return next();
    }

    if (limitData.count >= maxRequests) {
      return res.status(429).json({ message: "Too many requests. Please try again later." });
    }

    limitData.count++;
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { insertScriptSchema, insertProjectSchema, insertForumPostSchema, insertForumReplySchema, insertMessageSchema, insertReportSchema, insertFestivalSubmissionSchema, insertDesignAssetSchema } from "@shared/schema";
import OpenAI from "openai";
import Stripe from "stripe";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Super user emails - get unlimited access to all premium features
const SUPER_USER_EMAILS = [
  'bravozulufilms@gmail.com',
  'usmc2532@gmail.com'
];

// Helper function to check if user is a super user
function isSuperUser(email: string): boolean {
  return SUPER_USER_EMAILS.includes(email.toLowerCase());
}

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
      const { search, limit } = req.query;
      let members;
      
      if (search && typeof search === 'string') {
        members = await storage.searchMembers(search, limit ? parseInt(limit as string) : 20);
      } else {
        members = await storage.getMembers(limit ? parseInt(limit as string) : 50);
      }
      
      res.json(members);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  // Individual member profile with projects and scripts
  app.get('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const member = await storage.getUser(req.params.id);
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      res.json(member);
    } catch (error) {
      console.error("Error fetching member:", error);
      res.status(500).json({ message: "Failed to fetch member" });
    }
  });

  // Member's public projects
  app.get('/api/users/:id/projects', isAuthenticated, async (req: any, res) => {
    try {
      const projects = await storage.getUserProjects(req.params.id);
      // Only return public projects unless it's the user's own profile
      const userId = req.user.claims.sub;
      const filteredProjects = projects.filter(p => p.isPublic || p.creatorId === userId);
      res.json(filteredProjects);
    } catch (error) {
      console.error("Error fetching member projects:", error);
      res.status(500).json({ message: "Failed to fetch member projects" });
    }
  });

  // Member's public scripts
  app.get('/api/users/:id/scripts', isAuthenticated, async (req: any, res) => {
    try {
      const scripts = await storage.getUserScripts(req.params.id);
      // Only return public scripts unless it's the user's own profile
      const userId = req.user.claims.sub;
      const filteredScripts = scripts.filter(s => s.isPublic || s.authorId === userId);
      res.json(filteredScripts);
    } catch (error) {
      console.error("Error fetching member scripts:", error);
      res.status(500).json({ message: "Failed to fetch member scripts" });
    }
  });

  // Friendship status check
  app.get('/api/friends/status/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const status = await storage.getFriendshipStatus(userId, req.params.id);
      res.json(status);
    } catch (error) {
      console.error("Error checking friendship status:", error);
      res.status(500).json({ message: "Failed to check friendship status" });
    }
  });

  // Activity feed
  app.get('/api/activities', isAuthenticated, async (req: any, res) => {
    try {
      const { limit } = req.query;
      const activities = await storage.getRecentActivities(limit ? parseInt(limit as string) : 20);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
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
      
      // Log activity
      await storage.createActivity({
        userId,
        type: 'script_created',
        title: script.title,
        description: script.logline || 'A new script has been created',
        link: `/tools?script=${script.id}`,
      });
      
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
      
      // Log activity
      await storage.createActivity({
        userId,
        type: 'project_created',
        title: project.title,
        description: project.description || 'A new project has been started',
        link: `/tools?project=${project.id}`,
      });
      
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

  // Design asset routes
  app.post('/api/design-assets/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { prompt, title, assetType, category, projectId, tags = [] } = req.body;

      if (!prompt || !title || !assetType) {
        return res.status(400).json({ message: "Prompt, title, and asset type are required" });
      }

      // Generate image using OpenAI DALL-E
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      const imageUrl = response.data[0].url!;

      // Create design asset record
      const asset = await storage.createDesignAsset({
        creatorId: userId,
        projectId: projectId || null,
        title,
        description: prompt,
        assetType,
        category: category || null,
        imageUrl,
        prompt,
        dimensions: "1024x1024",
        tags,
        isPublic: false,
      });

      res.json(asset);
    } catch (error) {
      console.error("Error generating design asset:", error);
      res.status(500).json({ message: "Failed to generate design asset" });
    }
  });

  app.get('/api/design-assets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assets = await storage.getUserDesignAssets(userId);
      res.json(assets);
    } catch (error) {
      console.error("Error fetching design assets:", error);
      res.status(500).json({ message: "Failed to fetch design assets" });
    }
  });

  app.get('/api/design-assets/public', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const assets = await storage.getPublicDesignAssets(limit);
      res.json(assets);
    } catch (error) {
      console.error("Error fetching public design assets:", error);
      res.status(500).json({ message: "Failed to fetch public design assets" });
    }
  });

  app.get('/api/design-assets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const asset = await storage.getDesignAsset(id);
      
      if (!asset) {
        return res.status(404).json({ message: "Design asset not found" });
      }

      res.json(asset);
    } catch (error) {
      console.error("Error fetching design asset:", error);
      res.status(500).json({ message: "Failed to fetch design asset" });
    }
  });

  app.put('/api/design-assets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

      // Check if user owns this asset
      const existingAsset = await storage.getDesignAsset(id);
      if (!existingAsset || existingAsset.creatorId !== userId) {
        return res.status(404).json({ message: "Design asset not found" });
      }

      const updateData = insertDesignAssetSchema.partial().parse(req.body);
      const asset = await storage.updateDesignAsset(id, updateData);
      res.json(asset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid asset data", errors: error.errors });
      }
      console.error("Error updating design asset:", error);
      res.status(500).json({ message: "Failed to update design asset" });
    }
  });

  app.delete('/api/design-assets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

      // Check if user owns this asset
      const existingAsset = await storage.getDesignAsset(id);
      if (!existingAsset || existingAsset.creatorId !== userId) {
        return res.status(404).json({ message: "Design asset not found" });
      }

      await storage.deleteDesignAsset(id);
      res.json({ message: "Design asset deleted successfully" });
    } catch (error) {
      console.error("Error deleting design asset:", error);
      res.status(500).json({ message: "Failed to delete design asset" });
    }
  });

  app.post('/api/design-assets/:id/download', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.incrementDownloadCount(id);
      res.json({ message: "Download recorded successfully" });
    } catch (error) {
      console.error("Error recording download:", error);
      res.status(500).json({ message: "Failed to record download" });
    }
  });

  // AI-powered features with credit requirements
  app.post('/api/ai/generate-script', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { prompt, genre, tone, length } = req.body;
      
      let userCredits = 0;
      const requiredCredits = 10;
      
      // Super users bypass credit checks
      if (user?.email && isSuperUser(user.email)) {
        userCredits = 999999; // Unlimited for super users
      } else {
        // Check if user has enough credits (10 credits for script generation)
        userCredits = await storage.getUserCredits(userId);
        
        if (userCredits < requiredCredits) {
          return res.status(402).json({ 
            message: "Insufficient credits", 
            required: requiredCredits, 
            available: userCredits 
          });
        }

        // Use credits (only for non-super users)
        const success = await storage.useCredits(userId, requiredCredits, 'AI Script Generation', 'ai_generation', 'script');
        if (!success) {
          return res.status(402).json({ message: "Unable to deduct credits" });
        }
      }

      // Generate script with OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a professional screenplay writer for military and action films. Generate a compelling script based on the user's requirements. Format it properly with scene headings, action lines, and dialogue. Keep it authentic to military culture and respectful to service members.`
          },
          {
            role: "user",
            content: `Generate a ${length || 'short'} script with the following requirements:
            Genre: ${genre || 'action'}
            Tone: ${tone || 'dramatic'}
            Prompt: ${prompt}
            
            Please format it as a proper screenplay with:
            - Scene headings (INT./EXT. LOCATION - TIME)
            - Character names in caps
            - Action lines
            - Dialogue
            - Proper formatting
            
            Keep it military-themed and authentic.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      const generatedScript = response.choices[0].message.content;

      // Create notification for AI task completion
      const notification = await storage.createNotification({
        userId,
        type: 'ai_task_complete',
        title: '🎬 Script Generation Complete',
        message: `Your AI-generated script is ready! Generated with ${genre || 'action'} genre and ${tone || 'dramatic'} tone.`,
        actionUrl: `/ai-tools`,
        relatedEntityType: 'ai_generation',
        relatedEntityId: 'script_generation',
        metadata: { 
          taskType: 'script_generation',
          genre: genre || 'action',
          tone: tone || 'dramatic',
          length: length || 'short',
          creditsUsed: requiredCredits
        },
        isRead: false
      });

      // Send real-time notification
      if (global.sendRealtimeNotification) {
        global.sendRealtimeNotification(userId, notification);
      }

      res.json({
        script: generatedScript,
        creditsUsed: requiredCredits,
        remainingCredits: userCredits - requiredCredits
      });
    } catch (error: any) {
      console.error("Error generating script:", error);
      res.status(500).json({ message: "Failed to generate script: " + error.message });
    }
  });

  app.post('/api/ai/enhance-script', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { scriptContent, enhancement } = req.body;
      
      let userCredits = 0;
      const requiredCredits = 5;
      
      // Super users bypass credit checks
      if (user?.email && isSuperUser(user.email)) {
        userCredits = 999999; // Unlimited for super users
      } else {
        // Check if user has enough credits (5 credits for script enhancement)
        userCredits = await storage.getUserCredits(userId);
        
        if (userCredits < requiredCredits) {
          return res.status(402).json({ 
            message: "Insufficient credits", 
            required: requiredCredits, 
            available: userCredits 
          });
        }

        // Use credits (only for non-super users)
        const success = await storage.useCredits(userId, requiredCredits, 'AI Script Enhancement', 'ai_generation', 'script_enhancement');
        if (!success) {
          return res.status(402).json({ message: "Unable to deduct credits" });
        }
      }

      // Enhance script with OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a professional script doctor specializing in military and action films. Enhance the provided script based on the user's requirements while maintaining military authenticity and respect for service members.`
          },
          {
            role: "user",
            content: `Please enhance this script with the following focus: ${enhancement}

            Original Script:
            ${scriptContent}
            
            Provide an improved version that maintains the original structure but enhances:
            - Character development
            - Dialogue quality
            - Action sequences
            - Military authenticity
            - Emotional impact
            
            Keep the military theme authentic and respectful.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      const enhancedScript = response.choices[0].message.content;

      // Create notification for AI task completion
      const notification = await storage.createNotification({
        userId,
        type: 'ai_task_complete',
        title: '⚡ Script Enhancement Complete',
        message: `Your script has been enhanced successfully with AI improvements!`,
        actionUrl: `/ai-tools`,
        relatedEntityType: 'ai_generation',
        relatedEntityId: 'script_enhancement',
        metadata: { 
          taskType: 'script_enhancement',
          enhancement: enhancement,
          creditsUsed: requiredCredits
        },
        isRead: false
      });

      // Send real-time notification
      if (global.sendRealtimeNotification) {
        global.sendRealtimeNotification(userId, notification);
      }

      res.json({
        enhancedScript,
        creditsUsed: requiredCredits,
        remainingCredits: userCredits - requiredCredits
      });
    } catch (error: any) {
      console.error("Error enhancing script:", error);
      res.status(500).json({ message: "Failed to enhance script: " + error.message });
    }
  });

  app.post('/api/ai/analyze-script', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { scriptContent } = req.body;
      
      let userCredits = 0;
      const requiredCredits = 3;
      
      // Super users bypass credit checks
      if (user?.email && isSuperUser(user.email)) {
        userCredits = 999999; // Unlimited for super users
      } else {
        // Check if user has enough credits (3 credits for script analysis)
        userCredits = await storage.getUserCredits(userId);
        
        if (userCredits < requiredCredits) {
          return res.status(402).json({ 
            message: "Insufficient credits", 
            required: requiredCredits, 
            available: userCredits 
          });
        }

        // Use credits (only for non-super users)
        const success = await storage.useCredits(userId, requiredCredits, 'AI Script Analysis', 'ai_generation', 'script_analysis');
        if (!success) {
          return res.status(402).json({ message: "Unable to deduct credits" });
        }
      }

      // Analyze script with OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a professional script analyst with expertise in military and action films. Provide detailed feedback on the script's strengths, weaknesses, and suggestions for improvement. Focus on military authenticity, character development, pacing, and commercial viability.`
          },
          {
            role: "user",
            content: `Please analyze this script and provide detailed feedback:

            ${scriptContent}
            
            Please provide analysis on:
            1. Overall structure and pacing
            2. Character development and dialogue
            3. Military authenticity and accuracy
            4. Commercial viability and target audience
            5. Strengths and areas for improvement
            6. Festival submission potential
            
            Be constructive and specific in your feedback.`
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      });

      const analysis = response.choices[0].message.content;

      // Create notification for AI task completion
      const notification = await storage.createNotification({
        userId,
        type: 'ai_task_complete',
        title: '📊 Script Analysis Complete',
        message: `Your script analysis is ready with detailed insights and recommendations!`,
        actionUrl: `/ai-tools`,
        relatedEntityType: 'ai_generation',
        relatedEntityId: 'script_analysis',
        metadata: { 
          taskType: 'script_analysis',
          creditsUsed: requiredCredits
        },
        isRead: false
      });

      // Send real-time notification
      if (global.sendRealtimeNotification) {
        global.sendRealtimeNotification(userId, notification);
      }

      res.json({
        analysis,
        creditsUsed: requiredCredits,
        remainingCredits: userCredits - requiredCredits
      });
    } catch (error: any) {
      console.error("Error analyzing script:", error);
      res.status(500).json({ message: "Failed to analyze script: " + error.message });
    }
  });

  // Credit system and billing routes
  app.get('/api/billing/credits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Super users get unlimited credits
      if (user?.email && isSuperUser(user.email)) {
        res.json({ credits: 999999 }); // Unlimited credits for super users
        return;
      }
      
      const credits = await storage.getUserCredits(userId);
      res.json({ credits });
    } catch (error) {
      console.error("Error fetching user credits:", error);
      res.status(500).json({ message: "Failed to fetch credits" });
    }
  });

  app.get('/api/billing/subscription-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      let subscription = null;
      
      // Check if user is a super user
      if (user?.email && isSuperUser(user.email)) {
        // Super users get unlimited access - simulate premium subscription
        subscription = {
          status: 'active',
          planName: 'Super User - Unlimited Access',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          planId: 'super-user',
          isSuperUser: true
        };
      } else if (user?.subscriptionPlanId && user?.subscriptionStatus) {
        const plan = await storage.getSubscriptionPlan(user.subscriptionPlanId);
        subscription = {
          status: user.subscriptionStatus,
          planName: plan?.name || 'Unknown Plan',
          expiresAt: user.subscriptionExpiresAt,
          planId: user.subscriptionPlanId
        };
      }
      
      res.json({ subscription });
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });

  app.get('/api/billing/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { limit } = req.query;
      const transactions = await storage.getCreditTransactions(userId, limit ? parseInt(limit as string) : 50);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get('/api/billing/plans', async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  // Create payment intent for credit purchases
  app.post("/api/billing/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      const { amount, credits, plan } = req.body;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Apply military discount if eligible
      let finalAmount = amount;
      if (user.militaryBranch && user.militaryBranch !== 'civilian' && user.militaryBranch !== 'not_applicable') {
        finalAmount = Math.round(amount * 0.8); // 20% military discount
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: finalAmount,
        currency: "usd",
        metadata: {
          userId,
          credits: credits.toString(),
          plan: plan || 'one_time',
          originalAmount: amount.toString(),
          discountApplied: finalAmount !== amount ? 'military_20' : 'none'
        },
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        finalAmount,
        discountApplied: finalAmount !== amount
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Handle successful payment and add credits
  app.post("/api/billing/confirm-payment", isAuthenticated, async (req: any, res) => {
    try {
      const { paymentIntentId } = req.body;
      const userId = req.user.claims.sub;

      // Retrieve the payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment not completed" });
      }

      if (paymentIntent.metadata.userId !== userId) {
        return res.status(403).json({ message: "Payment belongs to different user" });
      }

      const credits = parseInt(paymentIntent.metadata.credits);
      const plan = paymentIntent.metadata.plan;

      // Add credits to user account
      await storage.addCredits(
        userId,
        credits,
        'purchase',
        `Credit purchase - ${plan}`,
        'billing',
        paymentIntentId,
        paymentIntentId
      );

      res.json({ 
        success: true,
        credits,
        message: `Successfully added ${credits} credits to your account`
      });
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Error confirming payment: " + error.message });
    }
  });

  // Create subscription
  app.post('/api/billing/create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { planId } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user || !user.email) {
        return res.status(400).json({ message: "User email required for subscription" });
      }

      // Get or create Stripe customer
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim() || user.email,
          metadata: { userId }
        });
        stripeCustomerId = customer.id;
        await storage.updateUserStripeInfo(userId, stripeCustomerId);
      }

      // Get subscription plan
      const plans = await storage.getSubscriptionPlans();
      const plan = plans.find(p => p.id === planId);
      if (!plan || !plan.stripePriceId) {
        return res.status(400).json({ message: "Invalid subscription plan" });
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: plan.stripePriceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId,
          planId,
          creditsIncluded: plan.creditsIncluded.toString()
        }
      });

      // Update user subscription info
      await storage.updateUserStripeInfo(userId, stripeCustomerId, subscription.id);
      await storage.updateUserSubscription(
        userId, 
        plan.id, 
        subscription.status, 
        new Date(subscription.current_period_end * 1000)
      );

      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        status: subscription.status
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Error creating subscription: " + error.message });
    }
  });

  // Initialize default subscription plans
  app.post('/api/admin/init-plans', async (req, res) => {
    try {
      const existingPlans = await storage.getSubscriptionPlans();
      if (existingPlans.length > 0) {
        return res.json({ message: "Plans already initialized" });
      }

      const defaultPlans = [
        {
          id: 'weekly',
          name: 'Weekly Pass',
          description: 'Perfect for short-term projects and testing our platform',
          price: 500, // $5.00
          currency: 'usd',
          interval: 'week' as const,
          creditsIncluded: 100,
          militaryDiscountPercent: 20,
          isActive: true
        },
        {
          id: 'monthly', 
          name: 'Monthly Plan',
          description: 'Best value for regular users and ongoing projects',
          price: 1500, // $15.00
          currency: 'usd',
          interval: 'month' as const,
          creditsIncluded: 500,
          militaryDiscountPercent: 20,
          isActive: true
        },
        {
          id: 'yearly',
          name: 'Annual Plan', 
          description: 'Maximum savings for serious filmmakers and studios',
          price: 12000, // $120.00
          currency: 'usd',
          interval: 'year' as const,
          creditsIncluded: 6000,
          militaryDiscountPercent: 20,
          isActive: true
        }
      ];

      for (const plan of defaultPlans) {
        await storage.createSubscriptionPlan(plan);
      }

      res.json({ message: "Default subscription plans created successfully" });
    } catch (error) {
      console.error("Error initializing plans:", error);
      res.status(500).json({ message: "Failed to initialize plans" });
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

  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const notifications = await storage.getUserNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread-count", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const notificationId = req.params.id;
      await storage.markNotificationAsRead(notificationId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch("/api/notifications/mark-all-read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark notifications as read" });
    }
  });

  app.delete("/api/notifications/:id", isAuthenticated, async (req: any, res) => {
    try {
      const notificationId = req.params.id;
      await storage.deleteNotification(notificationId);
      res.json({ message: "Notification deleted" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Tutorial and onboarding routes
  app.put("/api/tutorial/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { step, completed } = req.body;
      
      await storage.updateTutorialProgress(userId, { 
        tutorialStep: step,
        lastTutorialInteraction: new Date(),
        ...(completed && { hasCompletedOnboarding: true, tutorialCompletedAt: new Date() })
      });
      
      res.json({ message: "Tutorial progress updated" });
    } catch (error) {
      console.error("Error updating tutorial progress:", error);
      res.status(500).json({ message: "Failed to update tutorial progress" });
    }
  });

  app.post("/api/tutorial/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Award welcome package if not already received
      if (!user.hasReceivedWelcomePackage) {
        const welcomeCredits = 25;
        await storage.updateUserCredits(userId, user.credits + welcomeCredits);
        
        // Create welcome notification
        await storage.createNotification({
          userId,
          type: 'system',
          title: '🎖️ Welcome Package Delivered',
          message: `Congratulations! You've earned ${welcomeCredits} credits for completing the tutorial. Welcome to BravoZulu Films!`,
        });
      }

      // Mark tutorial as completed and welcome package received
      await storage.updateTutorialProgress(userId, {
        hasCompletedOnboarding: true,
        hasReceivedWelcomePackage: true,
        tutorialCompletedAt: new Date(),
        tutorialStep: 5, // Max step
      });
      
      res.json({ message: "Tutorial completed and welcome package delivered" });
    } catch (error) {
      console.error("Error completing tutorial:", error);
      res.status(500).json({ message: "Failed to complete tutorial" });
    }
  });

  // DIRECTOR'S TOOLKIT API ROUTES

  // Shot List routes
  app.get("/api/projects/:projectId/shot-lists", isAuthenticated, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const shotLists = await storage.getProjectShotLists(projectId);
      res.json(shotLists);
    } catch (error) {
      console.error("Error fetching shot lists:", error);
      res.status(500).json({ message: "Failed to fetch shot lists" });
    }
  });

  app.post("/api/projects/:projectId/shot-lists", isAuthenticated, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user.claims.sub;
      const shotList = await storage.createShotList({
        ...req.body,
        projectId,
        createdBy: userId,
      });
      res.json(shotList);
    } catch (error) {
      console.error("Error creating shot list:", error);
      res.status(500).json({ message: "Failed to create shot list" });
    }
  });

  app.get("/api/shot-lists/:id/shots", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const shots = await storage.getShotListShots(id);
      res.json(shots);
    } catch (error) {
      console.error("Error fetching shots:", error);
      res.status(500).json({ message: "Failed to fetch shots" });
    }
  });

  app.post("/api/shot-lists/:id/shots", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const shot = await storage.createShot({
        ...req.body,
        shotListId: id,
      });
      res.json(shot);
    } catch (error) {
      console.error("Error creating shot:", error);
      res.status(500).json({ message: "Failed to create shot" });
    }
  });

  // Schedule routes
  app.get("/api/projects/:projectId/schedule", isAuthenticated, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const schedule = await storage.getProjectSchedule(projectId);
      res.json(schedule);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      res.status(500).json({ message: "Failed to fetch schedule" });
    }
  });

  app.post("/api/projects/:projectId/schedule", isAuthenticated, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user.claims.sub;
      const scheduleItem = await storage.createScheduleItem({
        ...req.body,
        projectId,
        createdBy: userId,
      });
      res.json(scheduleItem);
    } catch (error) {
      console.error("Error creating schedule item:", error);
      res.status(500).json({ message: "Failed to create schedule item" });
    }
  });

  // Crew routes
  app.get("/api/projects/:projectId/crew", isAuthenticated, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const crew = await storage.getProjectCrew(projectId);
      res.json(crew);
    } catch (error) {
      console.error("Error fetching crew:", error);
      res.status(500).json({ message: "Failed to fetch crew" });
    }
  });

  app.post("/api/projects/:projectId/crew", isAuthenticated, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user.claims.sub;
      const crewMember = await storage.addCrewMember({
        ...req.body,
        projectId,
        addedBy: userId,
      });
      res.json(crewMember);
    } catch (error) {
      console.error("Error adding crew member:", error);
      res.status(500).json({ message: "Failed to add crew member" });
    }
  });

  // Budget routes
  app.get("/api/projects/:projectId/budget", isAuthenticated, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const budget = await storage.getProjectBudget(projectId);
      res.json(budget);
    } catch (error) {
      console.error("Error fetching budget:", error);
      res.status(500).json({ message: "Failed to fetch budget" });
    }
  });

  app.post("/api/projects/:projectId/budget", isAuthenticated, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user.claims.sub;
      const budgetItem = await storage.createBudgetItem({
        ...req.body,
        projectId,
        createdBy: userId,
      });
      res.json(budgetItem);
    } catch (error) {
      console.error("Error creating budget item:", error);
      res.status(500).json({ message: "Failed to create budget item" });
    }
  });

  // Equipment routes
  app.get("/api/projects/:projectId/equipment", isAuthenticated, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const equipment = await storage.getProjectEquipment(projectId);
      res.json(equipment);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });

  app.get("/api/equipment/my", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const equipment = await storage.getUserEquipment(userId);
      res.json(equipment);
    } catch (error) {
      console.error("Error fetching user equipment:", error);
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });

  app.post("/api/equipment", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const equipment = await storage.addEquipment({
        ...req.body,
        ownedBy: userId,
      });
      res.json(equipment);
    } catch (error) {
      console.error("Error adding equipment:", error);
      res.status(500).json({ message: "Failed to add equipment" });
    }
  });

  // Location routes
  app.get("/api/projects/:projectId/locations", isAuthenticated, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const locations = await storage.getProjectLocations(projectId);
      res.json(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  app.get("/api/locations/my", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const locations = await storage.getUserLocations(userId);
      res.json(locations);
    } catch (error) {
      console.error("Error fetching user locations:", error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  app.post("/api/locations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const location = await storage.addLocation({
        ...req.body,
        scoutedBy: userId,
      });
      res.json(location);
    } catch (error) {
      console.error("Error adding location:", error);
      res.status(500).json({ message: "Failed to add location" });
    }
  });

  // EDITOR'S TOOLKIT API ROUTES (Premium AI Features)

  // Video Edit Projects
  app.get("/api/video-edit-projects", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const projects = await storage.getVideoEditProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching video edit projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/video-edit-projects", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const projectData = { ...req.body, userId };
      const project = await storage.createVideoEditProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating video edit project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // AI Edit Operations
  app.get("/api/ai-edit-operations/:projectId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const operations = await storage.getAiEditOperations(req.params.projectId, userId);
      res.json(operations);
    } catch (error) {
      console.error("Error fetching AI operations:", error);
      res.status(500).json({ message: "Failed to fetch operations" });
    }
  });

  app.post("/api/ai-edit-operations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { operationType, projectId, parameters } = req.body;

      // Credit cost mapping for different operations
      const creditCosts: Record<string, number> = {
        color_correction: 50,
        scene_detection: 30,
        transition_generation: 40,
        noise_reduction: 25,
        audio_enhancement: 35,
        background_removal: 60,
        object_tracking: 45,
        stabilization: 30,
        slow_motion: 20,
        speed_ramping: 25,
        text_overlay: 15,
        visual_effects: 80,
      };

      const creditsRequired = creditCosts[operationType] || 50;
      
      // Check if user has enough credits
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Super users get unlimited access (BravoZuluFilms@gmail.com and usmc2532@gmail.com)
      const superUsers = ['bravozulufilms@gmail.com', 'usmc2532@gmail.com'];
      const isSuperUser = user.email && superUsers.includes(user.email.toLowerCase());

      if (!isSuperUser && (user.credits || 0) < creditsRequired) {
        return res.status(402).json({ 
          message: "Insufficient credits", 
          required: creditsRequired,
          available: user?.credits || 0 
        });
      }

      // Deduct credits only for non-super users
      if (!isSuperUser) {
        await storage.updateUserCredits(userId, (user.credits || 0) - creditsRequired);
      }

      // Create AI operation
      const operationData = {
        projectId,
        operationType,
        parameters: parameters || {},
        creditsUsed: creditsRequired,
      };
      
      const operation = await storage.createAiEditOperation(operationData);

      // Create notification for processing
      await storage.createNotification({
        userId,
        type: 'system',
        title: 'AI Operation Started',
        message: `${operationType.replace('_', ' ').toUpperCase()} processing has begun. You'll be notified when complete.`,
        read: false,
      });

      res.json(operation);
    } catch (error) {
      console.error("Error creating AI operation:", error);
      res.status(500).json({ message: "Failed to create operation" });
    }
  });

  // Audio Processing Jobs
  app.get("/api/audio-processing-jobs/:projectId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const jobs = await storage.getAudioProcessingJobs(req.params.projectId, userId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching audio jobs:", error);
      res.status(500).json({ message: "Failed to fetch audio jobs" });
    }
  });

  app.post("/api/audio-processing-jobs", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const jobData = req.body;
      const job = await storage.createAudioProcessingJob(jobData);
      res.json(job);
    } catch (error) {
      console.error("Error creating audio job:", error);
      res.status(500).json({ message: "Failed to create audio job" });
    }
  });

  // Visual Effects Jobs
  app.get("/api/visual-effects-jobs/:projectId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const jobs = await storage.getVisualEffectsJobs(req.params.projectId, userId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching VFX jobs:", error);
      res.status(500).json({ message: "Failed to fetch VFX jobs" });
    }
  });

  app.post("/api/visual-effects-jobs", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const jobData = req.body;
      const job = await storage.createVisualEffectsJob(jobData);
      res.json(job);
    } catch (error) {
      console.error("Error creating VFX job:", error);
      res.status(500).json({ message: "Failed to create VFX job" });
    }
  });

  // FILE MANAGEMENT API ROUTES

  // Get user's uploaded files
  app.get("/api/files", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const files = await storage.getUserFiles(userId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  // Upload a file
  app.post("/api/files/upload", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      // For now, return a mock response - file upload will be implemented with object storage
      const mockFile = {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        filename: "example.pdf",
        originalName: "Script_v1.pdf", 
        fileType: "script",
        mimeType: "application/pdf",
        fileSize: 2048576,
        filePath: "/uploads/example.pdf",
        category: "draft",
        tags: ["script", "draft"],
        description: "Latest script version",
        isPublic: false,
        downloadCount: 0,
        version: 1,
      };
      res.json(mockFile);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Download a file
  app.get("/api/files/:id/download", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const file = await storage.getFile(req.params.id, userId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      // Increment download count
      await storage.incrementFileDownload(req.params.id);
      
      // Return download URL (mock for now)
      res.json({ downloadUrl: `/downloads/${file.filePath}` });
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  // Update file metadata
  app.put("/api/files/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const file = await storage.updateFile(req.params.id, userId, req.body);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      res.json(file);
    } catch (error) {
      console.error("Error updating file:", error);
      res.status(500).json({ message: "Failed to update file" });
    }
  });

  // Delete a file
  app.delete("/api/files/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      await storage.deleteFile(req.params.id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // FESTIVAL PACKET ROUTES

  // Get user's festival packets
  app.get("/api/festival-packets", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const packets = await storage.getFestivalPackets(userId);
      res.json(packets);
    } catch (error) {
      console.error("Error fetching festival packets:", error);
      res.status(500).json({ message: "Failed to fetch festival packets" });
    }
  });

  // Create festival packet
  app.post("/api/festival-packets", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const packetData = { ...req.body, userId };
      const packet = await storage.createFestivalPacket(packetData);
      res.json(packet);
    } catch (error) {
      console.error("Error creating festival packet:", error);
      res.status(500).json({ message: "Failed to create festival packet" });
    }
  });

  // Export festival packet
  app.post("/api/festival-packets/:id/export", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const packet = await storage.getFestivalPacket(req.params.id, userId);
      if (!packet) {
        return res.status(404).json({ message: "Packet not found" });
      }

      // Create export package (mock implementation)
      const exportPackage = {
        downloadUrl: `/exports/festival-packet-${packet.id}.zip`,
        filename: `${packet.title}_${packet.festivalName}.zip`,
        size: 25600000, // 25MB example
        created: new Date().toISOString(),
      };

      res.json(exportPackage);
    } catch (error) {
      console.error("Error exporting festival packet:", error);
      res.status(500).json({ message: "Failed to export packet" });
    }
  });

  // EXPORT TEMPLATE ROUTES

  // Get export templates
  app.get("/api/export-templates", isAuthenticated, async (req, res) => {
    try {
      const templates = await storage.getExportTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching export templates:", error);
      res.status(500).json({ message: "Failed to fetch export templates" });
    }
  });

  // Create export template
  app.post("/api/export-templates", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const templateData = { ...req.body, createdBy: userId };
      const template = await storage.createExportTemplate(templateData);
      res.json(template);
    } catch (error) {
      console.error("Error creating export template:", error);
      res.status(500).json({ message: "Failed to create export template" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active WebSocket connections by user ID
  const userConnections = new Map<string, WebSocket>();
  
  wss.on('connection', (ws, req) => {
    console.log('WebSocket connection established');
    let userId: string | null = null;
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);
        
        if (data.type === 'authenticate' && data.userId) {
          userId = data.userId;
          userConnections.set(userId, ws);
          console.log(`User ${userId} authenticated via WebSocket`);
          ws.send(JSON.stringify({ type: 'authenticated', userId }));
        }
        
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      if (userId) {
        userConnections.delete(userId);
        console.log(`User ${userId} WebSocket disconnected`);
      }
      console.log('WebSocket connection closed');
    });
  });

  // Helper function to send real-time notifications
  global.sendRealtimeNotification = (userId: string, notification: any) => {
    const userWs = userConnections.get(userId);
    if (userWs && userWs.readyState === WebSocket.OPEN) {
      userWs.send(JSON.stringify({
        type: 'notification',
        data: notification
      }));
    }
  };

  // ADMIN ROUTES - Only accessible by BravoZuluFilms@gmail.com
  const isAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user?.claims?.email !== "bravozulufilms@gmail.com") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    next();
  };

  // Get all users for admin
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get system statistics
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Award credits to user
  app.post("/api/admin/award-credits", isAdmin, async (req, res) => {
    try {
      const { userId, amount, reason } = req.body;
      const adminUserId = req.user.claims.sub;
      
      await storage.awardCredits(userId, amount, reason, adminUserId);
      res.json({ message: "Credits awarded successfully" });
    } catch (error) {
      console.error("Error awarding credits:", error);
      res.status(500).json({ message: "Failed to award credits" });
    }
  });

  // Verify military service
  app.post("/api/admin/verify-service", isAdmin, async (req, res) => {
    try {
      const { userId, serviceType, branch, verified, notes } = req.body;
      const adminUserId = req.user.claims.sub;
      
      await storage.verifyMilitaryService(userId, {
        serviceType,
        branch,
        verified,
        notes,
        verifiedBy: adminUserId
      });
      
      res.json({ message: "Military service verification updated" });
    } catch (error) {
      console.error("Error verifying service:", error);
      res.status(500).json({ message: "Failed to verify service" });
    }
  });

  // Process monthly veteran credits
  app.post("/api/admin/process-monthly-credits", isAdmin, async (req, res) => {
    try {
      const adminUserId = req.user.claims.sub;
      const result = await storage.processMonthlyVeteranCredits(adminUserId);
      res.json(result);
    } catch (error) {
      console.error("Error processing monthly credits:", error);
      res.status(500).json({ message: "Failed to process monthly credits" });
    }
  });

  // Get credit transactions
  app.get("/api/admin/credit-transactions", isAdmin, async (req, res) => {
    try {
      const transactions = await storage.getCreditTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching credit transactions:", error);
      res.status(500).json({ message: "Failed to fetch credit transactions" });
    }
  });

  // Get verification requests
  app.get("/api/admin/verification-requests", isAdmin, async (req, res) => {
    try {
      const requests = await storage.getVerificationRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching verification requests:", error);
      res.status(500).json({ message: "Failed to fetch verification requests" });
    }
  });

  return httpServer;
}

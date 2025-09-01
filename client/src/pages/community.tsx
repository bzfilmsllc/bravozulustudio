import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Navigation } from "@/components/navigation";
import { MemberGuard } from "@/components/member-guard";
import { BannerAd, SidebarAd } from "@/components/google-ads";
import { MemberProfile } from "@/components/member-profile";
import { ActivityFeed } from "@/components/activity-feed";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  MessageSquare,
  UserPlus,
  Send,
  Plus,
  Star,
  Calendar,
  MapPin,
  Mail,
  Shield,
  Flag,
  MessageCircle,
  Heart,
  Reply,
  Search,
  Activity,
  Filter,
  Grid,
  List,
  Briefcase,
  Award,
} from "lucide-react";
import type { User, ForumPost, Message } from "@shared/schema";

const messageSchema = z.object({
  content: z.string().min(1, "Message content is required"),
  receiverId: z.string().min(1, "Recipient is required"),
});

const forumPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  categoryId: z.string().min(1, "Category is required"),
});

export default function Community() {
  const [activeTab, setActiveTab] = useState("directory");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const messageForm = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: "", receiverId: "" },
  });

  const forumForm = useForm({
    resolver: zodResolver(forumPostSchema),
    defaultValues: { title: "", content: "", categoryId: "" },
  });

  // Fetch data with search
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["/api/users/members", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      const response = await fetch(`/api/users/members?${params}`);
      if (!response.ok) throw new Error('Failed to fetch members');
      return response.json();
    },
    retry: false,
  });

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/messages/conversations"],
    retry: false,
  });

  const { data: forumCategories = [] } = useQuery({
    queryKey: ["/api/forum/categories"],
    retry: false,
  });

  const { data: forumPosts = [] } = useQuery({
    queryKey: ["/api/forum/posts"],
    retry: false,
  });

  const { data: friends = [] } = useQuery({
    queryKey: ["/api/friends"],
    retry: false,
  });

  // Mutations
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (toUserId: string) => {
      const response = await apiRequest("POST", "/api/friends/request", { toUserId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Friend Request Sent",
        description: "Your friend request has been sent successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send friend request.",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string; receiverId: string }) => {
      const response = await apiRequest("POST", "/api/messages", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      messageForm.reset();
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    },
  });

  const createForumPostMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; categoryId: string }) => {
      const response = await apiRequest("POST", "/api/forum/posts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      setNewPostOpen(false);
      forumForm.reset();
      toast({
        title: "Post Created",
        description: "Your forum post has been created successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create forum post.",
        variant: "destructive",
      });
    },
  });

  const handleSendFriendRequest = (toUserId: string) => {
    sendFriendRequestMutation.mutate(toUserId);
  };

  const isFriend = (userId: string) => {
    return friends.some((friend: User) => friend.id === userId);
  };

  return (
    <MemberGuard requiredRole="verified">
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Banner Ad */}
            <BannerAd className="mb-6" />
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl font-serif font-bold mb-2">Veteran Creator Community</h1>
              <p className="text-xl text-muted-foreground">
                Connect, collaborate, and create with fellow military veterans
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid grid-cols-4 h-auto p-1">
                <TabsTrigger value="directory" className="flex items-center space-x-2 p-3" data-testid="tab-directory">
                  <Users className="w-4 h-4" />
                  <span>Directory</span>
                </TabsTrigger>
                <TabsTrigger value="forums" className="flex items-center space-x-2 p-3" data-testid="tab-forums">
                  <MessageSquare className="w-4 h-4" />
                  <span>Forums</span>
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center space-x-2 p-3" data-testid="tab-messages">
                  <Mail className="w-4 h-4" />
                  <span>Messages</span>
                </TabsTrigger>
                <TabsTrigger value="network" className="flex items-center space-x-2 p-3" data-testid="tab-network">
                  <Star className="w-4 h-4" />
                  <span>My Network</span>
                </TabsTrigger>
              </TabsList>

              {/* Member Directory */}
              <TabsContent value="directory" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Users className="w-6 h-6 text-primary mr-3" />
                        Member Directory ({members.length})
                      </span>
                      <div className="flex items-center space-x-2">
                        <Input 
                          placeholder="Search members..." 
                          className="w-64"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          data-testid="input-search-members"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                          data-testid="button-toggle-view"
                        >
                          {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {membersLoading ? (
                      <div className={`${viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}`}>
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className={`${viewMode === "grid" ? "h-48" : "h-20"} bg-muted rounded-lg`}></div>
                          </div>
                        ))}
                      </div>
                    ) : members.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {searchQuery ? "No members found matching your search." : "No members found."}
                        </p>
                        {searchQuery && (
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => setSearchQuery("")}
                          >
                            Clear Search
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className={`${viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}`}>
                        {members.map((member: User) => (
                          <Card 
                            key={member.id} 
                            className={`hover:border-primary/50 transition-all cursor-pointer ${viewMode === "list" ? "p-4" : ""}`}
                            onClick={() => setSelectedMember(member.id)}
                            data-testid={`member-card-${member.id}`}
                          >
                            <CardContent className={`${viewMode === "grid" ? "p-6" : "p-0"}`}>
                              {viewMode === "grid" ? (
                                <>
                                  <div className="flex items-center space-x-3 mb-4">
                                    <Avatar className="w-16 h-16">
                                      <AvatarImage src={member.profileImageUrl || undefined} alt={member.firstName || "Member"} />
                                      <AvatarFallback className="text-lg">
                                        {member.firstName?.[0] || member.email?.[0] || "M"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-lg">
                                        {member.firstName && member.lastName 
                                          ? `${member.firstName} ${member.lastName}`
                                          : member.email?.split('@')[0]
                                        }
                                      </h4>
                                      <div className="flex flex-wrap items-center gap-2 mt-2">
                                        {member.role === "verified" && (
                                          <Badge className="bg-green-600">
                                            <Shield className="w-3 h-3 mr-1" />
                                            Verified
                                          </Badge>
                                        )}
                                        {member.militaryBranch && member.militaryBranch !== "civilian" && (
                                          <Badge variant="outline" className="text-xs">
                                            {member.militaryBranch.replace("_", " ").toUpperCase()}
                                          </Badge>
                                        )}
                                        {member.relationshipType && (
                                          <Badge variant="secondary" className="text-xs">
                                            {member.relationshipType.replace("_", " ")}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {member.bio && (
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{member.bio}</p>
                                  )}
                                  
                                  {member.specialties && (
                                    <div className="mb-4">
                                      <div className="flex flex-wrap gap-1">
                                        {member.specialties.split(',').slice(0, 3).map((specialty, index) => (
                                          <Badge key={index} variant="outline" className="text-xs">
                                            {specialty.trim()}
                                          </Badge>
                                        ))}
                                        {member.specialties.split(',').length > 3 && (
                                          <Badge variant="outline" className="text-xs">
                                            +{member.specialties.split(',').length - 3} more
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                      <Calendar className="w-3 h-3" />
                                      <span>Joined {new Date(member.createdAt!).toLocaleDateString()}</span>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedMember(member.id);
                                      }}
                                    >
                                      View Profile
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center space-x-4">
                                  <Avatar className="w-12 h-12">
                                    <AvatarImage src={member.profileImageUrl || undefined} alt={member.firstName || "Member"} />
                                    <AvatarFallback>
                                      {member.firstName?.[0] || member.email?.[0] || "M"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                      <h4 className="font-semibold">
                                        {member.firstName && member.lastName 
                                          ? `${member.firstName} ${member.lastName}`
                                          : member.email?.split('@')[0]
                                        }
                                      </h4>
                                      {member.role === "verified" && (
                                        <Badge className="bg-green-600 text-xs">
                                          <Shield className="w-3 h-3 mr-1" />
                                          Verified
                                        </Badge>
                                      )}
                                      {member.militaryBranch && member.militaryBranch !== "civilian" && (
                                        <Badge variant="outline" className="text-xs">
                                          {member.militaryBranch.replace("_", " ").toUpperCase()}
                                        </Badge>
                                      )}
                                    </div>
                                    {member.bio && (
                                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{member.bio}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(member.createdAt!).toLocaleDateString()}
                                    </span>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedMember(member.id);
                                      }}
                                    >
                                      View Profile
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Community Forums */}
              <TabsContent value="forums" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <MessageSquare className="w-6 h-6 text-primary mr-3" />
                        Community Forums
                      </span>
                      <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
                        <DialogTrigger asChild>
                          <Button data-testid="button-new-post">
                            <Plus className="w-4 h-4 mr-2" />
                            New Post
                          </Button>
                        </DialogTrigger>
                        <DialogContent data-testid="dialog-new-post">
                          <DialogHeader>
                            <DialogTitle>Create New Forum Post</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={forumForm.handleSubmit((data) => createForumPostMutation.mutate(data))} className="space-y-4">
                            <div>
                              <Label htmlFor="postTitle">Title</Label>
                              <Input
                                id="postTitle"
                                {...forumForm.register("title")}
                                placeholder="Enter post title"
                                data-testid="input-post-title"
                              />
                            </div>
                            <div>
                              <Label htmlFor="postContent">Content</Label>
                              <Textarea
                                id="postContent"
                                {...forumForm.register("content")}
                                placeholder="Write your post content..."
                                className="min-h-32"
                                data-testid="textarea-post-content"
                              />
                            </div>
                            <Button type="submit" className="w-full" data-testid="button-submit-post">
                              Create Post
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {forumPosts.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No forum posts yet.</p>
                        <Button onClick={() => setNewPostOpen(true)} data-testid="button-first-post">
                          Create First Post
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {forumPosts.map((post: any) => (
                          <Card key={post.id} className="hover:border-primary/50 transition-all" data-testid={`forum-post-${post.id}`}>
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold mb-2">{post.title}</h3>
                                  <p className="text-muted-foreground text-sm mb-3">{post.content.substring(0, 200)}...</p>
                                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                      <Avatar className="w-4 h-4">
                                        <AvatarImage src={post.author?.profileImageUrl} />
                                        <AvatarFallback>{post.author?.firstName?.[0] || "U"}</AvatarFallback>
                                      </Avatar>
                                      <span>{post.author?.firstName || "Anonymous"}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <MessageCircle className="w-3 h-3" />
                                      <span>{post.replyCount || 0} replies</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="sm" data-testid={`button-like-post-${post.id}`}>
                                    <Heart className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" data-testid={`button-reply-post-${post.id}`}>
                                    <Reply className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              {post.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {post.category.name}
                                </Badge>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Messages */}
              <TabsContent value="messages" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="w-6 h-6 text-primary mr-3" />
                      Private Messages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid lg:grid-cols-3 gap-6">
                      {/* Conversations List */}
                      <div className="lg:col-span-1">
                        <h3 className="font-semibold mb-4">Conversations</h3>
                        {conversationsLoading ? (
                          <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="animate-pulse h-16 bg-muted rounded"></div>
                            ))}
                          </div>
                        ) : conversations.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No conversations yet. Connect with members to start messaging.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {conversations.map((conv: any) => {
                              const otherUser = conv.senderId === user?.id ? conv.receiver : conv.sender;
                              return (
                                <div
                                  key={conv.id}
                                  className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                                    selectedConversation === otherUser?.id ? "border-primary bg-primary/5" : "border-border"
                                  }`}
                                  onClick={() => setSelectedConversation(otherUser?.id)}
                                  data-testid={`conversation-${otherUser?.id}`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage src={otherUser?.profileImageUrl} />
                                      <AvatarFallback>{otherUser?.firstName?.[0] || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-sm truncate">
                                        {otherUser?.firstName && otherUser?.lastName 
                                          ? `${otherUser.firstName} ${otherUser.lastName}`
                                          : otherUser?.email
                                        }
                                      </h4>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {conv.content.substring(0, 50)}...
                                      </p>
                                    </div>
                                    {!conv.isRead && conv.receiverId === user?.id && (
                                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Message Thread */}
                      <div className="lg:col-span-2">
                        {selectedConversation ? (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Conversation</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="h-96 bg-muted/30 rounded-lg p-4 mb-4 overflow-y-auto">
                                <p className="text-sm text-muted-foreground text-center py-8">
                                  Message history will appear here
                                </p>
                              </div>
                              <form onSubmit={messageForm.handleSubmit((data) => sendMessageMutation.mutate(data))} className="flex space-x-2">
                                <Input
                                  {...messageForm.register("content")}
                                  placeholder="Type your message..."
                                  className="flex-1"
                                  data-testid="input-message-content"
                                />
                                <input type="hidden" {...messageForm.register("receiverId")} value={selectedConversation} />
                                <Button type="submit" disabled={sendMessageMutation.isPending} data-testid="button-send-message">
                                  <Send className="w-4 h-4" />
                                </Button>
                              </form>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card>
                            <CardContent className="p-12 text-center">
                              <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">
                                Select a conversation to start messaging
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* My Network */}
              <TabsContent value="network" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="w-6 h-6 text-primary mr-3" />
                      My Professional Network
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {friends.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No connections yet.</p>
                        <Button onClick={() => setActiveTab("directory")} data-testid="button-find-members">
                          Find Members to Connect
                        </Button>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {friends.map((friend: User) => (
                          <Card key={friend.id} className="hover:border-primary/50 transition-all" data-testid={`friend-card-${friend.id}`}>
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-3 mb-4">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={friend.profileImageUrl} />
                                  <AvatarFallback>{friend.firstName?.[0] || "F"}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-semibold text-sm">
                                    {friend.firstName && friend.lastName 
                                      ? `${friend.firstName} ${friend.lastName}`
                                      : friend.email
                                    }
                                  </h4>
                                  {friend.militaryBranch && (
                                    <p className="text-xs text-muted-foreground">
                                      {friend.militaryBranch.replace("_", " ").toUpperCase()} Veteran
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedConversation(friend.id);
                                    setActiveTab("messages");
                                  }}
                                  data-testid={`button-message-${friend.id}`}
                                >
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  Message
                                </Button>
                                <Button size="sm" variant="outline" data-testid={`button-profile-${friend.id}`}>
                                  View Profile
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Community Guidelines */}
            <Card className="mt-12" data-testid="community-guidelines">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-6 h-6 text-primary mr-3" />
                  Community Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Respect & Honor</h4>
                    <p className="text-sm text-muted-foreground">
                      Maintain the highest standards of respect and professionalism in all interactions.
                    </p>
                  </div>
                  <div className="text-center">
                    <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Collaborative Spirit</h4>
                    <p className="text-sm text-muted-foreground">
                      Foster a supportive environment for creative collaboration and professional growth.
                    </p>
                  </div>
                  <div className="text-center">
                    <Flag className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Report Issues</h4>
                    <p className="text-sm text-muted-foreground">
                      Help maintain community standards by reporting inappropriate content or behavior.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Member Profile Modal */}
        {selectedMember && (
          <MemberProfile
            memberId={selectedMember}
            isOpen={!!selectedMember}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </div>
    </MemberGuard>
  );
}

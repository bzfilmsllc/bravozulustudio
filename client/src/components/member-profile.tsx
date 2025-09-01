import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Shield,
  Star,
  MapPin,
  Calendar,
  Mail,
  MessageSquare,
  UserPlus,
  UserCheck,
  Film,
  Edit,
  Award,
  Briefcase,
  Send,
} from "lucide-react";
import type { User as UserType, Project, Script } from "@shared/schema";

interface MemberProfileProps {
  memberId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MemberProfile({ memberId, isOpen, onClose }: MemberProfileProps) {
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch member details
  const { data: member, isLoading } = useQuery({
    queryKey: [`/api/users/${memberId}`],
    enabled: !!memberId && isOpen,
  });

  // Fetch member's projects
  const { data: memberProjects = [] } = useQuery({
    queryKey: [`/api/users/${memberId}/projects`],
    enabled: !!memberId && isOpen,
  });

  // Fetch member's scripts
  const { data: memberScripts = [] } = useQuery({
    queryKey: [`/api/users/${memberId}/scripts`],
    enabled: !!memberId && isOpen,
  });

  // Check friendship status
  const { data: friendshipStatus } = useQuery({
    queryKey: [`/api/friends/status/${memberId}`],
    enabled: !!memberId && isOpen && currentUser?.id !== memberId,
  });

  // Send friend request mutation
  const sendFriendRequest = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/friends/request", { toUserId: memberId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/friends/status/${memberId}`] });
      toast({
        title: "Friend Request Sent",
        description: "Your friend request has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send friend request.",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/messages", {
        receiverId: memberId,
        content: messageContent,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      setMessageContent("");
      setMessageOpen(false);
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading Member Profile</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!member) {
    return null;
  }

  const getMilitaryBadgeColor = (branch: string) => {
    switch (branch) {
      case "army": return "bg-green-600";
      case "navy": return "bg-blue-600";
      case "air_force": return "bg-sky-600";
      case "marines": return "bg-red-600";
      case "coast_guard": return "bg-orange-600";
      case "space_force": return "bg-purple-600";
      default: return "bg-gray-600";
    }
  };

  const formatRelationshipType = (type: string) => {
    return type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatMilitaryBranch = (branch: string) => {
    return branch.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={member.profileImageUrl || undefined} alt={member.firstName || "User"} />
              <AvatarFallback>
                {member.firstName?.[0] || member.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">
                {member.firstName} {member.lastName}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                {member.role === "verified" && (
                  <Badge className="bg-green-600">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified Member
                  </Badge>
                )}
                {member.militaryBranch && member.militaryBranch !== "civilian" && (
                  <Badge className={getMilitaryBadgeColor(member.militaryBranch)}>
                    {formatMilitaryBranch(member.militaryBranch)}
                  </Badge>
                )}
                {member.relationshipType && (
                  <Badge variant="outline">
                    {formatRelationshipType(member.relationshipType)}
                  </Badge>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Action Buttons */}
          {currentUser?.id !== memberId && (
            <div className="flex space-x-3">
              <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-send-message">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Message to {member.firstName}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Type your message..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      rows={4}
                      data-testid="textarea-message"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setMessageOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => sendMessage.mutate()}
                        disabled={!messageContent.trim() || sendMessage.isPending}
                        data-testid="button-send"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {friendshipStatus?.status === "none" && (
                <Button
                  variant="outline"
                  onClick={() => sendFriendRequest.mutate()}
                  disabled={sendFriendRequest.isPending}
                  data-testid="button-add-friend"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Friend
                </Button>
              )}

              {friendshipStatus?.status === "pending" && (
                <Button variant="outline" disabled>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Request Sent
                </Button>
              )}

              {friendshipStatus?.status === "friends" && (
                <Button variant="outline" disabled>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Friends
                </Button>
              )}
            </div>
          )}

          {/* Member Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {member.bio && (
                <div>
                  <h4 className="font-semibold mb-2">Bio</h4>
                  <p className="text-muted-foreground">{member.bio}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {member.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{member.email}</span>
                  </div>
                )}

                {member.yearsOfService && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{member.yearsOfService} years of service</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Joined {new Date(member.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {member.specialties && member.specialties.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects and Scripts Tabs */}
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="projects">
                <Briefcase className="w-4 h-4 mr-2" />
                Projects ({memberProjects.length})
              </TabsTrigger>
              <TabsTrigger value="scripts">
                <Edit className="w-4 h-4 mr-2" />
                Scripts ({memberScripts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-4">
              {memberProjects.length > 0 ? (
                <div className="grid gap-4">
                  {memberProjects.map((project: any) => (
                    <Card key={project.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{project.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {project.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-3">
                              <Badge variant="outline">{project.type}</Badge>
                              <Badge variant={project.status === "completed" ? "default" : "secondary"}>
                                {project.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(project.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Film className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No projects to display</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="scripts" className="space-y-4">
              {memberScripts.length > 0 ? (
                <div className="grid gap-4">
                  {memberScripts.map((script: any) => (
                    <Card key={script.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{script.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {script.logline}
                            </p>
                            <div className="flex items-center space-x-4 mt-3">
                              <Badge variant="outline">{script.genre}</Badge>
                              <Badge variant="secondary">{script.format}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(script.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Edit className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Edit className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No scripts to display</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
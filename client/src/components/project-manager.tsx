import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ListTodo,
  Plus,
  Edit,
  Users,
  Calendar,
  Clock,
  Target,
  Film,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Star,
  Share,
  Download,
} from "lucide-react";
import type { Project } from "@shared/schema";

const projectFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["short_film", "feature", "documentary", "series"]),
  status: z.enum(["pre_production", "production", "post_production", "completed"]).default("pre_production"),
  seekingRoles: z.string().optional(),
  isPublic: z.boolean().default(true),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

export function ProjectManager() {
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "short_film",
      status: "pre_production",
      seekingRoles: "",
      isPublic: true,
    },
  });

  // Fetch user projects
  const { data: userProjects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects/my"],
    retry: false,
  });

  // Fetch public projects for collaboration
  const { data: publicProjects = [], isLoading: publicProjectsLoading } = useQuery({
    queryKey: ["/api/projects"],
    retry: false,
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json();
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsNewProjectOpen(false);
      setSelectedProject(newProject);
      form.reset();
      toast({
        title: "Project Created",
        description: "Your new project has been created successfully.",
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
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    createProjectMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pre_production": return "bg-blue-500";
      case "production": return "bg-yellow-500";
      case "post_production": return "bg-orange-500";
      case "completed": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case "pre_production": return 25;
      case "production": return 50;
      case "post_production": return 75;
      case "completed": return 100;
      default: return 0;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "short_film": return Film;
      case "feature": return Film;
      case "documentary": return Film;
      case "series": return Film;
      default: return Film;
    }
  };

  if (projectsLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="h-64 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold flex items-center">
            <ListTodo className="w-8 h-8 text-primary mr-3" />
            Project Manager
          </h2>
          <p className="text-muted-foreground">Comprehensive film production workflow management</p>
        </div>
        <Button onClick={() => setIsNewProjectOpen(true)} data-testid="button-new-project">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="collaborate">Collaborate</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Project Stats */}
            <Card data-testid="card-project-stats">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Target className="w-5 h-5 mr-2" />
                  Project Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Projects</span>
                  <Badge variant="outline">{userProjects.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">In Production</span>
                  <Badge variant="default">
                    {userProjects.filter((p: any) => p.status === "production").length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <Badge variant="secondary">
                    {userProjects.filter((p: any) => p.status === "completed").length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Collaborations</span>
                  <Badge variant="outline">
                    {publicProjects.filter((p: any) => p.creatorId !== "current-user-id").length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card data-testid="card-quick-actions">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Settings className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" data-testid="button-quick-create">
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Project
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-quick-join">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join a Project
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-quick-timeline">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Timeline
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-quick-export">
                  <Download className="w-4 h-4 mr-2" />
                  Export Reports
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card data-testid="card-recent-activity">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userProjects.slice(0, 3).map((project: any) => (
                  <div key={project.id} className="flex items-center space-x-3" data-testid={`activity-${project.id}`}>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{project.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Updated {new Date(project.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
                {userProjects.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Production Pipeline */}
          <Card data-testid="card-production-pipeline">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Film className="w-6 h-6 text-primary mr-3" />
                Production Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                {["pre_production", "production", "post_production", "completed"].map((status) => {
                  const statusProjects = userProjects.filter((p: any) => p.status === status);
                  return (
                    <div key={status} className="text-center" data-testid={`pipeline-${status}`}>
                      <div className={`w-16 h-16 rounded-full ${getStatusColor(status)} mx-auto mb-3 flex items-center justify-center`}>
                        <span className="text-white font-bold text-lg">{statusProjects.length}</span>
                      </div>
                      <h3 className="font-semibold text-sm mb-1 capitalize">
                        {status.replace("_", " ")}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {statusProjects.length} project{statusProjects.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Projects Tab */}
        <TabsContent value="my-projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Film className="w-6 h-6 text-primary mr-3" />
                My Projects ({userProjects.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userProjects.length === 0 ? (
                <div className="text-center py-12">
                  <Film className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold mb-4">No Projects Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start your first film project and manage the entire production workflow from pre-production to completion.
                  </p>
                  <Button onClick={() => setIsNewProjectOpen(true)} data-testid="button-start-first-project">
                    <Plus className="w-4 h-4 mr-2" />
                    Start Your First Project
                  </Button>
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                  {userProjects.map((project: any) => {
                    const TypeIcon = getTypeIcon(project.type);
                    return (
                      <Card key={project.id} className="hover:border-primary/50 transition-all duration-300" data-testid={`project-card-${project.id}`}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center text-lg">
                              <TypeIcon className="w-5 h-5 text-primary mr-2" />
                              {project.title}
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                              {project.isPublic ? (
                                <Eye className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              )}
                              <Button variant="ghost" size="sm" data-testid={`button-project-menu-${project.id}`}>
                                <Settings className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {project.type.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {project.status.replace("_", " ")}
                            </Badge>
                          </div>
                          
                          {project.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {project.description}
                            </p>
                          )}

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{getStatusProgress(project.status)}%</span>
                            </div>
                            <Progress value={getStatusProgress(project.status)} className="h-2" />
                          </div>

                          {project.seekingRoles && (
                            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                              <p className="text-sm font-medium mb-1">Seeking Roles:</p>
                              <p className="text-xs text-muted-foreground">{project.seekingRoles}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button size="sm" variant="outline" data-testid={`button-share-${project.id}`}>
                                <Share className="w-3 h-3 mr-1" />
                                Share
                              </Button>
                              <Button size="sm" data-testid={`button-manage-${project.id}`}>
                                <Edit className="w-3 h-3 mr-1" />
                                Manage
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collaborate Tab */}
        <TabsContent value="collaborate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-6 h-6 text-primary mr-3" />
                Available Projects ({publicProjects.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {publicProjectsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-muted rounded"></div>
                  ))}
                </div>
              ) : publicProjects.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold mb-4">No Public Projects</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    No public projects are currently seeking collaborators. Check back later or create your own project.
                  </p>
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                  {publicProjects.map((project: any) => {
                    const TypeIcon = getTypeIcon(project.type);
                    return (
                      <Card key={project.id} className="hover:border-primary/50 transition-all duration-300" data-testid={`collab-project-${project.id}`}>
                        <CardHeader>
                          <CardTitle className="flex items-center text-lg">
                            <TypeIcon className="w-5 h-5 text-primary mr-2" />
                            {project.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {project.type.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {project.status.replace("_", " ")}
                            </Badge>
                          </div>
                          
                          {project.description && (
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {project.description}
                            </p>
                          )}

                          {project.seekingRoles && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                              <p className="text-sm font-medium mb-1 text-green-800 dark:text-green-200">Seeking:</p>
                              <p className="text-xs text-green-700 dark:text-green-300">{project.seekingRoles}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Star className="w-3 h-3" />
                              <span>By {project.creator?.firstName || "Unknown"}</span>
                            </div>
                            <Button size="sm" data-testid={`button-join-${project.id}`}>
                              <UserPlus className="w-3 h-3 mr-1" />
                              Join Project
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Project Dialog */}
      <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-new-project">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="e.g., Veterans' Stories Documentary"
                  data-testid="input-project-title"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="type">Project Type *</Label>
                <Select value={form.watch("type")} onValueChange={(value) => form.setValue("type", value as any)}>
                  <SelectTrigger data-testid="select-project-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short_film">Short Film</SelectItem>
                    <SelectItem value="feature">Feature Film</SelectItem>
                    <SelectItem value="documentary">Documentary</SelectItem>
                    <SelectItem value="series">Series</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Describe your project, its goals, and what makes it unique..."
                className="min-h-[100px]"
                data-testid="textarea-project-description"
              />
            </div>

            <div>
              <Label htmlFor="seekingRoles">Seeking Roles (Optional)</Label>
              <Textarea
                id="seekingRoles"
                {...form.register("seekingRoles")}
                placeholder="e.g., Director of Photography, Sound Engineer, Editor..."
                className="min-h-[80px]"
                data-testid="textarea-seeking-roles"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={form.watch("isPublic")}
                onCheckedChange={(checked) => form.setValue("isPublic", checked)}
                data-testid="switch-project-public"
              />
              <Label htmlFor="isPublic" className="flex items-center space-x-2">
                <span>Make project public for collaboration</span>
                {form.watch("isPublic") ? (
                  <Eye className="w-4 h-4 text-primary" />
                ) : (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                )}
              </Label>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsNewProjectOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProjectMutation.isPending} data-testid="button-create-project">
                {createProjectMutation.isPending ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
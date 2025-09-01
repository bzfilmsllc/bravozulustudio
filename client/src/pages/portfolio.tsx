import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  Film,
  FileText,
  Award,
  Star,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Share,
  Download,
  Calendar,
  Clock,
  Users,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ExternalLink,
  Upload,
  ImageIcon,
  Video,
  Music,
  FileIcon,
  Trophy,
  Target,
  Sparkles,
  BookOpen,
  Palette,
  Mic,
} from "lucide-react";
import type { Script, Project } from "@shared/schema";

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's creative work
  const { data: scripts = [], isLoading: scriptsLoading } = useQuery<Script[]>({
    queryKey: ["/api/scripts"],
    retry: false,
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects/my"],
    retry: false,
  });

  const portfolioStats = {
    totalProjects: projects.length,
    completedProjects: projects.filter((p: Project) => p.status === "completed").length,
    scriptsWritten: scripts.length,
    publicWorks: [...scripts, ...projects].filter((item: any) => item.isPublic).length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "production": return "bg-yellow-500";
      case "post_production": return "bg-orange-500";
      case "pre_production": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "script": return FileText;
      case "short_film": return Film;
      case "feature": return Camera;
      case "documentary": return Video;
      case "series": return Play;
      default: return FileIcon;
    }
  };

  const getGenreColor = (genre: string) => {
    const colors = {
      action: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      drama: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      comedy: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      thriller: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      horror: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      documentary: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      war: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    };
    return colors[genre as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  const combinedWorks = [
    ...scripts.map((script: Script) => ({
      ...script,
      type: "script" as const,
      category: "writing",
      thumbnail: "/placeholder-script.jpg",
    })),
    ...projects.map((project: Project) => ({
      ...project,
      type: project.type,
      category: "film",
      thumbnail: "/placeholder-film.jpg",
    })),
  ].sort((a, b) => {
    const dateA = a.updatedAt || a.createdAt;
    const dateB = b.updatedAt || b.createdAt;
    if (!dateA || !dateB) return 0;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  const filteredWorks = selectedCategory === "all" 
    ? combinedWorks 
    : combinedWorks.filter(work => work.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="text-2xl">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-4xl font-serif font-bold mb-2">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}'s Portfolio`
                    : "My Creative Portfolio"
                  }
                </h1>
                <p className="text-xl text-muted-foreground">
                  Showcasing military stories and cinematic excellence
                </p>
                {user?.militaryBranch && (
                  <Badge variant="outline" className="mt-2">
                    <Award className="w-3 h-3 mr-1" />
                    {user.militaryBranch.replace("_", " ").toUpperCase()} Veteran
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="works">Portfolio</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="gallery">Media Gallery</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-6">
                <Card data-testid="card-total-projects">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Film className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{portfolioStats.totalProjects}</h3>
                    <p className="text-sm text-muted-foreground">Total Projects</p>
                  </CardContent>
                </Card>

                <Card data-testid="card-completed-projects">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{portfolioStats.completedProjects}</h3>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </CardContent>
                </Card>

                <Card data-testid="card-scripts-written">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{portfolioStats.scriptsWritten}</h3>
                    <p className="text-sm text-muted-foreground">Scripts Written</p>
                  </CardContent>
                </Card>

                <Card data-testid="card-public-works">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Eye className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{portfolioStats.publicWorks}</h3>
                    <p className="text-sm text-muted-foreground">Public Works</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Work */}
              <Card data-testid="card-recent-work">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="w-6 h-6 text-primary mr-3" />
                    Recent Work
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {combinedWorks.length === 0 ? (
                    <div className="text-center py-12">
                      <Camera className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
                      <h3 className="text-2xl font-semibold mb-4">Build Your Portfolio</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Start creating scripts and projects to showcase your creative work and build your professional portfolio.
                      </p>
                      <div className="flex justify-center space-x-4">
                        <Button variant="outline" data-testid="button-create-script">
                          <FileText className="w-4 h-4 mr-2" />
                          Write Script
                        </Button>
                        <Button data-testid="button-create-project">
                          <Film className="w-4 h-4 mr-2" />
                          Start Project
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {combinedWorks.slice(0, 6).map((work: any) => {
                        const TypeIcon = getTypeIcon(work.type);
                        return (
                          <Card key={work.id} className="group hover:border-primary/50 transition-all duration-300" data-testid={`work-card-${work.id}`}>
                            <CardContent className="p-4">
                              <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                                <TypeIcon className="w-8 h-8 text-muted-foreground" />
                              </div>
                              <h3 className="font-semibold mb-2 line-clamp-2">{work.title}</h3>
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  {work.type.replace("_", " ")}
                                </Badge>
                                {work.isPublic ? (
                                  <Eye className="w-3 h-3 text-muted-foreground" />
                                ) : (
                                  <EyeOff className="w-3 h-3 text-muted-foreground" />
                                )}
                              </div>
                              {work.genre && (
                                <Badge variant="outline" className={`text-xs mb-2 ${getGenreColor(work.genre)}`}>
                                  {work.genre}
                                </Badge>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Updated {new Date(work.updatedAt || work.createdAt).toLocaleDateString()}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skills & Expertise */}
              <Card data-testid="card-skills">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-6 h-6 text-primary mr-3" />
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Creative Skills</h4>
                      <div className="space-y-3">
                        {[
                          { skill: "Screenwriting", level: 85 },
                          { skill: "Directing", level: 70 },
                          { skill: "Story Development", level: 90 },
                          { skill: "Character Development", level: 80 },
                        ].map((item) => (
                          <div key={item.skill}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{item.skill}</span>
                              <span className="text-sm text-muted-foreground">{item.level}%</span>
                            </div>
                            <Progress value={item.level} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Technical Skills</h4>
                      <div className="space-y-3">
                        {[
                          { skill: "Video Editing", level: 75 },
                          { skill: "Sound Design", level: 60 },
                          { skill: "Project Management", level: 95 },
                          { skill: "Team Leadership", level: 90 },
                        ].map((item) => (
                          <div key={item.skill}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{item.skill}</span>
                              <span className="text-sm text-muted-foreground">{item.level}%</span>
                            </div>
                            <Progress value={item.level} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Portfolio Tab */}
            <TabsContent value="works" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48" data-testid="select-category">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Work</SelectItem>
                      <SelectItem value="writing">Scripts & Writing</SelectItem>
                      <SelectItem value="film">Film Projects</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-1 border rounded-lg p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      data-testid="button-grid-view"
                    >
                      <div className="grid grid-cols-2 gap-1 w-4 h-4">
                        <div className="bg-current rounded-sm"></div>
                        <div className="bg-current rounded-sm"></div>
                        <div className="bg-current rounded-sm"></div>
                        <div className="bg-current rounded-sm"></div>
                      </div>
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      data-testid="button-list-view"
                    >
                      <div className="space-y-1 w-4 h-4">
                        <div className="bg-current h-1 rounded"></div>
                        <div className="bg-current h-1 rounded"></div>
                        <div className="bg-current h-1 rounded"></div>
                      </div>
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {filteredWorks.length} work{filteredWorks.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <Card data-testid="card-portfolio-works">
                <CardContent className="p-6">
                  {filteredWorks.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
                      <h3 className="text-2xl font-semibold mb-4">No Work Found</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        {selectedCategory === "all" 
                          ? "Start creating content to build your portfolio."
                          : `No ${selectedCategory} works found. Try selecting a different category.`
                        }
                      </p>
                    </div>
                  ) : viewMode === "grid" ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredWorks.map((work: any) => {
                        const TypeIcon = getTypeIcon(work.type);
                        return (
                          <Card key={work.id} className="group hover:border-primary/50 transition-all duration-300" data-testid={`portfolio-work-${work.id}`}>
                            <CardContent className="p-0">
                              <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                                <TypeIcon className="w-12 h-12 text-muted-foreground" />
                              </div>
                              <div className="p-4">
                                <h3 className="font-semibold mb-2 line-clamp-2">{work.title}</h3>
                                {work.description && (
                                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                    {work.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between mb-3">
                                  <Badge variant="secondary" className="text-xs">
                                    {work.type.replace("_", " ")}
                                  </Badge>
                                  {work.status && (
                                    <Badge variant="outline" className="text-xs">
                                      {work.status.replace("_", " ")}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(work.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Button variant="ghost" size="sm" data-testid={`button-view-${work.id}`}>
                                      <Eye className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" data-testid={`button-edit-${work.id}`}>
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" data-testid={`button-share-${work.id}`}>
                                      <Share className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredWorks.map((work: any) => {
                        const TypeIcon = getTypeIcon(work.type);
                        return (
                          <div 
                            key={work.id} 
                            className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:border-primary/50 transition-all"
                            data-testid={`portfolio-work-list-${work.id}`}
                          >
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                              <TypeIcon className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold mb-1">{work.title}</h3>
                              {work.description && (
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                                  {work.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary" className="text-xs">
                                  {work.type.replace("_", " ")}
                                </Badge>
                                {work.status && (
                                  <Badge variant="outline" className="text-xs">
                                    {work.status.replace("_", " ")}
                                  </Badge>
                                )}
                                {work.genre && (
                                  <Badge variant="outline" className={`text-xs ${getGenreColor(work.genre)}`}>
                                    {work.genre}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(work.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button variant="ghost" size="sm" data-testid={`button-view-list-${work.id}`}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" data-testid={`button-edit-list-${work.id}`}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" data-testid={`button-share-list-${work.id}`}>
                                <Share className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <Card data-testid="card-achievements">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-6 h-6 text-primary mr-3" />
                    Achievements & Recognition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Trophy className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold mb-4">Achievements Coming Soon</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Showcase your awards, festival selections, and professional recognition here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Media Gallery Tab */}
            <TabsContent value="gallery" className="space-y-6">
              <Card data-testid="card-media-gallery">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <ImageIcon className="w-6 h-6 text-primary mr-3" />
                      Media Gallery
                    </span>
                    <Button variant="outline" data-testid="button-upload-media">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Media
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="grid grid-cols-3 gap-4 w-24 h-24 mx-auto mb-6">
                      <div className="bg-muted rounded flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="bg-muted rounded flex items-center justify-center">
                        <Video className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="bg-muted rounded flex items-center justify-center">
                        <Music className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="bg-muted rounded flex items-center justify-center">
                        <FileIcon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="bg-muted rounded flex items-center justify-center">
                        <Camera className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="bg-muted rounded flex items-center justify-center">
                        <Mic className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-semibold mb-4">Build Your Media Gallery</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Upload images, videos, audio files, and other media to create a comprehensive showcase of your creative work.
                    </p>
                    <Button data-testid="button-start-uploading">
                      <Upload className="w-4 h-4 mr-2" />
                      Start Uploading
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
    </div>
  );
}
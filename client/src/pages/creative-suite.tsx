import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { VideoEditProject, UploadedFile, FestivalPacket } from "@shared/schema";
import {
  Play,
  Pause,
  Upload,
  Download,
  Scissors,
  Volume2,
  Palette,
  Zap,
  Crown,
  Sparkles,
  Film,
  Music,
  Wand2,
  CircuitBoard,
  Target,
  Award,
  ChevronRight,
  Archive,
  Package,
  FileText,
  Camera,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Plus,
  Edit,
  Folder,
  Share2,
  ExternalLink,
  Settings,
  Infinity,
  Send,
} from "lucide-react";

export default function CreativeSuite() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreatePacket, setShowCreatePacket] = useState(false);

  // Check if user has super access
  const isSuperUser = user?.email === "bravozulufilms@gmail.com" || user?.email === "usmc2532@gmail.com";

  // Get all user projects (both video edit and director projects)
  const { data: videoProjects = [], isLoading: loadingVideoProjects } = useQuery({
    queryKey: ['/api/video-edit-projects'],
    enabled: isAuthenticated,
  });

  const { data: directorProjects = [], isLoading: loadingDirectorProjects } = useQuery({
    queryKey: ['/api/projects/my'],
    enabled: isAuthenticated,
  });

  // Get user's files
  const { data: files = [], isLoading: loadingFiles } = useQuery({
    queryKey: ['/api/files'],
    enabled: isAuthenticated,
  });

  // Get festival packets
  const { data: packets = [] } = useQuery({
    queryKey: ['/api/festival-packets'],
    enabled: isAuthenticated,
  });

  // Get current project operations
  const { data: operations = [] } = useQuery({
    queryKey: ['/api/ai-edit-operations', selectedProject],
    enabled: !!selectedProject,
  });

  // Get audio processing jobs
  const { data: audioJobs = [] } = useQuery({
    queryKey: ['/api/audio-processing-jobs', selectedProject],
    enabled: !!selectedProject,
  });

  // Get visual effects jobs
  const { data: vfxJobs = [] } = useQuery({
    queryKey: ['/api/visual-effects-jobs', selectedProject],
    enabled: !!selectedProject,
  });

  // Create new video project mutation
  const createVideoProjectMutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      return apiRequest('POST', '/api/video-edit-projects', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/video-edit-projects'] });
      toast({
        title: "🎬 Video Project Created",
        description: "New AI editing project ready for production!",
      });
      setShowCreateProject(false);
    },
  });

  // Create festival packet mutation
  const createPacketMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/festival-packets', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/festival-packets'] });
      toast({
        title: "🏆 Festival Packet Created",
        description: "Your submission package is ready for festival entry!",
      });
      setShowCreatePacket(false);
    },
  });

  // AI operation mutation
  const aiOperationMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/ai-edit-operations', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-edit-operations', selectedProject] });
      toast({
        title: "🤖 AI Operation Started",
        description: "Your video is being processed by advanced AI!",
      });
    },
  });

  const allProjects = [...videoProjects, ...directorProjects];
  const recentFiles = files.slice(0, 6);
  const activeOperations = operations.filter((op: any) => op.status === 'processing');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Restricted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Please log in to access the Creative Suite.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-honor-gold/20 rounded-full ring-2 ring-honor-gold/50">
              <CircuitBoard className="w-8 h-8 text-honor-gold" />
            </div>
          </div>
          <h1 className="font-command text-4xl font-bold gradient-medal-gold mb-2">
            🎬 CREATIVE COMMAND CENTER
          </h1>
          <p className="font-rajdhani text-xl text-tactical-gray mb-4">
            UNIFIED FILM PRODUCTION SUITE - DIRECTOR • EDITOR • FILES
          </p>
          <div className="flex items-center justify-center gap-2">
            <Target className="w-5 h-5 text-honor-gold" />
            <Badge variant="secondary" className="bg-honor-gold text-tactical-black font-bold">
              PROFESSIONAL GRADE
            </Badge>
            {isSuperUser && (
              <>
                <Crown className="w-4 h-4 text-honor-gold" />
                <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold">
                  <Infinity className="w-3 h-3 mr-1" />
                  UNLIMITED ACCESS
                </Badge>
              </>
            )}
            <Target className="w-5 h-5 text-honor-gold" />
          </div>
        </div>

        {/* Quick Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-honor-gold/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Projects</p>
                  <p className="text-2xl font-bold text-honor-gold">{allProjects.length}</p>
                </div>
                <Film className="w-8 h-8 text-honor-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-honor-gold/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Files</p>
                  <p className="text-2xl font-bold text-honor-gold">{files.length}</p>
                </div>
                <Archive className="w-8 h-8 text-honor-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-honor-gold/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active AI</p>
                  <p className="text-2xl font-bold text-honor-gold">{activeOperations.length}</p>
                </div>
                <Zap className="w-8 h-8 text-honor-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-honor-gold/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Packets</p>
                  <p className="text-2xl font-bold text-honor-gold">{packets.length}</p>
                </div>
                <Package className="w-8 h-8 text-honor-gold" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Interface */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-tactical-black/20">
            <TabsTrigger value="overview" className="font-rajdhani data-[state=active]:text-tactical-black data-[state=active]:bg-honor-gold">
              Overview
            </TabsTrigger>
            <TabsTrigger value="editor" className="font-rajdhani data-[state=active]:text-tactical-black data-[state=active]:bg-honor-gold">
              AI Editor
            </TabsTrigger>
            <TabsTrigger value="director" className="font-rajdhani data-[state=active]:text-tactical-black data-[state=active]:bg-honor-gold">
              Director Tools
            </TabsTrigger>
            <TabsTrigger value="files" className="font-rajdhani data-[state=active]:text-tactical-black data-[state=active]:bg-honor-gold">
              File Manager
            </TabsTrigger>
            <TabsTrigger value="festival" className="font-rajdhani data-[state=active]:text-tactical-black data-[state=active]:bg-honor-gold">
              Festival Hub
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Projects */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Film className="w-5 h-5 text-honor-gold" />
                    Recent Projects
                  </CardTitle>
                  <CardDescription>Your latest film productions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allProjects.slice(0, 3).length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No projects yet. Create your first project to get started!
                      </p>
                    ) : (
                      allProjects.slice(0, 3).map((project: any) => (
                        <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{project.title}</p>
                            <p className="text-sm text-muted-foreground">{project.description || "No description"}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
                      <DialogTrigger asChild>
                        <Button 
                          className="bg-honor-gold text-tactical-black hover:bg-honor-gold/90 flex-1"
                          data-testid="button-create-project"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          New Project
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Project</DialogTitle>
                          <DialogDescription>
                            Start a new film production project with integrated AI tools.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="project-title">Project Title</Label>
                            <Input 
                              id="project-title" 
                              placeholder="e.g., My Documentary Film"
                              data-testid="input-project-title"
                            />
                          </div>
                          <div>
                            <Label htmlFor="project-description">Description</Label>
                            <Textarea 
                              id="project-description" 
                              placeholder="Brief description of your project..."
                              data-testid="textarea-project-description"
                            />
                          </div>
                          <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowCreateProject(false)}>
                              Cancel
                            </Button>
                            <Button 
                              className="bg-honor-gold text-tactical-black hover:bg-honor-gold/90"
                              data-testid="button-save-project"
                            >
                              Create Project
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Files */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Archive className="w-5 h-5 text-honor-gold" />
                    Recent Files
                  </CardTitle>
                  <CardDescription>Latest uploaded content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentFiles.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No files uploaded yet. Start by uploading your media!
                      </p>
                    ) : (
                      recentFiles.map((file: UploadedFile) => (
                        <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex-shrink-0">
                            {file.fileType === 'video' && <Film className="w-6 h-6 text-red-500" />}
                            {file.fileType === 'audio' && <Music className="w-6 h-6 text-green-500" />}
                            {file.fileType === 'script' && <FileText className="w-6 h-6 text-blue-500" />}
                            {file.fileType === 'image' && <Camera className="w-6 h-6 text-purple-500" />}
                            {!['video', 'audio', 'script', 'image'].includes(file.fileType) && <Folder className="w-6 h-6 text-gray-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.originalName}</p>
                            <p className="text-sm text-muted-foreground capitalize">{file.fileType}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Operations */}
            {activeOperations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-honor-gold" />
                    Active AI Operations
                  </CardTitle>
                  <CardDescription>Currently processing video content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeOperations.map((operation: any) => (
                      <div key={operation.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{operation.operationType}</span>
                          <Badge variant="secondary">Processing</Badge>
                        </div>
                        <Progress value={operation.progress || 45} className="mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {operation.description || "AI processing in progress..."}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Editor Tab */}
          <TabsContent value="editor" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-command text-2xl font-bold">AI Video Editor</h2>
              {isSuperUser && (
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-honor-gold" />
                  <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold">
                    <Infinity className="w-3 h-3 mr-1" />
                    UNLIMITED
                  </Badge>
                </div>
              )}
            </div>

            {/* Quick AI Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-honor-gold/20 hover:border-honor-gold/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-honor-gold" />
                    Smart Cut
                  </CardTitle>
                  <CardDescription>AI-powered video editing and trimming</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-honor-gold text-tactical-black hover:bg-honor-gold/90">
                    Start Smart Cut
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-honor-gold/20 hover:border-honor-gold/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-honor-gold" />
                    Audio Enhance
                  </CardTitle>
                  <CardDescription>Professional audio processing and cleanup</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-honor-gold text-tactical-black hover:bg-honor-gold/90">
                    Enhance Audio
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-honor-gold/20 hover:border-honor-gold/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-honor-gold" />
                    Color Grade
                  </CardTitle>
                  <CardDescription>AI color correction and visual effects</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-honor-gold text-tactical-black hover:bg-honor-gold/90">
                    Apply Effects
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Director Tools Tab */}
          <TabsContent value="director" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-command text-2xl font-bold">Director's Toolkit</h2>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                New Shot List
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-honor-gold/20 hover:border-honor-gold/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-honor-gold" />
                    Shot Lists
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Organize and plan your filming sequences
                  </p>
                  <Button variant="outline" className="w-full">
                    Manage Shots
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-honor-gold/20 hover:border-honor-gold/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-honor-gold" />
                    Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Production calendar and timeline
                  </p>
                  <Button variant="outline" className="w-full">
                    View Schedule
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-honor-gold/20 hover:border-honor-gold/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-honor-gold" />
                    Crew
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage cast and crew information
                  </p>
                  <Button variant="outline" className="w-full">
                    Manage Crew
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-honor-gold/20 hover:border-honor-gold/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-honor-gold" />
                    Budget
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Track expenses and budget allocation
                  </p>
                  <Button variant="outline" className="w-full">
                    View Budget
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-command text-2xl font-bold">File Command Center</h2>
              <Button className="bg-honor-gold text-tactical-black hover:bg-honor-gold/90">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {files.length === 0 ? (
                <Card className="border-dashed col-span-full">
                  <CardContent className="flex flex-col items-center justify-center h-48">
                    <Archive className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No files uploaded yet. Start by uploading your first file!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                files.map((file: UploadedFile) => (
                  <Card key={file.id} className="hover:ring-2 hover:ring-honor-gold/50 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        {file.fileType === 'video' && <Film className="w-8 h-8 text-red-500" />}
                        {file.fileType === 'audio' && <Music className="w-8 h-8 text-green-500" />}
                        {file.fileType === 'script' && <FileText className="w-8 h-8 text-blue-500" />}
                        {file.fileType === 'image' && <Camera className="w-8 h-8 text-purple-500" />}
                        {!['video', 'audio', 'script', 'image'].includes(file.fileType) && <Folder className="w-8 h-8 text-gray-500" />}
                        <Badge variant={file.category === 'final' ? 'default' : 'secondary'}>
                          {file.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm truncate" title={file.originalName}>
                        {file.originalName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Festival Hub Tab */}
          <TabsContent value="festival" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-command text-2xl font-bold">Festival Submission Hub</h2>
              <Dialog open={showCreatePacket} onOpenChange={setShowCreatePacket}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-honor-gold text-tactical-black hover:bg-honor-gold/90"
                    data-testid="button-create-packet"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Create Packet
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Festival Submission Packet</DialogTitle>
                    <DialogDescription>
                      Organize your files into a professional submission package for film festivals.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="packet-title">Packet Title</Label>
                        <Input 
                          id="packet-title" 
                          placeholder="e.g., Sundance 2024 Submission"
                          data-testid="input-packet-title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="festival-name">Festival Name</Label>
                        <Input 
                          id="festival-name" 
                          placeholder="e.g., Sundance Film Festival"
                          data-testid="input-festival-name"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="submission-deadline">Submission Deadline</Label>
                      <Input 
                        id="submission-deadline" 
                        type="date"
                        data-testid="input-deadline"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setShowCreatePacket(false)}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-honor-gold text-tactical-black hover:bg-honor-gold/90"
                        data-testid="button-save-packet"
                      >
                        Create Packet
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packets.length === 0 ? (
                <Card className="border-dashed col-span-full">
                  <CardContent className="flex flex-col items-center justify-center h-48">
                    <Award className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No festival packets created yet. Create your first submission package!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                packets.map((packet: FestivalPacket) => (
                  <Card key={packet.id} className="hover:ring-2 hover:ring-honor-gold/50 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {packet.title}
                        <Badge variant={packet.status === 'ready' ? 'default' : 'secondary'}>
                          {packet.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{packet.festivalName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="w-3 h-3 mr-1" />
                          Export
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Send className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
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
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-2xl p-8 mb-8 border border-yellow-600/30 shadow-2xl">
          {/* Bravo Zulu Branded Header */}
          <div className="absolute top-4 right-4 opacity-20">
            <div className="text-6xl font-bold text-yellow-600/40 tracking-wider transform -rotate-12">
              BZ FILMS
            </div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-yellow-600/30 to-amber-500/30 rounded-2xl ring-4 ring-yellow-600/50 shadow-xl animate-pulse">
                <Film className="w-12 h-12 text-yellow-400" />
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"></div>
                <span className="font-military text-sm tracking-[0.3em] text-yellow-400">BRAVO ZULU FILMS</span>
                <div className="w-8 h-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"></div>
              </div>
              
              <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
                HOLLYWOOD STUDIO WORKSPACE
              </h1>
              
              <p className="font-military text-xl text-slate-300 mb-6 max-w-3xl mx-auto leading-relaxed">
                PROFESSIONAL FILM PRODUCTION SUITE • INDUSTRY-GRADE EDITING • MILITARY PRECISION
              </p>
              
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Badge className="bg-gradient-to-r from-yellow-600 to-amber-600 text-black font-bold px-4 py-2 text-sm">
                  <Award className="w-4 h-4 mr-2" />
                  HOLLYWOOD GRADE
                </Badge>
                
                <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white font-bold px-4 py-2 text-sm">
                  <Target className="w-4 h-4 mr-2" />
                  MILITARY PRECISION
                </Badge>
                
                {isSuperUser && (
                  <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold px-4 py-2 text-sm">
                    <Crown className="w-4 h-4 mr-2" />
                    UNLIMITED ACCESS
                  </Badge>
                )}
                
                <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold px-4 py-2 text-sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI POWERED
                </Badge>
              </div>
            </div>
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
        <Tabs defaultValue="workspace" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gradient-to-r from-slate-900 to-slate-800 border border-yellow-600/30 rounded-xl p-2">
            <TabsTrigger value="workspace" className="font-military data-[state=active]:text-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-amber-500 transition-all duration-300">
              <Film className="w-4 h-4 mr-2" />
              Main Studio
            </TabsTrigger>
            <TabsTrigger value="timeline" className="font-military data-[state=active]:text-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-amber-500 transition-all duration-300">
              <Scissors className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="effects" className="font-military data-[state=active]:text-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-amber-500 transition-all duration-300">
              <Sparkles className="w-4 h-4 mr-2" />
              Effects
            </TabsTrigger>
            <TabsTrigger value="audio" className="font-military data-[state=active]:text-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-amber-500 transition-all duration-300">
              <Volume2 className="w-4 h-4 mr-2" />
              Audio Studio
            </TabsTrigger>
            <TabsTrigger value="render" className="font-military data-[state=active]:text-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-amber-500 transition-all duration-300">
              <Download className="w-4 h-4 mr-2" />
              Export
            </TabsTrigger>
            <TabsTrigger value="settings" className="font-military data-[state=active]:text-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-amber-500 transition-all duration-300">
              <Settings className="w-4 h-4 mr-2" />
              Studio Config
            </TabsTrigger>
          </TabsList>

          {/* Main Studio Workspace */}
          <TabsContent value="workspace" className="space-y-6">
            {/* Professional Video Editor Interface */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[800px]">
              
              {/* Preview Window */}
              <div className="xl:col-span-2 space-y-4">
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-yellow-600/30 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-yellow-400">
                        <Play className="w-5 h-5" />
                        Preview Monitor
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-600/20 text-red-400 border-red-600/50">
                          ● REC
                        </Badge>
                        <span className="font-mono text-yellow-400 text-sm">00:00:00:00</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="bg-black rounded-lg aspect-video flex items-center justify-center border border-yellow-600/20 relative overflow-hidden">
                      {/* Bravo Zulu Watermark */}
                      <div className="absolute top-4 right-4 z-10">
                        <div className="bg-black/80 px-3 py-1 rounded text-yellow-400 text-xs font-bold border border-yellow-600/50">
                          BRAVO ZULU FILMS
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <Film className="w-16 h-16 text-yellow-600/50 mx-auto mb-4" />
                        <p className="text-yellow-600/70 font-military">PREVIEW WINDOW</p>
                        <p className="text-slate-500 text-sm mt-2">Load project to begin editing</p>
                      </div>
                      
                      {/* Professional Overlay Elements */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-black/80 rounded px-3 py-1 text-yellow-400 text-xs font-mono border border-yellow-600/30">
                          4K • 23.976 fps • Rec.709 • 16:9
                        </div>
                      </div>
                    </div>
                    
                    {/* Playback Controls */}
                    <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-slate-800/50 rounded-lg border border-yellow-600/20">
                      <Button size="sm" variant="ghost" className="text-yellow-400 hover:bg-yellow-400/20">
                        <ChevronRight className="w-4 h-4 rotate-180" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-yellow-400 hover:bg-yellow-400/20">
                        <Pause className="w-5 h-5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-yellow-400 hover:bg-yellow-400/20">
                        <Play className="w-5 h-5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-yellow-400 hover:bg-yellow-400/20">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <div className="flex-1 mx-4">
                        <div className="bg-slate-700 h-2 rounded-full relative">
                          <div className="bg-yellow-400 h-2 rounded-full w-1/3"></div>
                        </div>
                      </div>
                      <span className="text-yellow-400 font-mono text-sm">33%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Project Panel */}
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-yellow-600/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-yellow-400">
                      <Archive className="w-5 h-5" />
                      Project Browser
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {allProjects.slice(0, 5).map((project: any) => (
                        <div key={project.id} className="p-3 bg-slate-800/50 rounded border border-yellow-600/20 hover:border-yellow-600/50 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-white text-sm">{project.title}</p>
                              <p className="text-slate-400 text-xs">{project.description || "No description"}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {project.status || 'Active'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      
                      {allProjects.length === 0 && (
                        <div className="text-center py-8">
                          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-500 text-sm">No projects yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Quick Actions */}
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-yellow-600/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-yellow-400">
                      <Zap className="w-5 h-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" className="bg-yellow-600/20 text-yellow-400 border-yellow-600/50 hover:bg-yellow-600/30">
                        <Upload className="w-4 h-4 mr-1" />
                        Import
                      </Button>
                      <Button size="sm" className="bg-blue-600/20 text-blue-400 border-blue-600/50 hover:bg-blue-600/30">
                        <Scissors className="w-4 h-4 mr-1" />
                        Cut
                      </Button>
                      <Button size="sm" className="bg-green-600/20 text-green-400 border-green-600/50 hover:bg-green-600/30">
                        <Palette className="w-4 h-4 mr-1" />
                        Color
                      </Button>
                      <Button size="sm" className="bg-purple-600/20 text-purple-400 border-purple-600/50 hover:bg-purple-600/30">
                        <Volume2 className="w-4 h-4 mr-1" />
                        Audio
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Tools Panel */}
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-yellow-600/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-yellow-400">
                      <Wand2 className="w-5 h-5" />
                      Professional Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-800/50 rounded border border-yellow-600/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Crown className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-medium text-white">AI Director</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">Automated editing decisions</p>
                        <Button size="sm" className="w-full bg-yellow-600 text-black hover:bg-yellow-500">
                          Activate AI
                        </Button>
                      </div>
                      
                      <div className="p-3 bg-slate-800/50 rounded border border-blue-600/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-medium text-white">Smart Effects</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">Auto-apply professional effects</p>
                        <Button size="sm" variant="outline" className="w-full border-blue-600/50 text-blue-400">
                          Browse Effects
                        </Button>
                      </div>
                      
                      <div className="p-3 bg-slate-800/50 rounded border border-green-600/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Music className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-medium text-white">Audio Suite</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">Professional audio mixing</p>
                        <Button size="sm" variant="outline" className="w-full border-green-600/50 text-green-400">
                          Open Mixer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Overview Tab - Keep original content */}
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

          {/* Timeline Editor */}
          <TabsContent value="timeline" className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-yellow-600/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <Scissors className="w-5 h-5" />
                    Professional Timeline Editor
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/50">
                      BRAVO ZULU FILMS
                    </Badge>
                    <Button size="sm" className="bg-red-600 text-white hover:bg-red-500">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Remove Branding (500 Credits)
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Timeline Tracks */}
                  <div className="bg-black/50 rounded-lg p-4 border border-yellow-600/20">
                    <div className="space-y-2">
                      {/* Video Track */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 text-xs text-yellow-400 font-mono">VIDEO 1</div>
                        <div className="flex-1 h-12 bg-slate-800 rounded relative border border-yellow-600/30">
                          <div className="absolute inset-1 bg-gradient-to-r from-blue-600/50 to-blue-400/50 rounded w-1/3"></div>
                          <div className="absolute inset-1 bg-gradient-to-r from-green-600/50 to-green-400/50 rounded w-1/4 left-1/3"></div>
                        </div>
                      </div>
                      
                      {/* Audio Track */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 text-xs text-green-400 font-mono">AUDIO 1</div>
                        <div className="flex-1 h-8 bg-slate-800 rounded relative border border-green-600/30">
                          <div className="absolute inset-1 bg-gradient-to-r from-green-600/30 to-green-400/30 rounded w-2/3">
                            <div className="h-full flex items-center justify-center">
                              <div className="w-full h-1 bg-green-400 opacity-50"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Effects Track */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 text-xs text-purple-400 font-mono">FX 1</div>
                        <div className="flex-1 h-6 bg-slate-800 rounded relative border border-purple-600/30">
                          <div className="absolute inset-1 bg-gradient-to-r from-purple-600/30 to-purple-400/30 rounded w-1/6 left-1/4"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Timeline Controls */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 font-mono text-sm">00:00:15:12</span>
                        <div className="w-px h-4 bg-yellow-400"></div>
                        <span className="text-slate-400 font-mono text-sm">01:24:33:08</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="text-yellow-400">
                          <Scissors className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-yellow-400">
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-yellow-400">
                          <Wand2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Export & Render */}
          <TabsContent value="render" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-yellow-600/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <Download className="w-5 h-5" />
                    Export Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-slate-300">Resolution</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="4K (3840x2160)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="8k">8K (7680x4320)</SelectItem>
                          <SelectItem value="4k">4K (3840x2160)</SelectItem>
                          <SelectItem value="1080p">1080p (1920x1080)</SelectItem>
                          <SelectItem value="720p">720p (1280x720)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300">Format</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="MP4 (H.264)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                          <SelectItem value="mov">MOV (ProRes)</SelectItem>
                          <SelectItem value="avi">AVI</SelectItem>
                          <SelectItem value="mkv">MKV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Branding Options */}
                    <div className="p-4 bg-slate-800/50 rounded border border-yellow-600/30">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-yellow-400 font-medium">Bravo Zulu Branding</Label>
                        <Badge className="bg-yellow-600/20 text-yellow-400">INCLUDED</Badge>
                      </div>
                      <p className="text-slate-400 text-xs mb-3">
                        Professional watermark and credits included in export
                      </p>
                      <Button className="w-full bg-red-600 text-white hover:bg-red-500">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Remove Branding (500 Credits)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-yellow-600/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <Zap className="w-5 h-5" />
                    Render Queue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-800/50 rounded border border-green-600/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-green-400 font-medium text-sm">Project_Final_v3.mp4</span>
                        <Badge className="bg-green-600/20 text-green-400">COMPLETE</Badge>
                      </div>
                      <div className="text-xs text-slate-400">4K • 02:34:12 • 2.3 GB</div>
                    </div>
                    
                    <div className="p-3 bg-slate-800/50 rounded border border-yellow-600/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-yellow-400 font-medium text-sm">Trailer_Cut.mp4</span>
                        <Badge className="bg-yellow-600/20 text-yellow-400">RENDERING</Badge>
                      </div>
                      <div className="text-xs text-slate-400 mb-2">1080p • Est. 00:45:00</div>
                      <Progress value={67} className="h-1" />
                    </div>
                    
                    <Button className="w-full bg-yellow-600 text-black hover:bg-yellow-500">
                      <Play className="w-4 h-4 mr-2" />
                      Start New Render
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
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
        
        {/* Bravo Zulu Footer Branding */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 rounded-full border border-yellow-600/30">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span className="font-military text-yellow-400 tracking-wider">POWERED BY BRAVO ZULU FILMS</span>
            <Award className="w-5 h-5 text-yellow-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
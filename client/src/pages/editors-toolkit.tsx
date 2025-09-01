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
import { useToast } from "@/hooks/use-toast";
import { VideoEditProject, AiEditOperation, AudioProcessingJob, VisualEffectsJob } from "@shared/schema";
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
} from "lucide-react";

export default function EditorsToolkit() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Get user's video edit projects
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['/api/video-edit-projects'],
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

  // Create new project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      return apiRequest('POST', '/api/video-edit-projects', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/video-edit-projects'] });
      toast({
        title: "🎬 Project Created",
        description: "New AI editing project ready for production!",
      });
    },
  });

  // AI operation mutations
  const startAiOperationMutation = useMutation({
    mutationFn: async (data: { projectId: string; operationType: string; parameters: any }) => {
      return apiRequest('POST', '/api/ai-edit-operations', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-edit-operations', selectedProject] });
      toast({
        title: "🤖 AI Operation Started",
        description: "Your AI assistant is now working on your video!",
      });
    },
  });

  const handleCreateProject = () => {
    const title = prompt("Enter project title:");
    const description = prompt("Enter project description:");
    if (title) {
      createProjectMutation.mutate({ title, description: description || "" });
    }
  };

  const handleAiOperation = (operationType: string, creditsRequired: number) => {
    if (!selectedProject) {
      toast({
        title: "No Project Selected",
        description: "Please select a project first to use AI tools.",
        variant: "destructive",
      });
      return;
    }

    // Super users get unlimited access
    const superUsers = ['bravozulufilms@gmail.com', 'usmc2532@gmail.com'];
    const isSuperUser = (user as any)?.email && superUsers.includes((user as any).email.toLowerCase());

    if (!isSuperUser && (user as any)?.credits < creditsRequired) {
      toast({
        title: "Insufficient Credits",
        description: `This operation requires ${creditsRequired} credits. Please purchase more credits.`,
        variant: "destructive",
      });
      return;
    }

    startAiOperationMutation.mutate({
      projectId: selectedProject,
      operationType,
      parameters: {},
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Restricted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Please log in to access the Editor's Toolkit.
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
              <Scissors className="w-8 h-8 text-honor-gold" />
            </div>
          </div>
          <h1 className="font-command text-4xl font-bold gradient-medal-gold mb-2">
            🎬 EDITOR'S TOOLKIT
          </h1>
          <p className="font-rajdhani text-xl text-tactical-gray mb-4">
            PREMIUM AI-POWERED VIDEO EDITING COMMAND CENTER
          </p>
          <div className="flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-honor-gold" />
            <Badge variant="secondary" className="bg-honor-gold text-tactical-black font-bold">
              PREMIUM FEATURE
            </Badge>
            <Crown className="w-5 h-5 text-honor-gold" />
          </div>
        </div>

        {/* Credit Status */}
        <Card className="mb-8 border-honor-gold/20 bg-gradient-to-r from-honor-gold/5 to-tactical-black/5">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <Zap className="w-6 h-6 text-honor-gold" />
              <div>
                <p className="font-rajdhani font-bold text-lg">Available Credits</p>
                <p className="text-sm text-muted-foreground">Required for AI operations</p>
              </div>
            </div>
            <div className="text-right">
              {(() => {
                const superUsers = ['bravozulufilms@gmail.com', 'usmc2532@gmail.com'];
                const isSuperUser = (user as any)?.email && superUsers.includes((user as any).email.toLowerCase());
                
                if (isSuperUser) {
                  return (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-5 h-5 text-honor-gold" />
                        <Badge className="bg-honor-gold text-tactical-black font-bold">
                          UNLIMITED ACCESS
                        </Badge>
                      </div>
                      <p className="font-command text-2xl font-bold text-honor-gold">∞</p>
                    </>
                  );
                }
                
                return (
                  <>
                    <p className="font-command text-3xl font-bold text-honor-gold">
                      {(user as any)?.credits || 0}
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">
                      Purchase More
                    </Button>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Main Interface */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-tactical-black/20">
            <TabsTrigger value="projects" className="font-rajdhani data-[state=active]:text-tactical-black data-[state=active]:bg-honor-gold">
              Projects
            </TabsTrigger>
            <TabsTrigger value="ai-edit" className="font-rajdhani data-[state=active]:text-tactical-black data-[state=active]:bg-honor-gold">
              AI Editing
            </TabsTrigger>
            <TabsTrigger value="audio" className="font-rajdhani data-[state=active]:text-tactical-black data-[state=active]:bg-honor-gold">
              Audio AI
            </TabsTrigger>
            <TabsTrigger value="vfx" className="font-rajdhani data-[state=active]:text-tactical-black data-[state=active]:bg-honor-gold">
              Visual FX
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-command text-2xl font-bold">Video Projects</h2>
              <Button 
                onClick={handleCreateProject}
                className="bg-honor-gold text-tactical-black hover:bg-honor-gold/90"
                data-testid="button-create-project"
              >
                <Film className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingProjects ? (
                <Card className="border-dashed">
                  <CardContent className="flex items-center justify-center h-48">
                    <div className="animate-spin w-8 h-8 border-4 border-honor-gold border-t-transparent rounded-full"></div>
                  </CardContent>
                </Card>
              ) : projects.length === 0 ? (
                <Card className="border-dashed col-span-full">
                  <CardContent className="flex flex-col items-center justify-center h-48">
                    <Film className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No projects yet. Create your first AI editing project!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                projects.map((project: VideoEditProject) => (
                  <Card 
                    key={project.id} 
                    className={`cursor-pointer transition-all hover:ring-2 hover:ring-honor-gold/50 ${
                      selectedProject === project.id ? 'ring-2 ring-honor-gold bg-honor-gold/5' : ''
                    }`}
                    onClick={() => setSelectedProject(project.id)}
                    data-testid={`card-project-${project.id}`}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {project.title}
                        <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Credits Used:</span>
                          <span className="font-bold text-honor-gold">{project.creditsCost}</span>
                        </div>
                        {project.duration && (
                          <div className="flex justify-between text-sm">
                            <span>Duration:</span>
                            <span>{Math.floor(project.duration / 60)}:{(project.duration % 60).toString().padStart(2, '0')}</span>
                          </div>
                        )}
                        {project.status === 'processing' && (
                          <Progress value={65} className="w-full" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* AI Editing Tab */}
          <TabsContent value="ai-edit" className="space-y-6">
            {!selectedProject ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-48">
                  <Target className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Select a project to access AI editing tools
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Color Correction */}
                <Card className="border-honor-gold/20 hover:border-honor-gold/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-honor-gold" />
                      Color Correction
                    </CardTitle>
                    <CardDescription>AI-powered color grading and correction</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-muted-foreground">Credits Required:</span>
                      <Badge variant="secondary" className="bg-honor-gold/20 text-honor-gold">50</Badge>
                    </div>
                    <Button 
                      onClick={() => handleAiOperation('color_correction', 50)}
                      className="w-full bg-honor-gold text-tactical-black hover:bg-honor-gold/90"
                      data-testid="button-color-correction"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Apply AI Color Correction
                    </Button>
                  </CardContent>
                </Card>

                {/* Scene Detection */}
                <Card className="border-honor-gold/20 hover:border-honor-gold/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Film className="w-5 h-5 text-honor-gold" />
                      Scene Detection
                    </CardTitle>
                    <CardDescription>Automatically detect and segment scenes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-muted-foreground">Credits Required:</span>
                      <Badge variant="secondary" className="bg-honor-gold/20 text-honor-gold">30</Badge>
                    </div>
                    <Button 
                      onClick={() => handleAiOperation('scene_detection', 30)}
                      className="w-full bg-honor-gold text-tactical-black hover:bg-honor-gold/90"
                      data-testid="button-scene-detection"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Detect Scenes
                    </Button>
                  </CardContent>
                </Card>

                {/* Transition Generation */}
                <Card className="border-honor-gold/20 hover:border-honor-gold/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChevronRight className="w-5 h-5 text-honor-gold" />
                      Smart Transitions
                    </CardTitle>
                    <CardDescription>AI-generated professional transitions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-muted-foreground">Credits Required:</span>
                      <Badge variant="secondary" className="bg-honor-gold/20 text-honor-gold">40</Badge>
                    </div>
                    <Button 
                      onClick={() => handleAiOperation('transition_generation', 40)}
                      className="w-full bg-honor-gold text-tactical-black hover:bg-honor-gold/90"
                      data-testid="button-transitions"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Transitions
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Audio AI Tab */}
          <TabsContent value="audio" className="space-y-6">
            {!selectedProject ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-48">
                  <Volume2 className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Select a project to access audio AI tools
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Noise Reduction */}
                <Card className="border-honor-gold/20 hover:border-honor-gold/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-honor-gold" />
                      Noise Reduction
                    </CardTitle>
                    <CardDescription>Remove background noise and enhance clarity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-muted-foreground">Credits Required:</span>
                      <Badge variant="secondary" className="bg-honor-gold/20 text-honor-gold">25</Badge>
                    </div>
                    <Button 
                      onClick={() => handleAiOperation('noise_reduction', 25)}
                      className="w-full bg-honor-gold text-tactical-black hover:bg-honor-gold/90"
                      data-testid="button-noise-reduction"
                    >
                      <CircuitBoard className="w-4 h-4 mr-2" />
                      Clean Audio
                    </Button>
                  </CardContent>
                </Card>

                {/* Audio Enhancement */}
                <Card className="border-honor-gold/20 hover:border-honor-gold/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Music className="w-5 h-5 text-honor-gold" />
                      Audio Enhancement
                    </CardTitle>
                    <CardDescription>AI-powered audio optimization and EQ</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-muted-foreground">Credits Required:</span>
                      <Badge variant="secondary" className="bg-honor-gold/20 text-honor-gold">35</Badge>
                    </div>
                    <Button 
                      onClick={() => handleAiOperation('audio_enhancement', 35)}
                      className="w-full bg-honor-gold text-tactical-black hover:bg-honor-gold/90"
                      data-testid="button-audio-enhancement"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Enhance Audio
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Visual FX Tab */}
          <TabsContent value="vfx" className="space-y-6">
            {!selectedProject ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-48">
                  <Wand2 className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Select a project to access visual effects tools
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Background Removal */}
                <Card className="border-honor-gold/20 hover:border-honor-gold/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scissors className="w-5 h-5 text-honor-gold" />
                      Background Removal
                    </CardTitle>
                    <CardDescription>AI-powered background replacement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-muted-foreground">Credits Required:</span>
                      <Badge variant="secondary" className="bg-honor-gold/20 text-honor-gold">60</Badge>
                    </div>
                    <Button 
                      onClick={() => handleAiOperation('background_removal', 60)}
                      className="w-full bg-honor-gold text-tactical-black hover:bg-honor-gold/90"
                      data-testid="button-background-removal"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Remove Background
                    </Button>
                  </CardContent>
                </Card>

                {/* Object Tracking */}
                <Card className="border-honor-gold/20 hover:border-honor-gold/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-honor-gold" />
                      Object Tracking
                    </CardTitle>
                    <CardDescription>Track objects through video sequences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-muted-foreground">Credits Required:</span>
                      <Badge variant="secondary" className="bg-honor-gold/20 text-honor-gold">45</Badge>
                    </div>
                    <Button 
                      onClick={() => handleAiOperation('object_tracking', 45)}
                      className="w-full bg-honor-gold text-tactical-black hover:bg-honor-gold/90"
                      data-testid="button-object-tracking"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Track Objects
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Operations Status */}
        {selectedProject && (operations.length > 0 || audioJobs.length > 0 || vfxJobs.length > 0) && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-honor-gold" />
                Operation Status
              </CardTitle>
              <CardDescription>Track your AI processing jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {operations.map((op: AiEditOperation) => (
                  <div key={op.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{op.operationType.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">
                        Credits: {op.creditsUsed} | Status: {op.status}
                      </p>
                    </div>
                    <Badge variant={op.status === 'completed' ? 'default' : 'secondary'}>
                      {op.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
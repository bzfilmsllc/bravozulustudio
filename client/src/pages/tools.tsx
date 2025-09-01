import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { ScriptEditor } from "@/components/script-editor";
import { ProjectManager } from "@/components/project-manager";
import { FestivalTracker } from "@/components/festival-tracker";
import { DesignStudio } from "@/components/design-studio";
import { AIScriptGenerator } from "@/components/ai-script-generator";
import { BannerAd, InlineAd } from "@/components/google-ads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Edit,
  Palette,
  Trophy,
  ListTodo,
  WandSparkles,
  BarChart3,
  Sparkles,
  Wand2,
  Target,
  Settings,
  Download,
  Upload,
  Share,
  Clock,
} from "lucide-react";

export default function Tools() {
  const [activeTab, setActiveTab] = useState("scripts");

  const tools = [
    {
      id: "scripts",
      name: "Script Editor",
      icon: Edit,
      description: "AI-powered script writing with professional formatting",
      features: ["Rich text editing", "AI writing assistance", "Format validation", "Festival scoring"],
    },
    {
      id: "design",
      name: "Design Studio",
      icon: Palette,
      description: "Create logos, posters, and marketing materials",
      features: ["Logo generator", "Poster templates", "Brand guidelines", "Asset library"],
    },
    {
      id: "festival",
      name: "Festival Tracker",
      icon: Trophy,
      description: "Track submissions to film festivals and competitions",
      features: ["Submission tracking", "Deadline management", "Status updates", "Progress analytics"],
    },
    {
      id: "projects",
      name: "Project Manager",
      icon: ListTodo,
      description: "Comprehensive project management and collaboration",
      features: ["Timeline tracking", "Team collaboration", "Resource management", "Progress reports"],
    },
    {
      id: "creative",
      name: "Creative Suite",
      icon: WandSparkles,
      description: "Video editing and post-production tools",
      features: ["Video editing", "Audio mixing", "Color grading", "Effects library"],
    },
    {
      id: "analytics",
      name: "Analytics Dashboard",
      icon: BarChart3,
      description: "Track performance and engagement metrics",
      features: ["Performance metrics", "Audience insights", "Revenue tracking", "Growth analysis"],
    },
    {
      id: "ai-generator",
      name: "AI Script Generator",
      icon: Sparkles,
      description: "Advanced AI-powered script generation and enhancement",
      features: ["Script generation", "Script enhancement", "Script analysis", "Character development"],
    },
  ];

  const aiFeatures = [
    {
      name: "Character Development",
      description: "Generate compelling character backgrounds and arcs",
      icon: Sparkles,
    },
    {
      name: "Dialogue Enhancement",
      description: "Improve dialogue flow and authenticity",
      icon: Wand2,
    },
    {
      name: "Plot Structure",
      description: "Optimize story structure and pacing",
      icon: Target,
    },
    {
      name: "Genre Analysis",
      description: "Ensure genre conventions are met",
      icon: BarChart3,
    },
  ];

  return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Banner Ad */}
            <BannerAd className="mb-6" />
            
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-serif font-bold mb-2">Professional Studio Tools</h1>
                  <p className="text-xl text-muted-foreground">
                    Industry-grade creative tools designed for professional filmmakers
                  </p>
                </div>
                <Badge variant="default" className="text-sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Verified Access
                </Badge>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              {/* Tool Navigation */}
              <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto p-1">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <TabsTrigger
                      key={tool.id}
                      value={tool.id}
                      className="flex flex-col items-center space-y-2 p-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      data-testid={`tab-${tool.id}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{tool.name}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Script Editor */}
              <TabsContent value="scripts" className="space-y-6">
                <ScriptEditor />
              </TabsContent>

              {/* Design Studio */}
              <TabsContent value="design" className="space-y-6">
                <DesignStudio />
              </TabsContent>

              {/* Festival Tracker */}
              <TabsContent value="festival" className="space-y-6">
                <FestivalTracker />
              </TabsContent>

              {/* Project Manager */}
              <TabsContent value="projects" className="space-y-6">
                <ProjectManager />
              </TabsContent>

              {/* Creative Suite */}
              <TabsContent value="creative" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <WandSparkles className="w-6 h-6 text-primary mr-3" />
                      Creative Suite
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <WandSparkles className="w-24 h-24 text-primary mx-auto mb-6" />
                      <h3 className="text-2xl font-semibold mb-4">Launch Creative Suite</h3>
                      <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Access the full Creative Suite with video editing, sound design, and post-production tools 
                        for complete creative workflow management.
                      </p>
                      <Button onClick={() => window.location.href = '/creative-suite'} data-testid="button-launch-creative">
                        <WandSparkles className="w-4 h-4 mr-2" />
                        Launch Creative Suite
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI Script Generator */}
              <TabsContent value="ai-generator" className="space-y-6">
                <AIScriptGenerator />
              </TabsContent>

              {/* Analytics */}
              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-6 h-6 text-primary mr-3" />
                      Analytics Dashboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <BarChart3 className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
                      <h3 className="text-2xl font-semibold mb-4">Analytics Dashboard Coming Soon</h3>
                      <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Comprehensive analytics and insights for your scripts, projects, and community engagement 
                        are being developed.
                      </p>
                      <Button variant="outline" onClick={() => alert("We'll notify you when Analytics Dashboard is available!")} data-testid="button-notify-analytics">
                        <Clock className="w-4 h-4 mr-2" />
                        Notify When Available
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Inline Ad */}
            <InlineAd className="mt-12" />
            
            {/* Tool Features Overview */}
            <div className="mt-12">
              <h2 className="text-2xl font-serif font-bold mb-6">Available Features</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = tool.id === "scripts" || tool.id === "projects" || tool.id === "festival" || tool.id === "design" || tool.id === "ai-generator"; // Active tools
                  
                  return (
                    <Card 
                      key={tool.id} 
                      className={`hover:border-primary/50 transition-all duration-300 ${!isActive ? "opacity-60" : ""}`}
                      data-testid={`tool-card-${tool.id}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon className="text-primary text-xl" />
                          </div>
                          {isActive ? (
                            <Badge variant="default">Available</Badge>
                          ) : (
                            <Badge variant="secondary">Coming Soon</Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{tool.name}</h3>
                        <p className="text-muted-foreground mb-4">{tool.description}</p>
                        <div className="space-y-2">
                          {tool.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                        {isActive && (
                          <Button 
                            className="w-full mt-4" 
                            onClick={() => setActiveTab(tool.id)}
                            data-testid={`button-open-${tool.id}`}
                          >
                            Open {tool.name}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
  );
}

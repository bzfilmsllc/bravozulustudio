import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { MemberGuard } from "@/components/member-guard";
import { ScriptEditor } from "@/components/script-editor";
import { ProjectManager } from "@/components/project-manager";
import { FestivalTracker } from "@/components/festival-tracker";
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
    <MemberGuard requiredRole="verified">
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Palette className="w-6 h-6 text-primary mr-3" />
                      Design Studio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Card className="hover:border-primary/50 transition-all duration-300" data-testid="card-logo-generator">
                        <CardContent className="p-6 text-center">
                          <Palette className="w-12 h-12 text-primary mx-auto mb-4" />
                          <h3 className="font-semibold mb-2">Logo Generator</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            AI-powered logo creation for your productions
                          </p>
                          <Button className="w-full" data-testid="button-logo-generator">
                            Generate Logo
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="hover:border-primary/50 transition-all duration-300" data-testid="card-poster-designer">
                        <CardContent className="p-6 text-center">
                          <WandSparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                          <h3 className="font-semibold mb-2">Poster Designer</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Professional movie poster templates and tools
                          </p>
                          <Button className="w-full" data-testid="button-poster-designer">
                            Design Poster
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="hover:border-primary/50 transition-all duration-300" data-testid="card-asset-library">
                        <CardContent className="p-6 text-center">
                          <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
                          <h3 className="font-semibold mb-2">Asset Library</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Store and organize your creative assets
                          </p>
                          <Button className="w-full" data-testid="button-asset-library">
                            Manage Assets
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
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
                      <WandSparkles className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
                      <h3 className="text-2xl font-semibold mb-4">Creative Suite Coming Soon</h3>
                      <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Integrated video editing, sound design, and post-production tools are being developed 
                        to provide a complete creative workflow.
                      </p>
                      <Button variant="outline" data-testid="button-notify-creative">
                        <Clock className="w-4 h-4 mr-2" />
                        Notify When Available
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
                      <Button variant="outline" data-testid="button-notify-analytics">
                        <Clock className="w-4 h-4 mr-2" />
                        Notify When Available
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Tool Features Overview */}
            <div className="mt-12">
              <h2 className="text-2xl font-serif font-bold mb-6">Available Features</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = tool.id === "scripts" || tool.id === "projects" || tool.id === "festival"; // Active tools
                  
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
    </MemberGuard>
  );
}

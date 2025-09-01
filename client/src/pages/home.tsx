import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { MemberGuard } from "@/components/member-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { BannerAd, SidebarAd } from "@/components/google-ads";
import {
  Film,
  Edit,
  Users,
  MessageSquare,
  TrendingUp,
  Calendar,
  Clock,
  Star,
  Award,
  Rocket,
  BarChart3,
  Plus,
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  // Fetch user's recent data
  const { data: recentScripts = [] } = useQuery<any[]>({
    queryKey: ["/api/scripts"],
    retry: false,
  });

  const { data: userProjects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects/my"],
    retry: false,
  });

  const { data: conversations = [] } = useQuery<any[]>({
    queryKey: ["/api/messages/conversations"],
    retry: false,
  });

  return (
    <MemberGuard>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Banner Ad */}
            <BannerAd className="mb-6" />
            
            {/* COMMAND BRIEFING - Hero Welcome */}
            <div className="honor-display mb-12 relative">
              <div className="command-console p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="font-command text-5xl mb-4">
                      <span className="gradient-medal-gold">WELCOME BACK</span>
                      {user?.firstName && (
                        <><br /><span className="text-2xl font-tactical text-primary">OPERATOR {user.firstName.toUpperCase()}</span></>
                      )}
                    </h1>
                    <p className="font-tactical text-xl text-muted-foreground">
                      🎯 MISSION STATUS: READY FOR DEPLOYMENT
                    </p>
                    <div className="service-ribbon mt-4"></div>
                  </div>
                  <div className="flex flex-col items-end space-y-3">
                    {/* Honor Status Badge */}
                    {user?.role === "verified" ? (
                      <div className="badge-medal-honor px-4 py-2 rounded-lg">
                        🏅 VERIFIED VETERAN
                      </div>
                    ) : user?.role === "pending" ? (
                      <div className="badge-coast-guard px-4 py-2 rounded-lg">
                        ⏳ VERIFICATION PENDING
                      </div>
                    ) : (
                      <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-tactical">
                        👤 CIVILIAN ACCESS
                      </div>
                    )}
                    
                    {/* Service Branch Honor Badge */}
                    {user?.militaryBranch && (
                      <div className={`px-4 py-2 rounded-lg font-military ${
                        user.militaryBranch === 'army' ? 'badge-army' :
                        user.militaryBranch === 'navy' ? 'badge-navy' :
                        user.militaryBranch === 'air_force' ? 'badge-air-force' :
                        user.militaryBranch === 'marines' ? 'badge-marines' :
                        user.militaryBranch === 'coast_guard' ? 'badge-coast-guard' :
                        user.militaryBranch === 'space_force' ? 'badge-space-force' :
                        'badge-veteran-verified'
                      }`}>
                        {user.militaryBranch.replace("_", " ").toUpperCase()}
                      </div>
                    )}
                    
                    {/* Service Number Dog Tag */}
                    <div className="dog-tag">
                      ID: {user?.id?.slice(-6) || 'XXXX'}
                    </div>
                  </div>
                </div>
              </div>

              {/* TACTICAL OPERATIONS CENTER */}
              <div className="tactical-command-card p-6 mb-8">
                <h2 className="font-command text-xl mb-6 flex items-center">
                  <Award className="w-6 h-6 mr-3 text-primary" />
                  TACTICAL OPERATIONS CENTER
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/tools">
                    <div className="btn-command p-6 text-center h-24 flex flex-col items-center justify-center space-y-2 animate-honor-entry" data-testid="card-quick-script">
                      <Edit className="w-8 h-8" />
                      <span className="text-sm font-military">SCRIPT OPS</span>
                    </div>
                  </Link>

                  <Link href="/community">
                    <div className="btn-command p-6 text-center h-24 flex flex-col items-center justify-center space-y-2 animate-honor-entry" data-testid="card-quick-community">
                      <Users className="w-8 h-8" />
                      <span className="text-sm font-military">UNIT COMM</span>
                    </div>
                  </Link>

                  <div className="btn-command p-6 text-center h-24 flex flex-col items-center justify-center space-y-2 animate-honor-entry cursor-pointer" data-testid="card-quick-project">
                    <Film className="w-8 h-8" />
                    <span className="text-sm font-military">MISSIONS</span>
                  </div>

                  <Link href="/media">
                    <div className="btn-command p-6 text-center h-24 flex flex-col items-center justify-center space-y-2 animate-honor-entry" data-testid="card-quick-media">
                      <TrendingUp className="w-8 h-8" />
                      <span className="text-sm font-military">INTEL HUB</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* SCRIPT OPERATIONS STATUS */}
              <div className="tactical-command-card" data-testid="card-recent-scripts">
                <div className="p-6">
                  <h3 className="font-command text-lg mb-4 flex items-center">
                    <Edit className="w-5 h-5 text-primary mr-2" />
                    SCRIPT OPS
                  </h3>
                  {recentScripts.length === 0 ? (
                    <div className="text-center py-8">
                      <Edit className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No scripts yet</p>
                      <Link href="/tools">
                        <Button size="sm" data-testid="button-create-first-script">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Script
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentScripts.slice(0, 5).map((script: any) => (
                        <div key={script.id} className="border border-border rounded-lg p-3" data-testid={`recent-script-${script.id}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">{script.title}</h4>
                            {script.festivalScore && (
                              <Badge variant="outline" className="text-xs">
                                {script.festivalScore}
                              </Badge>
                            )}
                          </div>
                          {script.genre && (
                            <Badge variant="secondary" className="text-xs mb-2">
                              {script.genre}
                            </Badge>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Updated {new Date(script.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                      <Link href="/tools">
                        <Button variant="outline" size="sm" className="w-full">
                          View All Scripts
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Projects */}
              <Card data-testid="card-active-projects">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Film className="w-5 h-5 text-primary mr-2" />
                    My Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userProjects.length === 0 ? (
                    <div className="text-center py-8">
                      <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No projects yet</p>
                      <Button size="sm" data-testid="button-create-project">
                        <Rocket className="w-4 h-4 mr-2" />
                        Start a Project
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userProjects.slice(0, 3).map((project: any) => (
                        <div key={project.id} className="border border-border rounded-lg p-3" data-testid={`project-${project.id}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">{project.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {project.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <Badge variant="secondary" className="text-xs mb-2">
                            {project.type.replace("_", " ")}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            Created {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full">
                        View All Projects
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Community Activity */}
              <Card data-testid="card-community-activity">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 text-primary mr-2" />
                    Community Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">New forum discussion</p>
                        <p className="text-xs text-muted-foreground">Script Review & Feedback</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Project collaboration request</p>
                        <p className="text-xs text-muted-foreground">Documentary seeking editor</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">New member joined</p>
                        <p className="text-xs text-muted-foreground">Air Force veteran</p>
                      </div>
                    </div>
                  </div>
                  <Link href="/community">
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      View Community
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Sidebar Ad */}
              <div className="space-y-6">
                <SidebarAd />
              </div>
            </div>

            {/* Performance Dashboard */}
            <div className="mt-12">
              <h2 className="text-2xl font-serif font-bold mb-6">Your Performance</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <Card data-testid="stat-scripts-written">
                  <CardContent className="p-6 text-center">
                    <Edit className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-primary">{recentScripts.length}</div>
                    <p className="text-sm text-muted-foreground">Scripts Written</p>
                  </CardContent>
                </Card>

                <Card data-testid="stat-projects-active">
                  <CardContent className="p-6 text-center">
                    <Film className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-primary">{userProjects.length}</div>
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                  </CardContent>
                </Card>

                <Card data-testid="stat-community-connections">
                  <CardContent className="p-6 text-center">
                    <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-primary">{conversations.length}</div>
                    <p className="text-sm text-muted-foreground">Connections</p>
                  </CardContent>
                </Card>

                <Card data-testid="stat-festival-score">
                  <CardContent className="p-6 text-center">
                    <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-primary">
                      {recentScripts.find((s: any) => s.festivalScore)?.festivalScore || "N/A"}
                    </div>
                    <p className="text-sm text-muted-foreground">Best Festival Score</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Verification Prompt */}
            {user?.role !== "verified" && (
              <Card className="mt-12 border-primary/20 bg-primary/5" data-testid="verification-prompt">
                <CardContent className="p-8 text-center">
                  <Star className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-4">Unlock Professional Tools</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Complete military verification to access our full suite of professional studio tools, 
                    including AI script writing, project collaboration, and industry networking features.
                  </p>
                  <Link href="/verification">
                    <Button size="lg" data-testid="button-get-verified">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Get Verified Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </MemberGuard>
  );
}

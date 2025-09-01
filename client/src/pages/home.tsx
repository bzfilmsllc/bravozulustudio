import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { MemberGuard } from "@/components/member-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
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
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  // Fetch user's recent data
  const { data: recentScripts = [] } = useQuery({
    queryKey: ["/api/scripts"],
    retry: false,
  });

  const { data: userProjects = [] } = useQuery({
    queryKey: ["/api/projects/my"],
    retry: false,
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/messages/conversations"],
    retry: false,
  });

  return (
    <MemberGuard>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Welcome Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-serif font-bold mb-2">
                    Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    Ready to create something extraordinary today?
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={user?.role === "verified" ? "default" : "secondary"}>
                    {user?.role === "verified" ? "Verified Member" : user?.role === "pending" ? "Pending Verification" : "Public User"}
                  </Badge>
                  {user?.militaryBranch && (
                    <Badge variant="outline">
                      {user.militaryBranch.replace("_", " ").toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/tools">
                  <Card className="hover:border-primary/50 transition-all duration-300 cursor-pointer group" data-testid="card-quick-script">
                    <CardContent className="p-6 text-center">
                      <Edit className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold">New Script</h3>
                      <p className="text-sm text-muted-foreground">Start writing</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/community">
                  <Card className="hover:border-primary/50 transition-all duration-300 cursor-pointer group" data-testid="card-quick-community">
                    <CardContent className="p-6 text-center">
                      <Users className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold">Community</h3>
                      <p className="text-sm text-muted-foreground">Connect & share</p>
                    </CardContent>
                  </Card>
                </Link>

                <Card className="hover:border-primary/50 transition-all duration-300 cursor-pointer group" data-testid="card-quick-project">
                  <CardContent className="p-6 text-center">
                    <Film className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold">New Project</h3>
                    <p className="text-sm text-muted-foreground">Start collaboration</p>
                  </CardContent>
                </Card>

                <Link href="/media">
                  <Card className="hover:border-primary/50 transition-all duration-300 cursor-pointer group" data-testid="card-quick-media">
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold">Media Hub</h3>
                      <p className="text-sm text-muted-foreground">Latest updates</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Recent Scripts */}
              <Card data-testid="card-recent-scripts">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Edit className="w-5 h-5 text-primary mr-2" />
                    Recent Scripts
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

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

import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { MemberGuard } from "@/components/member-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Zap,
  Activity,
  Bell,
  DollarSign,
  Target,
  Shield,
  Cpu,
  Wifi,
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Crown,
  Infinity,
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function Home() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState("OPERATIONAL");

  // Update time every second for real-time display
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const { data: subscriptionStatus } = useQuery({
    queryKey: ["/api/billing/subscription-status"],
    retry: false,
  });

  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    retry: false,
  });

  // Calculate mission progress and achievements
  const missionProgress = Math.min(100, (recentScripts.length * 20) + (userProjects.length * 30));
  const totalCredits = (user as any)?.credits || 0;
  const isSuper = user?.email === "bravozulufilms@gmail.com" || user?.email === "usmc2532@gmail.com";
  const currentHour = currentTime.getHours();
  const timeOfDay = currentHour < 12 ? "MORNING" : currentHour < 17 ? "AFTERNOON" : "EVENING";

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
              <div className="command-console p-4 sm:p-8 mb-8 overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                  <div className="flex-1 min-w-0 lg:pr-4">
                    <div className="flex items-start space-x-4">
                      <div className="h-16 w-1 bg-gradient-to-b from-yellow-600 to-amber-500 flex-shrink-0"></div>
                      <div className="min-w-0 flex-1">
                        <h1 className="font-command text-2xl sm:text-3xl lg:text-4xl mb-3 break-words">
                          <span className="gradient-medal-gold">MISSION COMMAND</span>
                          {user?.firstName && (
                            <><br /><span className="text-lg sm:text-xl font-tactical text-yellow-400">OPERATOR {user.firstName.toUpperCase()}</span></>
                          )}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-tactical text-sm sm:text-lg">
                          <span className="text-slate-300">🎯 STATUS:</span>
                          <span className="text-green-400 font-bold animate-pulse">{systemStatus}</span>
                          <span className="text-slate-400 hidden sm:inline">|</span>
                          <span className="text-yellow-400">{timeOfDay} SHIFT ACTIVE</span>
                          <span className="text-slate-400 hidden sm:inline">|</span>
                          <span className="text-cyan-400">{currentTime.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="service-ribbon mt-4"></div>
                  </div>
                  <div className="flex flex-col items-end space-y-3 flex-shrink-0">
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
                    
                    {/* Credits & Service Number */}
                    <div className="space-y-2">
                      {/* Credit Balance Display */}
                      <div className="px-4 py-2 rounded-lg bg-green-600/20 border border-green-600/50">
                        <div className="flex items-center justify-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          {isSuper ? (
                            <div className="flex items-center gap-1">
                              <Crown className="w-4 h-4 text-honor-gold" />
                              <Infinity className="w-5 h-5 text-honor-gold" />
                              <span className="font-tactical text-honor-gold text-sm">UNLIMITED</span>
                            </div>
                          ) : (
                            <span className="font-tactical text-green-400 text-sm font-bold">{totalCredits} CREDITS</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Service Number Dog Tag */}
                      <div className="dog-tag">
                        ID: {user?.id?.slice(-6) || 'XXXX'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MISSION STATUS DASHBOARD - NEW ENHANCED SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* System Status Panel */}
                <Card className="tactical-command-card border border-green-600/30 bg-green-600/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Activity className="w-4 h-4 text-green-400 mr-2" />
                        <span className="font-command text-green-400">SYSTEM STATUS</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400">ONLINE</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-tactical">AI SYSTEMS</span>
                      </div>
                      <Badge className="bg-green-600/20 text-green-400 text-xs">ACTIVE</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-tactical">DATA STORAGE</span>
                      </div>
                      <Badge className="bg-green-600/20 text-green-400 text-xs">SECURE</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-tactical">NETWORK</span>
                      </div>
                      <Badge className="bg-green-600/20 text-green-400 text-xs">STABLE</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Mission Progress Panel */}
                <Card className="tactical-command-card border border-yellow-600/30 bg-yellow-600/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-sm">
                      <Target className="w-4 h-4 text-yellow-400 mr-2" />
                      <span className="font-command text-yellow-400">MISSION PROGRESS</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-tactical">OPERATIONAL READINESS</span>
                        <span className="text-sm font-bold text-yellow-400">{missionProgress}%</span>
                      </div>
                      <Progress value={missionProgress} className="h-2 bg-slate-800">
                        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full rounded-full transition-all duration-500" 
                             style={{ width: `${missionProgress}%` }} />
                      </Progress>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="text-center p-2 bg-slate-800/50 rounded">
                          <div className="text-lg font-bold text-blue-400">{recentScripts.length}</div>
                          <div className="text-xs text-slate-400">SCRIPTS</div>
                        </div>
                        <div className="text-center p-2 bg-slate-800/50 rounded">
                          <div className="text-lg font-bold text-purple-400">{userProjects.length}</div>
                          <div className="text-xs text-slate-400">PROJECTS</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Activity Feed */}
                <Card className="tactical-command-card border border-purple-600/30 bg-purple-600/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Bell className="w-4 h-4 text-purple-400 mr-2" />
                        <span className="font-command text-purple-400">ACTIVITY FEED</span>
                      </div>
                      <Badge className="bg-purple-600/20 text-purple-400 text-xs">LIVE</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 3).map((notification: any, index: number) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-slate-800/30 rounded text-xs">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 flex-shrink-0"></div>
                            <div>
                              <div className="text-slate-300">{notification.message}</div>
                              <div className="text-slate-500 text-xs">{new Date(notification.createdAt).toLocaleTimeString()}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
                          <div className="text-xs text-slate-400">ALL SYSTEMS NOMINAL</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* TACTICAL OPERATIONS CENTER - Enhanced */}
              <div className="tactical-command-card p-6 mb-8 border-2 border-yellow-600/30">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-command text-xl flex items-center">
                    <Award className="w-6 h-6 mr-3 text-yellow-400" />
                    MISSION CONTROL CENTER
                  </h2>
                  <Badge className="bg-green-600/20 text-green-400 border-green-600/50 font-tactical">
                    🎯 SYSTEMS ONLINE
                  </Badge>
                </div>
                <p className="font-tactical text-sm text-slate-400 mb-6">Choose your operation to begin mission deployment</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/tools">
                    <div className="btn-command p-6 h-32 flex items-center space-x-4 animate-honor-entry hover:scale-[1.02] transition-all border-2 border-transparent hover:border-yellow-500/50" data-testid="card-quick-script">
                      <div className="p-3 bg-yellow-600/20 rounded-lg">
                        <Edit className="w-10 h-10 text-yellow-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-command text-lg text-yellow-400 mb-1">AI SCRIPT STUDIO</h3>
                        <p className="font-tactical text-sm text-slate-300">Generate, enhance & analyze scripts</p>
                        <Badge className="mt-2 text-xs bg-green-600/20 text-green-400">
                          ⚡ AI POWERED
                        </Badge>
                      </div>
                    </div>
                  </Link>

                  <Link href="/community">
                    <div className="btn-command p-6 h-32 flex items-center space-x-4 animate-honor-entry hover:scale-[1.02] transition-all border-2 border-transparent hover:border-purple-500/50" data-testid="card-quick-community">
                      <div className="p-3 bg-purple-600/20 rounded-lg">
                        <Users className="w-10 h-10 text-purple-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-command text-lg text-purple-400 mb-1">BATTLE NETWORK</h3>
                        <p className="font-tactical text-sm text-slate-300">Connect with veterans & filmmakers</p>
                        <Badge className="mt-2 text-xs bg-purple-600/20 text-purple-400">
                          🤝 COMMUNITY
                        </Badge>
                      </div>
                    </div>
                  </Link>

                  <Link href="/portfolio">
                    <div className="btn-command p-6 h-32 flex items-center space-x-4 animate-honor-entry hover:scale-[1.02] transition-all border-2 border-transparent hover:border-blue-500/50" data-testid="card-quick-project">
                      <div className="p-3 bg-blue-600/20 rounded-lg">
                        <Film className="w-10 h-10 text-blue-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-command text-lg text-blue-400 mb-1">PROJECT HQ</h3>
                        <p className="font-tactical text-sm text-slate-300">Manage film productions</p>
                        <Badge className="mt-2 text-xs bg-blue-600/20 text-blue-400">
                          📁 {userProjects.length} ACTIVE
                        </Badge>
                      </div>
                    </div>
                  </Link>

                  <Link href="/billing">
                    <div className="btn-command p-6 h-32 flex items-center space-x-4 animate-honor-entry hover:scale-[1.02] transition-all border-2 border-transparent hover:border-green-500/50" data-testid="card-quick-billing">
                      <div className="p-3 bg-green-600/20 rounded-lg">
                        <TrendingUp className="w-10 h-10 text-green-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-command text-lg text-green-400 mb-1">SUPPLY DEPOT</h3>
                        <p className="font-tactical text-sm text-slate-300">Credits & subscription management</p>
                        <Badge className="mt-2 text-xs bg-green-600/20 text-green-400">
                          💰 RESOURCES
                        </Badge>
                      </div>
                    </div>
                  </Link>
                </div>
                
                {/* Enhanced Quick Actions */}
                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-600/10 to-amber-500/10 border border-yellow-600/30 rounded-lg">
                  <h4 className="font-command text-sm text-yellow-400 mb-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <Rocket className="w-4 h-4 mr-2" />
                      RAPID DEPLOYMENT TOOLS
                    </div>
                    {isSuper && (
                      <Badge className="bg-honor-gold/20 text-honor-gold border-honor-gold/50 text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        ADMIN
                      </Badge>
                    )}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                    <Link href="/tools?action=generate" className="flex items-center space-x-2 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors text-sm border border-yellow-600/20 hover:border-yellow-600/50">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="font-tactical text-slate-300">AI Generate</span>
                    </Link>
                    <Link href="/portfolio?action=new" className="flex items-center space-x-2 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors text-sm border border-blue-600/20 hover:border-blue-600/50">
                      <Plus className="w-4 h-4 text-blue-400" />
                      <span className="font-tactical text-slate-300">New Project</span>
                    </Link>
                    <Link href="/community" className="flex items-center space-x-2 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors text-sm border border-purple-600/20 hover:border-purple-600/50">
                      <MessageSquare className="w-4 h-4 text-purple-400" />
                      <span className="font-tactical text-slate-300">Battle Net</span>
                    </Link>
                    <Link href="/settings" className="flex items-center space-x-2 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors text-sm border border-gray-600/20 hover:border-gray-600/50">
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span className="font-tactical text-slate-300">Settings</span>
                    </Link>
                  </div>
                  
                  {/* Advanced Power User Controls */}
                  {(isSuper || user?.role === "verified") && (
                    <div className="mt-3 pt-3 border-t border-yellow-600/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-3 h-3 text-green-400" />
                        <span className="font-tactical text-xs text-green-400">VERIFIED OPERATOR CONTROLS</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <button className="flex items-center space-x-1 p-2 bg-green-600/20 rounded text-xs hover:bg-green-600/30 transition-colors border border-green-600/30">
                          <BarChart3 className="w-3 h-3 text-green-400" />
                          <span className="font-tactical text-green-400">Analytics</span>
                        </button>
                        <button className="flex items-center space-x-1 p-2 bg-blue-600/20 rounded text-xs hover:bg-blue-600/30 transition-colors border border-blue-600/30">
                          <Calendar className="w-3 h-3 text-blue-400" />
                          <span className="font-tactical text-blue-400">Schedule</span>
                        </button>
                        <button className="flex items-center space-x-1 p-2 bg-purple-600/20 rounded text-xs hover:bg-purple-600/30 transition-colors border border-purple-600/30">
                          <Users className="w-3 h-3 text-purple-400" />
                          <span className="font-tactical text-purple-400">Team Ops</span>
                        </button>
                        {isSuper && (
                          <Link href="/admin" className="flex items-center space-x-1 p-2 bg-red-600/20 rounded text-xs hover:bg-red-600/30 transition-colors border border-red-600/30">
                            <Crown className="w-3 h-3 text-red-400" />
                            <span className="font-tactical text-red-400">Command</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* SCRIPT OPERATIONS STATUS */}
              <div className="tactical-command-card border border-yellow-600/30" data-testid="card-recent-scripts">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-command text-lg flex items-center">
                      <Edit className="w-5 h-5 text-yellow-400 mr-2" />
                      SCRIPT OPERATIONS
                    </h3>
                    <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/50 text-xs">
                      {recentScripts.length} ACTIVE
                    </Badge>
                  </div>
                  {recentScripts.length === 0 ? (
                    <div className="text-center py-8 bg-slate-800/30 rounded-lg border border-dashed border-yellow-600/30">
                      <div className="p-4 bg-yellow-600/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Edit className="w-10 h-10 text-yellow-400" />
                      </div>
                      <h4 className="font-command text-lg text-yellow-400 mb-2">NO SCRIPTS DEPLOYED</h4>
                      <p className="font-tactical text-sm text-slate-400 mb-4">Start your first mission by creating a script</p>
                      <Link href="/tools">
                        <Button className="bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black font-bold" data-testid="button-create-first-script">
                          <Zap className="w-4 h-4 mr-2" />
                          START SCRIPT MISSION
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentScripts.slice(0, 5).map((script: any) => (
                        <div key={script.id} className="border border-slate-700 hover:border-yellow-600/50 rounded-lg p-3 bg-slate-800/30 hover:bg-slate-800/50 transition-all cursor-pointer" data-testid={`recent-script-${script.id}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-tactical font-semibold text-sm text-yellow-400">{script.title}</h4>
                            {script.festivalScore && (
                              <Badge className="bg-green-600/20 text-green-400 border-green-600/50 text-xs">
                                🏆 {script.festivalScore}
                              </Badge>
                            )}
                          </div>
                          {script.genre && (
                            <Badge variant="secondary" className="text-xs mb-2 bg-slate-700/50 text-slate-300">
                              {script.genre}
                            </Badge>
                          )}
                          <p className="text-xs text-slate-400 font-tactical">
                            LAST UPDATE: {new Date(script.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                      <Link href="/tools">
                        <Button variant="outline" size="sm" className="w-full border-yellow-600/50 hover:bg-yellow-600/10 font-tactical">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          VIEW ALL SCRIPT OPERATIONS
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Projects */}
              <Card className="tactical-command-card border border-blue-600/30" data-testid="card-active-projects">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Film className="w-5 h-5 text-blue-400 mr-2" />
                      <span className="font-command text-blue-400">PROJECT MISSIONS</span>
                    </div>
                    <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/50 text-xs">
                      {userProjects.length} ACTIVE
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userProjects.length === 0 ? (
                    <div className="text-center py-8 bg-slate-800/30 rounded-lg border border-dashed border-blue-600/30">
                      <div className="p-4 bg-blue-600/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Film className="w-10 h-10 text-blue-400" />
                      </div>
                      <h4 className="font-command text-lg text-blue-400 mb-2">NO ACTIVE MISSIONS</h4>
                      <p className="font-tactical text-sm text-slate-400 mb-4">Deploy your first film production project</p>
                      <Link href="/portfolio">
                        <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold" data-testid="button-create-project">
                          <Rocket className="w-4 h-4 mr-2" />
                          LAUNCH PROJECT
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userProjects.slice(0, 3).map((project: any) => (
                        <div key={project.id} className="border border-slate-700 hover:border-blue-600/50 rounded-lg p-3 bg-slate-800/30 hover:bg-slate-800/50 transition-all cursor-pointer" data-testid={`project-${project.id}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-tactical font-semibold text-sm text-blue-400">{project.title}</h4>
                            <Badge className={`text-xs ${
                              project.status === 'active' ? 'bg-green-600/20 text-green-400 border-green-600/50' :
                              project.status === 'planning' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-600/50' :
                              'bg-slate-600/20 text-slate-400 border-slate-600/50'
                            }`}>
                              {project.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </div>
                          <Badge variant="secondary" className="text-xs mb-2 bg-slate-700/50 text-slate-300">
                            {project.type.replace("_", " ").toUpperCase()}
                          </Badge>
                          <p className="text-xs text-slate-400 font-tactical">
                            DEPLOYED: {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                      <Link href="/portfolio">
                        <Button variant="outline" size="sm" className="w-full border-blue-600/50 hover:bg-blue-600/10 font-tactical">
                          <Film className="w-4 h-4 mr-2" />
                          VIEW ALL MISSIONS
                        </Button>
                      </Link>
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

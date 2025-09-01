import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import bravoZuluLogo from "@/assets/bravo-zulu-logo.jpg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Film,
  Rocket,
  Play,
  Edit,
  Palette,
  Trophy,
  ListTodo,
  WandSparkles,
  HandHelping,
  Shield,
  Users,
  Lock,
  UserPlus,
  CheckCircle,
  Star,
  Youtube,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Phone,
  Mail,
  MapPin,
  Rss,
  Flag,
  ShieldQuestion,
  Bot,
  Menu,
  X,
  Plus,
} from "lucide-react";

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleJoinStudio = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Military-Style Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-primary/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* Enhanced Logo with Military Styling */}
            <div className="flex items-center space-x-4" data-testid="logo">
              <div className="relative">
                <img 
                  src={bravoZuluLogo} 
                  alt="Bravo Zulu Films" 
                  className="w-12 h-12 object-contain drop-shadow-lg"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground font-military gradient-gold">Bravo Zulu Films</h1>
                <p className="text-xs text-primary font-military tracking-wider">Honor • Excellence • Service</p>
              </div>
            </div>

            {/* Military-Style Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-foreground hover:text-primary transition-all duration-300 font-military text-sm tracking-wide border-b-2 border-transparent hover:border-primary pb-1" data-testid="nav-home">
                <Flag className="w-4 h-4 inline mr-1" />HOME
              </a>
              <a href="#tools" className="text-muted-foreground hover:text-primary transition-all duration-300 font-military text-sm tracking-wide border-b-2 border-transparent hover:border-primary pb-1" data-testid="nav-tools">
                <Shield className="w-4 h-4 inline mr-1" />ARSENAL
              </a>
              <a href="#community" className="text-muted-foreground hover:text-primary transition-all duration-300 font-military text-sm tracking-wide border-b-2 border-transparent hover:border-primary pb-1" data-testid="nav-community">
                <Users className="w-4 h-4 inline mr-1" />BATTALION
              </a>
              <a href="#media" className="text-muted-foreground hover:text-primary transition-all duration-300 font-military text-sm tracking-wide border-b-2 border-transparent hover:border-primary pb-1" data-testid="nav-media">
                <Star className="w-4 h-4 inline mr-1" />GALLERY
              </a>
              <div className="flex items-center space-x-3 ml-6">
                <Button
                  variant="outline"
                  onClick={handleLogin}
                  className="font-military tracking-wide border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300"
                  data-testid="button-signin"
                >
                  <Lock className="w-4 h-4 mr-2" />SIGN IN
                </Button>
                <Button
                  onClick={handleJoinStudio}
                  className="bg-gradient-to-r from-primary to-yellow-400 hover:from-yellow-400 hover:to-primary text-background font-military tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  data-testid="button-join-studio"
                >
                  <UserPlus className="w-4 h-4 mr-2" />ENLIST NOW
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <a href="#home" className="block px-3 py-2 text-foreground hover:text-primary">Home</a>
                <a href="#tools" className="block px-3 py-2 text-muted-foreground hover:text-primary">Studio Tools</a>
                <a href="#community" className="block px-3 py-2 text-muted-foreground hover:text-primary">Community</a>
                <a href="#media" className="block px-3 py-2 text-muted-foreground hover:text-primary">Media</a>
                <div className="px-3 py-2 space-y-2">
                  <Button variant="outline" onClick={handleLogin} className="w-full">
                    Sign In
                  </Button>
                  <Button onClick={handleJoinStudio} className="w-full">
                    Join Studio
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Military Honor Hero Section */}
      <section id="home" className="pt-18 relative overflow-hidden min-h-screen flex items-center">
        {/* Patriotic Background with Military Textures */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-slate-900 to-background">
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 via-background/90 to-blue-900/10"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-repeat opacity-30" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>
          </div>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-white to-blue-600 opacity-20"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Honor Badge Logo */}
            <div className="mb-12 relative">
              <div className="absolute inset-0 animate-pulse">
                <div className="w-40 h-40 md:w-56 md:h-56 mx-auto bg-gradient-to-r from-primary/20 to-yellow-400/20 rounded-full blur-3xl"></div>
              </div>
              <div className="relative">
                <img 
                  src={bravoZuluLogo} 
                  alt="Bravo Zulu Films" 
                  className="w-36 h-36 md:w-52 md:h-52 object-contain mx-auto drop-shadow-2xl animate-fade-in-up"
                />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-primary to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="w-4 h-4 text-background" />
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <Badge className="badge-verified px-4 py-2 text-base font-military mb-4" data-testid="badge-studio-type">
                <Shield className="w-5 h-5 mr-2" />
                ELITE MILITARY FILM STUDIO
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold mb-8 leading-tight">
              <span className="block gradient-gold text-shadow-lg">
                HONOR
              </span>
              <span className="block text-3xl md:text-5xl lg:text-6xl text-foreground font-military tracking-widest">
                THROUGH CINEMA
              </span>
              <span className="block text-2xl md:text-4xl lg:text-5xl text-primary/90 font-military mt-2">
                BY VETERANS, FOR VETERANS
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-16 leading-relaxed font-medium">
              Elite film production arsenal designed for military veterans. Professional tools, AI-powered assistance, and a brotherhood of creators honoring service through storytelling.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              <Button 
                size="lg" 
                className="px-12 py-6 text-lg bg-gradient-to-r from-primary to-yellow-400 hover:from-yellow-400 hover:to-primary text-background font-military tracking-wide shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border-2 border-primary/50" 
                onClick={handleJoinStudio}
                data-testid="button-start-creating"
              >
                <Rocket className="w-6 h-6 mr-3" />
                DEPLOY TO STUDIO
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-12 py-6 text-lg border-2 border-primary/50 hover:border-primary hover:bg-primary/10 text-primary font-military tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                data-testid="button-watch-demo"
              >
                <Play className="w-6 h-6 mr-3" />
                MISSION BRIEFING
              </Button>
            </div>

            {/* Military Achievement Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="military-card p-6 text-center hover:scale-105 transition-all duration-300" data-testid="stat-veterans">
                <div className="text-4xl md:text-5xl font-bold gradient-gold mb-3 font-military">500+</div>
                <div className="text-sm text-muted-foreground font-military tracking-wide uppercase">Veteran Creators</div>
                <div className="mt-2 flex justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="military-card p-6 text-center hover:scale-105 transition-all duration-300" data-testid="stat-scripts">
                <div className="text-4xl md:text-5xl font-bold gradient-gold mb-3 font-military">1,200+</div>
                <div className="text-sm text-muted-foreground font-military tracking-wide uppercase">Scripts Written</div>
                <div className="mt-2 flex justify-center">
                  <Edit className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="military-card p-6 text-center hover:scale-105 transition-all duration-300" data-testid="stat-films">
                <div className="text-4xl md:text-5xl font-bold gradient-gold mb-3 font-military">150+</div>
                <div className="text-sm text-muted-foreground font-military tracking-wide uppercase">Films Produced</div>
                <div className="mt-2 flex justify-center">
                  <Film className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="military-card p-6 text-center hover:scale-105 transition-all duration-300" data-testid="stat-awards">
                <div className="text-4xl md:text-5xl font-bold gradient-gold mb-3 font-military">50+</div>
                <div className="text-sm text-muted-foreground font-military tracking-wide uppercase">Festival Awards</div>
                <div className="mt-2 flex justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Military Arsenal Section */}
      <section id="tools" className="py-24 bg-gradient-to-b from-slate-900/30 to-background relative">
        {/* Military Grid Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.1" fill-rule="evenodd"%3E%3Cpath d="M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20zM0 20c0-11.046 8.954-20 20-20v40c-11.046 0-20-8.954-20-20z"/%3E%3C/g%3E%3C/svg%3E")'}}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-yellow-400 rounded-full mb-6">
              <Shield className="w-8 h-8 text-background" />
            </div>
            <h2 className="text-5xl md:text-6xl font-heading font-bold mb-6 gradient-gold">TACTICAL ARSENAL</h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto font-medium">
              Elite-grade creative weapons designed for professional filmmakers. Military precision meets artistic excellence.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-yellow-400 rounded-full"></div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* AI Script Editor */}
            <Card className="military-card group hover:scale-105 transition-all duration-500 border-2 border-primary/20 hover:border-primary/60" data-testid="card-script-editor">
              <CardContent className="p-8 relative">
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-primary to-yellow-400 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-background" />
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-yellow-400/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-r group-hover:from-primary/30 group-hover:to-yellow-400/30 transition-all duration-300">
                  <Edit className="text-primary text-2xl" />
                </div>
                <h3 className="text-2xl font-military font-bold mb-4 gradient-gold tracking-wide">AI SCRIPT COMMAND</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">Advanced battlefield text editor with AI-powered writing assistance and collaborative editing for elite screenwriting operations.</p>
                <div className="flex items-center justify-between">
                  <Badge className="badge-verified px-3 py-1 font-military text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    CLASSIFIED ACCESS
                  </Badge>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Graphics Designer */}
            <Card className="military-card group hover:scale-105 transition-all duration-500 border-2 border-primary/20 hover:border-primary/60" data-testid="card-logo-designer">
              <CardContent className="p-8 relative">
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-primary to-yellow-400 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-background" />
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-yellow-400/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-r group-hover:from-primary/30 group-hover:to-yellow-400/30 transition-all duration-300">
                  <Palette className="text-primary text-2xl" />
                </div>
                <h3 className="text-2xl font-military font-bold mb-4 gradient-gold tracking-wide">VISUAL WARFARE</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">AI-powered design arsenal for creating professional insignia, battle-tested posters, and strategic marketing materials.</p>
                <div className="flex items-center justify-between">
                  <Badge className="badge-verified px-3 py-1 font-military text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    CLASSIFIED ACCESS
                  </Badge>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Festival Intelligence */}
            <Card className="military-card group hover:scale-105 transition-all duration-500 border-2 border-primary/20 hover:border-primary/60" data-testid="card-festival-screener">
              <CardContent className="p-8 relative">
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-primary to-yellow-400 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-background" />
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-yellow-400/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-r group-hover:from-primary/30 group-hover:to-yellow-400/30 transition-all duration-300">
                  <Trophy className="text-primary text-2xl" />
                </div>
                <h3 className="text-2xl font-military font-bold mb-4 gradient-gold tracking-wide">RECON INTEL</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">Advanced AI reconnaissance to analyze scripts and evaluate mission readiness for festival deployment.</p>
                <div className="flex items-center justify-between">
                  <Badge className="badge-verified px-3 py-1 font-military text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    CLASSIFIED ACCESS
                  </Badge>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mission Command */}
            <Card className="military-card group hover:scale-105 transition-all duration-500 border-2 border-primary/20 hover:border-primary/60" data-testid="card-project-dashboard">
              <CardContent className="p-8 relative">
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-primary to-yellow-400 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-background" />
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-yellow-400/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-r group-hover:from-primary/30 group-hover:to-yellow-400/30 transition-all duration-300">
                  <ListTodo className="text-primary text-2xl" />
                </div>
                <h3 className="text-2xl font-military font-bold mb-4 gradient-gold tracking-wide">MISSION COMMAND</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">Comprehensive strategic planning with collaboration protocols, tactical timelines, and resource deployment tracking.</p>
                <div className="flex items-center justify-between">
                  <Badge className="badge-verified px-3 py-1 font-military text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    CLASSIFIED ACCESS
                  </Badge>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Combat Suite */}
            <Card className="military-card group hover:scale-105 transition-all duration-500 border-2 border-primary/20 hover:border-primary/60" data-testid="card-creative-suite">
              <CardContent className="p-8 relative">
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-primary to-yellow-400 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-background" />
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-yellow-400/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-r group-hover:from-primary/30 group-hover:to-yellow-400/30 transition-all duration-300">
                  <WandSparkles className="text-primary text-2xl" />
                </div>
                <h3 className="text-2xl font-military font-bold mb-4 gradient-gold tracking-wide">COMBAT SUITE</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">Integrated tactical systems for video combat editing, audio warfare design, and post-production battlefield operations.</p>
                <div className="flex items-center justify-between">
                  <Badge className="badge-verified px-3 py-1 font-military text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    CLASSIFIED ACCESS
                  </Badge>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Brotherhood Support */}
            <Card className="military-card group hover:scale-105 transition-all duration-500 border-2 border-green-500/20 hover:border-green-500/60" data-testid="card-support-app">
              <CardContent className="p-8 relative">
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-400 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-background" />
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-green-500/20 to-green-400/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-r group-hover:from-green-500/30 group-hover:to-green-400/30 transition-all duration-300">
                  <HandHelping className="text-green-500 text-2xl" />
                </div>
                <h3 className="text-2xl font-military font-bold mb-4 text-green-400 tracking-wide">BROTHERHOOD SUPPORT</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">Dedicated brotherhood network connecting veterans with seasoned mentors and elite industry professionals.</p>
                <div className="flex items-center justify-between">
                  <Badge className="bg-gradient-to-r from-green-500 to-green-400 text-background px-3 py-1 font-military text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    OPEN ACCESS
                  </Badge>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Demo Interface Preview */}
          <Card data-testid="demo-interface">
            <CardContent className="p-8">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Film className="text-primary mr-3" />
                  Professional Video Editing Workspace
                </h3>
              </div>
              <div className="bg-background rounded-lg p-6 border border-border">
                <div className="grid grid-cols-12 gap-4 h-96">
                  {/* Timeline */}
                  <div className="col-span-12 h-20 bg-secondary rounded border border-border flex items-center px-4">
                    <div className="flex space-x-2 items-center">
                      <div className="w-3 h-8 bg-primary rounded"></div>
                      <div className="w-24 h-8 bg-muted rounded"></div>
                      <div className="w-16 h-8 bg-accent/20 rounded"></div>
                      <div className="w-32 h-8 bg-muted rounded"></div>
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground">00:02:34 / 00:15:42</div>
                  </div>
                  
                  {/* Preview Window */}
                  <div className="col-span-8 bg-secondary rounded border border-border flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-muted-foreground mb-4 mx-auto" />
                      <p className="text-muted-foreground">Preview Window</p>
                    </div>
                  </div>
                  
                  {/* Tools Panel */}
                  <div className="col-span-4 bg-secondary rounded border border-border p-4">
                    <h4 className="text-sm font-semibold mb-4">Tools & Effects</h4>
                    <div className="space-y-2">
                      <div className="p-2 bg-muted rounded text-xs flex items-center">
                        <Edit className="w-3 h-3 mr-2" />
                        Trim & Split
                      </div>
                      <div className="p-2 bg-muted rounded text-xs flex items-center">
                        <Palette className="w-3 h-3 mr-2" />
                        Color Grading
                      </div>
                      <div className="p-2 bg-muted rounded text-xs flex items-center">
                        <Users className="w-3 h-3 mr-2" />
                        Audio Mix
                      </div>
                      <div className="p-2 bg-primary/20 rounded text-xs flex items-center text-primary">
                        <Bot className="w-3 h-3 mr-2" />
                        AI Enhancement
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Military Brotherhood Section */}
      <section className="py-24 bg-gradient-to-r from-slate-900/20 via-background to-slate-900/20 relative">
        {/* Honor stripe */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-white to-blue-600"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-yellow-400 rounded-full mb-8">
                <Users className="w-8 h-8 text-background" />
              </div>
              <h2 className="text-5xl md:text-6xl font-heading font-bold mb-8 gradient-gold">ELITE BROTHERHOOD</h2>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed font-medium">
                Join an elite network of decorated veterans, battle-tested filmmakers, and creative warriors who understand the unique mission of transitioning from military service to cinematic excellence.
              </p>
              
              <div className="mb-8">
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-yellow-400 rounded-full mb-4"></div>
                <p className="text-lg text-muted-foreground italic">
                  "From the battlefield to the silver screen, we honor our oath to excellence."
                </p>
              </div>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="text-primary w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Military Verification</h3>
                    <p className="text-muted-foreground">Secure verification process confirming military connection and service history.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="text-primary w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Professional Networking</h3>
                    <p className="text-muted-foreground">Connect with fellow veterans, send friend requests, and build lasting professional relationships.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Lock className="text-primary w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Secure Collaboration</h3>
                    <p className="text-muted-foreground">Private messaging, project sharing, and collaboration tools with advanced security measures.</p>
                  </div>
                </div>
              </div>
              
              <Button size="lg" onClick={handleJoinStudio} data-testid="button-apply-membership">
                <UserPlus className="w-5 h-5 mr-2" />
                Apply for Membership
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                    <Users className="w-16 h-16 text-muted-foreground" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-4">Membership Benefits</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-primary w-4 h-4" />
                    <span>Full access to professional studio tools</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-primary w-4 h-4" />
                    <span>AI-powered script writing assistance</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-primary w-4 h-4" />
                    <span>Festival submission guidance</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-primary w-4 h-4" />
                    <span>Private community forums</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-primary w-4 h-4" />
                    <span>Industry mentorship program</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-primary w-4 h-4" />
                    <span>Project collaboration tools</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Community & Social Features */}
      <section id="community" className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4">Veteran Creator Community</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Connect, collaborate, and create with fellow military veterans in a supportive and professional environment.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Community Forums */}
            <Card data-testid="card-community-forums">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Users className="text-primary mr-3" />
                  Community Forums
                </h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold text-sm">Script Review & Feedback</h4>
                    <p className="text-xs text-muted-foreground">142 discussions</p>
                  </div>
                  <div className="border-l-4 border-muted-foreground pl-4">
                    <h4 className="font-semibold text-sm">Equipment & Tech</h4>
                    <p className="text-xs text-muted-foreground">89 discussions</p>
                  </div>
                  <div className="border-l-4 border-muted-foreground pl-4">
                    <h4 className="font-semibold text-sm">Industry Opportunities</h4>
                    <p className="text-xs text-muted-foreground">67 discussions</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Forums
                </Button>
              </CardContent>
            </Card>

            {/* Member Directory */}
            <Card data-testid="card-member-directory">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Users className="text-primary mr-3" />
                  Member Directory
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Users className="text-primary w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">Director</h4>
                      <p className="text-xs text-muted-foreground">Army Veteran</p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Users className="text-primary w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">Producer</h4>
                      <p className="text-xs text-muted-foreground">Navy Veteran</p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Users className="text-primary w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">Cinematographer</h4>
                      <p className="text-xs text-muted-foreground">Marine</p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Browse Members
                </Button>
              </CardContent>
            </Card>

            {/* Project Collaborations */}
            <Card data-testid="card-active-projects">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <HandHelping className="text-primary mr-3" />
                  Active Projects
                </h3>
                <div className="space-y-4">
                  <Card className="p-3">
                    <h4 className="font-semibold text-sm mb-1">Documentary Project</h4>
                    <p className="text-xs text-muted-foreground mb-2">Documentary • Seeking Editor</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary">4 members</span>
                      <Button size="sm" variant="ghost" className="text-xs">
                        Join
                      </Button>
                    </div>
                  </Card>
                  <Card className="p-3">
                    <h4 className="font-semibold text-sm mb-1">Short Film Project</h4>
                    <p className="text-xs text-muted-foreground mb-2">Short Film • Pre-production</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary">7 members</span>
                      <Button size="sm" variant="ghost" className="text-xs">
                        Join
                      </Button>
                    </div>
                  </Card>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Projects
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Security Features */}
          <Card data-testid="security-features">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold mb-6 text-center">Security & Moderation</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Bot className="text-primary text-2xl" />
                  </div>
                  <h4 className="font-semibold mb-2">Anti-Spam Protection</h4>
                  <p className="text-sm text-muted-foreground">Advanced AI detection and CAPTCHA verification prevent spam and bot activity.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Flag className="text-primary text-2xl" />
                  </div>
                  <h4 className="font-semibold mb-2">Community Reporting</h4>
                  <p className="text-sm text-muted-foreground">Easy reporting system with dedicated moderation team for maintaining community standards.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <ShieldQuestion className="text-primary text-2xl" />
                  </div>
                  <h4 className="font-semibold mb-2">Privacy Controls</h4>
                  <p className="text-sm text-muted-foreground">Granular privacy settings and encrypted communications protect member information.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Media & Social Integration */}
      <section id="media" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4">Media & Social Hub</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stay connected with our latest projects, industry news, and community achievements across all social platforms.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            <div>
              <div className="w-full h-auto rounded-xl shadow-2xl bg-muted flex items-center justify-center p-8">
                <Film className="w-24 h-24 text-muted-foreground" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-serif font-bold mb-6">Connected Everywhere</h3>
              <p className="text-lg text-muted-foreground mb-8">
                Follow our journey and connect with the Bravo Zulu Films community across all major social media platforms.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <a href="#" className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:border-primary/50 transition-all duration-300 group" data-testid="link-youtube">
                  <Youtube className="text-red-500 text-2xl group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="font-semibold">YouTube</h4>
                    <p className="text-sm text-muted-foreground">Film showcases & tutorials</p>
                  </div>
                </a>
                
                <a href="#" className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:border-primary/50 transition-all duration-300 group" data-testid="link-instagram">
                  <Instagram className="text-pink-500 text-2xl group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="font-semibold">Instagram</h4>
                    <p className="text-sm text-muted-foreground">Behind the scenes</p>
                  </div>
                </a>
                
                <a href="#" className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:border-primary/50 transition-all duration-300 group" data-testid="link-twitter">
                  <Twitter className="text-blue-400 text-2xl group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="font-semibold">Twitter</h4>
                    <p className="text-sm text-muted-foreground">Industry updates</p>
                  </div>
                </a>
                
                <a href="#" className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:border-primary/50 transition-all duration-300 group" data-testid="link-linkedin">
                  <Linkedin className="text-blue-600 text-2xl group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="font-semibold">LinkedIn</h4>
                    <p className="text-sm text-muted-foreground">Professional network</p>
                  </div>
                </a>
              </div>
              
              <Button data-testid="button-follow-channels">
                Follow All Channels
              </Button>
            </div>
          </div>

          {/* Latest Updates Feed */}
          <Card data-testid="latest-updates">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold mb-6 flex items-center">
                <Rss className="text-primary mr-3" />
                Latest Updates
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Youtube className="text-red-500 w-4 h-4" />
                      <span className="text-sm text-muted-foreground">YouTube • 2 days ago</span>
                    </div>
                    <h4 className="font-semibold mb-2">Tutorial: Advanced Script Formatting</h4>
                    <p className="text-sm text-muted-foreground">Learn professional screenwriting techniques from industry veterans.</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Instagram className="text-pink-500 w-4 h-4" />
                      <span className="text-sm text-muted-foreground">Instagram • 1 week ago</span>
                    </div>
                    <h4 className="font-semibold mb-2">Behind the Scenes: Documentary</h4>
                    <p className="text-sm text-muted-foreground">Exclusive look at our latest documentary production.</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Twitter className="text-blue-400 w-4 h-4" />
                      <span className="text-sm text-muted-foreground">Twitter • 3 days ago</span>
                    </div>
                    <h4 className="font-semibold mb-2">Festival Success: 5 Awards Won!</h4>
                    <p className="text-sm text-muted-foreground">Bravo Zulu Films takes home multiple awards at the Veterans Film Festival.</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Film className="text-primary-foreground w-4 h-4" />
                </div>
                <h3 className="font-bold text-lg">Bravo Zulu Films</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Professional film studio empowering military veterans to create exceptional cinematic content.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-facebook">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-twitter">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-youtube">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Studio Tools</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Community</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Support</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Tutorials</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Industry News</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Festival Guide</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  support@bravozulufilms.com
                </li>
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  (555) 123-4567
                </li>
                <li className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Los Angeles, CA
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Bravo Zulu Films. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-muted-foreground mt-4 md:mt-0">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="max-w-md" data-testid="auth-modal">
          <DialogHeader>
            <DialogTitle>Join Bravo Zulu Films</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Military Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="your.email@military.mil"
                data-testid="input-military-email"
              />
            </div>
            <div>
              <Label htmlFor="branch">Service Branch</Label>
              <Select>
                <SelectTrigger data-testid="select-service-branch">
                  <SelectValue placeholder="Select service branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="army">Army</SelectItem>
                  <SelectItem value="navy">Navy</SelectItem>
                  <SelectItem value="air_force">Air Force</SelectItem>
                  <SelectItem value="marines">Marines</SelectItem>
                  <SelectItem value="coast_guard">Coast Guard</SelectItem>
                  <SelectItem value="space_force">Space Force</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="years">Years of Service</Label>
              <Input 
                id="years" 
                type="number" 
                placeholder="4"
                data-testid="input-years-service"
              />
            </div>
            <div>
              <Label htmlFor="bio">Brief Bio (Optional)</Label>
              <Textarea 
                id="bio" 
                placeholder="Tell us about your military background and filmmaking interests..."
                data-testid="textarea-bio"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" data-testid="checkbox-terms" />
              <Label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the Terms of Service and Privacy Policy
              </Label>
            </div>
            <Button 
              className="w-full" 
              onClick={handleLogin}
              data-testid="button-submit-application"
            >
              Submit Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3" data-testid="logo">
              <img 
                src={bravoZuluLogo} 
                alt="Bravo Zulu Films" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">Bravo Zulu Films</h1>
                <p className="text-xs text-muted-foreground">Professional Studio</p>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-foreground hover:text-primary transition-colors" data-testid="nav-home">
                Home
              </a>
              <a href="#tools" className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-tools">
                Studio Tools
              </a>
              <a href="#community" className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-community">
                Community
              </a>
              <a href="#media" className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-media">
                Media
              </a>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleLogin}
                  data-testid="button-signin"
                >
                  Sign In
                </Button>
                <Button
                  onClick={handleJoinStudio}
                  data-testid="button-join-studio"
                >
                  Join Studio
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

      {/* Hero Section */}
      <section id="home" className="pt-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background">
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/90"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Featured Logo */}
            <div className="mb-8">
              <img 
                src={bravoZuluLogo} 
                alt="Bravo Zulu Films" 
                className="w-32 h-32 md:w-48 md:h-48 object-contain mx-auto"
              />
            </div>
            
            <Badge variant="secondary" className="mb-6" data-testid="badge-studio-type">
              <Star className="w-4 h-4 text-primary mr-2" />
              Professional Film Studio for Military Veterans
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6">
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Cinematic Excellence
              </span>
              <br />
              <span className="text-primary">Built by Veterans</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
              Professional film production tools, AI-powered script writing, and a supportive community designed specifically for military veterans and their families in the creative industry.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                size="lg" 
                className="px-8 py-4" 
                onClick={handleJoinStudio}
                data-testid="button-start-creating"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Creating
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4"
                data-testid="button-watch-demo"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center" data-testid="stat-veterans">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Veteran Creators</div>
              </div>
              <div className="text-center" data-testid="stat-scripts">
                <div className="text-3xl font-bold text-primary mb-2">1,200+</div>
                <div className="text-sm text-muted-foreground">Scripts Written</div>
              </div>
              <div className="text-center" data-testid="stat-films">
                <div className="text-3xl font-bold text-primary mb-2">150+</div>
                <div className="text-sm text-muted-foreground">Films Produced</div>
              </div>
              <div className="text-center" data-testid="stat-awards">
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Festival Awards</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Tools Section */}
      <section id="tools" className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4">Professional Studio Tools</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Industry-grade creative tools designed for professional filmmakers, with AI assistance and military veteran community support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Script Editor */}
            <Card className="group hover:border-primary/50 transition-all duration-300" data-testid="card-script-editor">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Edit className="text-primary text-xl" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI Script Editor</h3>
                <p className="text-muted-foreground mb-4">Advanced text formatting, AI writing assistance, and collaborative editing tools for professional screenwriting.</p>
                <div className="flex items-center text-primary text-sm font-medium">
                  <span>Members Only</span>
                  <Lock className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>

            {/* Logo Designer */}
            <Card className="group hover:border-primary/50 transition-all duration-300" data-testid="card-logo-designer">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Palette className="text-primary text-xl" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Logo & Graphics Designer</h3>
                <p className="text-muted-foreground mb-4">AI-powered design tools for creating professional logos, posters, and marketing materials.</p>
                <div className="flex items-center text-primary text-sm font-medium">
                  <span>Members Only</span>
                  <Lock className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>

            {/* Festival Screener */}
            <Card className="group hover:border-primary/50 transition-all duration-300" data-testid="card-festival-screener">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Trophy className="text-primary text-xl" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Festival Screener</h3>
                <p className="text-muted-foreground mb-4">AI analysis to grade scripts and evaluate readiness for film festival submissions.</p>
                <div className="flex items-center text-primary text-sm font-medium">
                  <span>Members Only</span>
                  <Lock className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>

            {/* Project Management */}
            <Card className="group hover:border-primary/50 transition-all duration-300" data-testid="card-project-dashboard">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <ListTodo className="text-primary text-xl" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Project Dashboard</h3>
                <p className="text-muted-foreground mb-4">Comprehensive project management with collaboration tools, timelines, and resource tracking.</p>
                <div className="flex items-center text-primary text-sm font-medium">
                  <span>Members Only</span>
                  <Lock className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>

            {/* Creative Suite */}
            <Card className="group hover:border-primary/50 transition-all duration-300" data-testid="card-creative-suite">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <WandSparkles className="text-primary text-xl" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Creative Suite</h3>
                <p className="text-muted-foreground mb-4">Integrated tools for video editing, sound design, and post-production workflows.</p>
                <div className="flex items-center text-primary text-sm font-medium">
                  <span>Members Only</span>
                  <Lock className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>

            {/* Support App */}
            <Card className="group hover:border-primary/50 transition-all duration-300" data-testid="card-support-app">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <HandHelping className="text-primary text-xl" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Bravo Zulu Support</h3>
                <p className="text-muted-foreground mb-4">Dedicated support system connecting veterans with mentors and industry professionals.</p>
                <div className="flex items-center text-primary text-sm font-medium">
                  <span>Community Access</span>
                  <Users className="w-4 h-4 ml-2" />
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

      {/* Membership & Verification Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-serif font-bold mb-6">Exclusive Veterans Community</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join a verified community of military veterans and their families creating exceptional films. Our secure verification system ensures authentic connections and meaningful collaborations.
              </p>
              
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

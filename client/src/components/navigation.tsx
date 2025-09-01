import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/notification-bell";
import bravoZuluLogo from "@/assets/bravo-zulu-logo.jpg";
import {
  Film,
  Menu,
  X,
  Home,
  Wrench,
  Users,
  Radio,
  LogOut,
  Settings,
  User,
  Briefcase,
  CreditCard,
  Zap,
  Scissors,
  Archive,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const isAdmin = user?.email === "bravozulufilms@gmail.com";

  const navigation = [
    { name: "HOME", href: "/", icon: Home, description: "Mission Control" },
    { name: "TOOLS", href: "/tools", icon: Wrench, description: "AI Script Studio" },
    { name: "STUDIO", href: "/creative-suite", icon: Film, description: "Creative Suite" },
    { name: "PORTFOLIO", href: "/portfolio", icon: Briefcase, description: "Your Projects" },
    { name: "COMMUNITY", href: "/community", icon: Users, description: "Connect & Share" },
    { name: "MEDIA", href: "/media", icon: Radio, description: "Gallery & Files" },
    ...(isAdmin ? [{ name: "ADMIN", href: "/admin", icon: Shield, description: "Admin Control" }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group" data-testid="logo">
            <div className="relative">
              <img 
                src={bravoZuluLogo} 
                alt="Bravo Zulu Films" 
                className="w-12 h-12 object-contain ring-2 ring-yellow-600/50 rounded-lg p-1 group-hover:ring-yellow-500 transition-all"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-600 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="font-command text-xl font-bold gradient-medal-gold">BRAVO ZULU FILMS</h1>
              <p className="font-tactical text-xs text-yellow-600 tracking-wider">🎯 MILITARY STUDIO COMMAND</p>
            </div>
          </Link>

          {/* Main Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group relative flex flex-col items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-yellow-600/20 to-amber-500/20 text-yellow-400 border border-yellow-600/30"
                        : "text-slate-300 hover:text-yellow-400 hover:bg-slate-800/50 border border-transparent hover:border-yellow-600/20"
                    }`}
                    data-testid={`nav-${item.name.toLowerCase()}`}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${
                      isActive ? "text-yellow-400 drop-shadow-glow" : "group-hover:text-yellow-400"
                    }`} />
                    <span className="font-tactical text-xs tracking-wider">{item.name}</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-yellow-500 transition-colors">
                      {item.description}
                    </span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-yellow-400 rounded-full"></div>
                    )}
                  </Link>
                );
              })}

              {/* Notification Bell */}
              <NotificationBell />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 px-3 py-2 border border-yellow-600/30 hover:border-yellow-500/50 bg-slate-900/50 hover:bg-slate-800/70 transition-all" data-testid="user-menu">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-10 h-10 ring-2 ring-yellow-600/50">
                        <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                        <AvatarFallback className="bg-slate-800 text-yellow-400 font-bold">
                          {user?.firstName?.[0] || user?.email?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left min-w-0 flex-1">
                        <div className="font-tactical text-sm text-yellow-400 truncate">
                          {user?.firstName || "OPERATOR"}
                        </div>
                        {user?.role === "verified" && (
                          <Badge className="text-[10px] bg-yellow-600/20 text-yellow-400 border-yellow-600/50">
                            🏅 VERIFIED
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" data-testid="menu-profile">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {user?.role !== "verified" && (
                    <DropdownMenuItem asChild>
                      <Link href="/verification" data-testid="menu-verification">
                        <Settings className="w-4 h-4 mr-2" />
                        Get Verified
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/billing" data-testid="menu-billing">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Billing & Credits
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

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
        {isMenuOpen && isAuthenticated && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <div className="border-t border-border pt-2 mt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-primary transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

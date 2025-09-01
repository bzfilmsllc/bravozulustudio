import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Film,
  Youtube,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Rss,
  ExternalLink,
  Play,
  Calendar,
  Heart,
  MessageSquare,
  Share2,
  TrendingUp,
  Users,
  Award,
  Search,
  Filter,
} from "lucide-react";

interface SocialPost {
  id: string;
  platform: string;
  content: string;
  author: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  mediaUrl?: string;
  type: 'post' | 'video' | 'story' | 'live';
}

interface MediaMetrics {
  followers: number;
  totalViews: number;
  engagement: number;
  growthRate: number;
}

export default function Media() {
  const [activeTab, setActiveTab] = useState("updates");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  // Social media platforms with real URLs and CTAs
  const socialPlatforms = [
    {
      name: "YouTube",
      icon: Youtube,
      color: "text-red-500",
      handle: "@bravozulufilms",
      followers: "12.5K",
      description: "Film showcases & tutorials",
      metrics: { posts: 156, engagement: "8.2%" },
      url: "https://www.youtube.com/@bravozulufilms",
      cta: "Subscribe",
      ctaAction: "Subscribe for military filmmaking content!"
    },
    {
      name: "Rumble",
      icon: Play,
      color: "text-green-500",
      handle: "BravoZuluFilms",
      followers: "2.1K",
      description: "Uncensored film content",
      metrics: { posts: 47, engagement: "15.6%" },
      url: "https://rumble.com/user/BravoZuluFilms",
      cta: "Follow",
      ctaAction: "Follow for exclusive veteran stories!"
    },
    {
      name: "Instagram", 
      icon: Instagram,
      color: "text-pink-500",
      handle: "@bravozulufilms",
      followers: "8.3K",
      description: "Behind the scenes",
      metrics: { posts: 342, engagement: "12.1%" },
      url: "https://www.instagram.com/bravozulufilms",
      cta: "Follow",
      ctaAction: "Follow for behind-the-scenes content!"
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "text-blue-400", 
      handle: "@BravoZuluFilms",
      followers: "5.7K",
      description: "Industry updates",
      metrics: { posts: 1205, engagement: "6.8%" },
      url: "https://twitter.com/BravoZuluFilms",
      cta: "Follow",
      ctaAction: "Follow for industry updates!"
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "text-blue-600",
      handle: "Bravo Zulu Films",
      followers: "3.2K",
      description: "Professional network",
      metrics: { posts: 89, engagement: "15.3%" },
      url: "https://www.linkedin.com/company/bravo-zulu-films",
      cta: "Connect",
      ctaAction: "Connect for professional networking!"
    },
  ];

  const recentUpdates: SocialPost[] = [
    {
      id: "1",
      platform: "YouTube",
      content: "New Tutorial: Advanced Script Formatting - Learn professional screenwriting techniques from industry veterans. Perfect for new filmmakers!",
      author: "Bravo Zulu Films",
      timestamp: "2 days ago",
      likes: 234,
      comments: 18,
      shares: 12,
      type: "video",
    },
    {
      id: "2", 
      platform: "Instagram",
      content: "Behind the Scenes: Operation Phoenix - Exclusive look at our latest documentary production featuring 3 veteran filmmakers.",
      author: "Bravo Zulu Films", 
      timestamp: "1 week ago",
      likes: 156,
      comments: 24,
      shares: 8,
      type: "post",
    },
    {
      id: "3",
      platform: "Twitter",
      content: "🏆 Festival Success: 5 Awards Won! Bravo Zulu Films takes home multiple awards at the Veterans Film Festival. Proud of our community!",
      author: "Bravo Zulu Films",
      timestamp: "3 days ago", 
      likes: 89,
      comments: 15,
      shares: 23,
      type: "post",
    },
    {
      id: "4",
      platform: "LinkedIn",
      content: "Industry Insight: How Military Experience Translates to Film Production Leadership - New article exploring the unique skills veterans bring to creative industries.",
      author: "Bravo Zulu Films",
      timestamp: "5 days ago",
      likes: 67,
      comments: 12,
      shares: 19,
      type: "post",
    },
  ];

  const achievements = [
    {
      title: "50+ Festival Awards",
      description: "Recognition across major film festivals",
      icon: Award,
      metric: "50+",
    },
    {
      title: "500+ Veteran Creators",
      description: "Growing community of military filmmakers", 
      icon: Users,
      metric: "500+",
    },
    {
      title: "1.2M+ Total Views",
      description: "Combined social media reach",
      icon: TrendingUp,
      metric: "1.2M+",
    },
    {
      title: "150+ Films Produced",
      description: "Professional productions completed",
      icon: Film,
      metric: "150+",
    },
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "YouTube": return Youtube;
      case "Instagram": return Instagram;
      case "Twitter": return Twitter;
      case "LinkedIn": return Linkedin;
      default: return Rss;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "YouTube": return "text-red-500";
      case "Instagram": return "text-pink-500";
      case "Twitter": return "text-blue-400";
      case "LinkedIn": return "text-blue-600";
      default: return "text-muted-foreground";
    }
  };

  return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-serif font-bold mb-2">Media & Social Hub</h1>
                  <p className="text-xl text-muted-foreground">
                    Stay connected with our latest projects and community achievements
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" data-testid="button-subscribe-updates">
                    <Rss className="w-4 h-4 mr-2" />
                    Subscribe to Updates
                  </Button>
                  <Button data-testid="button-follow-all">
                    <Heart className="w-4 h-4 mr-2" />
                    Follow All Channels
                  </Button>
                </div>
              </div>

              {/* Social Media Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {socialPlatforms.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <Card 
                      key={platform.name} 
                      className="hover:border-primary/50 transition-all duration-300 cursor-pointer group"
                      onClick={() => setSelectedPlatform(platform.name)}
                      data-testid={`platform-card-${platform.name.toLowerCase()}`}
                    >
                      <CardContent className="p-4 text-center">
                        <Icon className={`w-8 h-8 ${platform.color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                        <h3 className="font-semibold text-sm">{platform.name}</h3>
                        <p className="text-primary font-bold">{platform.followers}</p>
                        <p className="text-xs text-muted-foreground">{platform.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid grid-cols-4 h-auto p-1">
                <TabsTrigger value="updates" className="flex items-center space-x-2 p-3" data-testid="tab-updates">
                  <Rss className="w-4 h-4" />
                  <span>Latest Updates</span>
                </TabsTrigger>
                <TabsTrigger value="platforms" className="flex items-center space-x-2 p-3" data-testid="tab-platforms">
                  <Users className="w-4 h-4" />
                  <span>Social Platforms</span>
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex items-center space-x-2 p-3" data-testid="tab-achievements">
                  <Award className="w-4 h-4" />
                  <span>Achievements</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center space-x-2 p-3" data-testid="tab-analytics">
                  <TrendingUp className="w-4 h-4" />
                  <span>Analytics</span>
                </TabsTrigger>
              </TabsList>

              {/* Latest Updates */}
              <TabsContent value="updates" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Rss className="w-6 h-6 text-primary mr-3" />
                        Latest Social Updates
                      </span>
                      <div className="flex items-center space-x-2">
                        <Input 
                          placeholder="Search updates..." 
                          className="w-64"
                          data-testid="input-search-updates"
                        />
                        <Button variant="outline" size="icon">
                          <Search className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Filter className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {recentUpdates.map((update) => {
                        const PlatformIcon = getPlatformIcon(update.platform);
                        const platformColor = getPlatformColor(update.platform);
                        
                        return (
                          <Card key={update.id} className="hover:border-primary/50 transition-all" data-testid={`update-${update.id}`}>
                            <CardContent className="p-6">
                              <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                                    <PlatformIcon className={`w-6 h-6 ${platformColor}`} />
                                  </div>
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <Badge variant="outline" className="text-xs">
                                        {update.platform}
                                      </Badge>
                                      <span className="text-sm font-medium">{update.author}</span>
                                      <span className="text-xs text-muted-foreground">{update.timestamp}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" data-testid={`button-view-update-${update.id}`}>
                                      <ExternalLink className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  
                                  <p className="text-muted-foreground mb-4">{update.content}</p>
                                  
                                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                      <Heart className="w-4 h-4" />
                                      <span>{update.likes}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <MessageSquare className="w-4 h-4" />
                                      <span>{update.comments}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Share2 className="w-4 h-4" />
                                      <span>{update.shares}</span>
                                    </div>
                                    {update.type === "video" && (
                                      <div className="flex items-center space-x-1">
                                        <Play className="w-4 h-4" />
                                        <span>Video</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    
                    <div className="mt-8 text-center">
                      <Button variant="outline" data-testid="button-load-more">
                        Load More Updates
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Social Platforms */}
              <TabsContent value="platforms" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-8">
                  {socialPlatforms.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <Card key={platform.name} className="hover:border-primary/50 transition-all" data-testid={`platform-detail-${platform.name.toLowerCase()}`}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Icon className={`w-8 h-8 ${platform.color}`} />
                              <div>
                                <h3 className="text-xl font-semibold">{platform.name}</h3>
                                <p className="text-sm text-muted-foreground">{platform.handle}</p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              asChild
                              data-testid={`button-follow-${platform.name.toLowerCase()}`}
                            >
                              <a href={platform.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                {platform.cta}
                              </a>
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">{platform.followers}</div>
                              <div className="text-xs text-muted-foreground">Followers</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">{platform.metrics.posts}</div>
                              <div className="text-xs text-muted-foreground">Posts</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">{platform.metrics.engagement}</div>
                              <div className="text-xs text-muted-foreground">Engagement</div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">{platform.description}</p>
                          <p className="text-sm text-primary/80 mb-4 font-medium">💡 {platform.ctaAction}</p>
                          
                          <div className="bg-secondary/30 rounded-lg p-4">
                            <h4 className="font-semibold text-sm mb-2">Recent Activity</h4>
                            <div className="space-y-2">
                              <div className="text-xs text-muted-foreground">
                                Latest post: {
                                  recentUpdates.find(u => u.platform === platform.name)?.timestamp || "No recent posts"
                                }
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Content focus: {platform.description}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Achievements */}
              <TabsContent value="achievements" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="w-6 h-6 text-primary mr-3" />
                      Community Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      {achievements.map((achievement) => {
                        const Icon = achievement.icon;
                        return (
                          <Card key={achievement.title} className="text-center hover:border-primary/50 transition-all" data-testid={`achievement-${achievement.title.toLowerCase().replace(/\s+/g, '-')}`}>
                            <CardContent className="p-6">
                              <Icon className="w-12 h-12 text-primary mx-auto mb-4" />
                              <div className="text-3xl font-bold text-primary mb-2">{achievement.metric}</div>
                              <h3 className="font-semibold mb-2">{achievement.title}</h3>
                              <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {/* Featured Achievement */}
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-8 text-center">
                        <Award className="w-16 h-16 text-primary mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold mb-4">Latest Recognition</h3>
                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                          Bravo Zulu Films was recently recognized at the Veterans Film Festival for excellence in 
                          supporting military veteran filmmakers and fostering creative community development.
                        </p>
                        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>December 2024</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Award className="w-4 h-4" />
                            <span>Excellence Award</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics */}
              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-6 h-6 text-primary mr-3" />
                      Social Media Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <Card className="text-center" data-testid="analytics-total-followers">
                        <CardContent className="p-6">
                          <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                          <div className="text-2xl font-bold text-primary">29.7K</div>
                          <p className="text-sm text-muted-foreground">Total Followers</p>
                        </CardContent>
                      </Card>

                      <Card className="text-center" data-testid="analytics-monthly-reach">
                        <CardContent className="p-6">
                          <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                          <div className="text-2xl font-bold text-primary">156.8K</div>
                          <p className="text-sm text-muted-foreground">Monthly Reach</p>
                        </CardContent>
                      </Card>

                      <Card className="text-center" data-testid="analytics-engagement-rate">
                        <CardContent className="p-6">
                          <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
                          <div className="text-2xl font-bold text-primary">10.6%</div>
                          <p className="text-sm text-muted-foreground">Engagement Rate</p>
                        </CardContent>
                      </Card>

                      <Card className="text-center" data-testid="analytics-growth-rate">
                        <CardContent className="p-6">
                          <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                          <div className="text-2xl font-bold text-primary">+12.3%</div>
                          <p className="text-sm text-muted-foreground">Monthly Growth</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Platform Performance */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Platform Performance</h3>
                      {socialPlatforms.map((platform) => {
                        const Icon = platform.icon;
                        return (
                          <Card key={platform.name} data-testid={`analytics-${platform.name.toLowerCase()}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Icon className={`w-6 h-6 ${platform.color}`} />
                                  <div>
                                    <h4 className="font-semibold">{platform.name}</h4>
                                    <p className="text-sm text-muted-foreground">{platform.followers} followers</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-primary">{platform.metrics.engagement}</div>
                                  <p className="text-xs text-muted-foreground">Engagement</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {/* Growth Chart Placeholder */}
                    <Card className="mt-8">
                      <CardHeader>
                        <CardTitle className="text-lg">Growth Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                              Advanced analytics dashboard coming soon
                            </p>
                            <Button variant="outline" className="mt-4" data-testid="button-notify-analytics">
                              Get Notified
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Call to Action */}
            <Card className="mt-12 bg-primary/5 border-primary/20" data-testid="cta-social-follow">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  {socialPlatforms.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <a 
                        key={platform.name} 
                        href={platform.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-background rounded-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer hover:bg-primary/10 border hover:border-primary/50"
                        title={platform.ctaAction}
                      >
                        <Icon className={`w-6 h-6 ${platform.color}`} />
                      </a>
                    );
                  })}
                </div>
                <h3 className="text-2xl font-semibold mb-4">Stay Connected with Bravo Zulu Films</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  🎖️ Follow us on YouTube & Rumble for exclusive veteran filmmaking content<br/>
                  📸 Subscribe for behind-the-scenes footage and industry insights<br/>
                  🚀 Connect with our growing community of military storytellers
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button size="lg" asChild className="bg-red-600 hover:bg-red-700" data-testid="button-youtube-subscribe">
                    <a href="https://www.youtube.com/@bravozulufilms" target="_blank" rel="noopener noreferrer">
                      <Youtube className="w-5 h-5 mr-2" />
                      Subscribe on YouTube
                    </a>
                  </Button>
                  <Button size="lg" asChild className="bg-green-600 hover:bg-green-700" data-testid="button-rumble-follow">
                    <a href="https://rumble.com/user/BravoZuluFilms" target="_blank" rel="noopener noreferrer">
                      <Play className="w-5 h-5 mr-2" />
                      Follow on Rumble
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
  );
}

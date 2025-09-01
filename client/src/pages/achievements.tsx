import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, Star, Award, Crown, Heart, Zap, Users, Shield, 
  FileText, BookOpen, Clapperboard, Anchor, Users2, UserPlus,
  Lock, CheckCircle, Clock, Cpu, ShoppingCart, Medal
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Icon mapping for achievements
const iconMap = {
  Trophy, Star, Award, Crown, Heart, Zap, Users, Shield,
  FileText, BookOpen, Clapperboard, Anchor, Users2, UserPlus,
  Cpu, ShoppingCart, Medal
};

export default function Achievements() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/achievements/stats"],
  });

  const { data: userAchievements, isLoading: userAchievementsLoading } = useQuery({
    queryKey: ["/api/achievements/user"],
  });

  const { data: allAchievements, isLoading: allAchievementsLoading } = useQuery({
    queryKey: ["/api/achievements"],
  });

  const { data: userTier, isLoading: tierLoading } = useQuery({
    queryKey: ["/api/user/tier"],
  });

  const { data: spendingTiers, isLoading: spendingTiersLoading } = useQuery({
    queryKey: ["/api/spending-tiers"],
  });

  if (statsLoading || userAchievementsLoading || allAchievementsLoading || tierLoading || spendingTiersLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const unlockedAchievementIds = new Set((userAchievements as any[])?.map((ua: any) => ua.achievementId) || []);
  const categories = ["all", "spending", "supporter", "content", "social", "special", "veteran"];

  const filteredAchievements = (allAchievements as any[])?.filter((achievement: any) => 
    selectedCategory === "all" || achievement.category === selectedCategory
  ) || [];

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent || Trophy;
  };

  const getProgressToNextTier = () => {
    if (!(userTier as any)?.spending || !spendingTiers) return null;
    
    const currentSpent = (userTier as any).spending.totalCreditsSpent;
    const currentTier = (userTier as any).currentTier;
    
    if (!currentTier) {
      const firstTier = (spendingTiers as any[])[0];
      return {
        current: currentSpent,
        target: firstTier?.minSpend || 0,
        nextTierName: firstTier?.name || "Supporter"
      };
    }
    
    const nextTier = (spendingTiers as any[]).find((tier: any) => tier.minSpend > currentSpent);
    if (!nextTier) {
      return null; // Already at max tier
    }
    
    return {
      current: currentSpent,
      target: nextTier.minSpend,
      nextTierName: nextTier.name
    };
  };

  const progressToNext = getProgressToNextTier();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-heading gradient-gold mb-4">
            ACHIEVEMENT CENTER
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Track your progress, unlock rewards, and showcase your contributions to the veteran filmmaker community.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                {(stats as any)?.unlockedAchievements || 0}
              </div>
              <div className="text-sm text-amber-600 dark:text-amber-400">
                Achievements Unlocked
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Medal className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold">
                {(stats as any)?.totalAchievements || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Available
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <div className="text-2xl font-bold">
                {(stats as any)?.totalSpent || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Credits Spent
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              {(stats as any)?.currentTier ? (
                <>
                  {(() => {
                    const IconComponent = getIconComponent((stats as any).currentTier.badgeIcon);
                    return <IconComponent className={`w-8 h-8 ${(stats as any).currentTier.badgeColor} mx-auto mb-3`} />;
                  })()}
                  <div className="text-2xl font-bold">
                    {(stats as any).currentTier.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Current Tier
                  </div>
                </>
              ) : (
                <>
                  <Heart className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold">
                    New Member
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Current Tier
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Progress to Next Tier */}
        {progressToNext && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Progress to {progressToNext.nextTierName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{progressToNext.current} credits spent</span>
                  <span>{progressToNext.target} credits needed</span>
                </div>
                <Progress 
                  value={(progressToNext.current / progressToNext.target) * 100} 
                  className="h-3"
                />
                <div className="text-sm text-muted-foreground">
                  {progressToNext.target - progressToNext.current} more credits to unlock {progressToNext.nextTierName} tier
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Achievements */}
        {(stats as any)?.recentAchievements && (stats as any).recentAchievements.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(stats as any).recentAchievements.map((userAchievement: any) => {
                  const IconComponent = getIconComponent(userAchievement.achievement.badgeIcon);
                  return (
                    <div key={userAchievement.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="relative">
                        <IconComponent className={`w-8 h-8 ${userAchievement.achievement.badgeColor}`} />
                        <CheckCircle className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{userAchievement.achievement.name}</h4>
                        <p className="text-sm text-muted-foreground">{userAchievement.achievement.description}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(userAchievement.unlockedAt), { addSuffix: true })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievement Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="spending">Spending</TabsTrigger>
            <TabsTrigger value="supporter">Supporter</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="special">Special</TabsTrigger>
            <TabsTrigger value="veteran">Veteran</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement: any) => {
                const isUnlocked = unlockedAchievementIds.has(achievement.id);
                const IconComponent = getIconComponent(achievement.badgeIcon);
                
                return (
                  <Card 
                    key={achievement.id} 
                    className={`relative overflow-hidden transition-all duration-300 ${
                      isUnlocked 
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 hover:shadow-lg' 
                        : 'hover:shadow-md opacity-75'
                    }`}
                    data-testid={`achievement-card-${achievement.id}`}
                  >
                    {isUnlocked && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                    )}
                    
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`relative ${isUnlocked ? '' : 'opacity-50'}`}>
                          <IconComponent className={`w-10 h-10 ${achievement.badgeColor}`} />
                          {!isUnlocked && (
                            <Lock className="w-4 h-4 text-muted-foreground absolute -bottom-1 -right-1" />
                          )}
                        </div>
                        <div>
                          <CardTitle className={`text-lg ${isUnlocked ? '' : 'text-muted-foreground'}`}>
                            {achievement.name}
                          </CardTitle>
                          <Badge variant={isUnlocked ? "default" : "secondary"} className="mt-1">
                            {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className={`text-sm mb-4 ${isUnlocked ? '' : 'text-muted-foreground'}`}>
                        {achievement.description}
                      </p>
                      
                      {achievement.requirement && (
                        <div className="text-xs text-muted-foreground">
                          <strong>Requirement:</strong> {achievement.requirement.type.replace('_', ' ')} - {achievement.requirement.amount}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}